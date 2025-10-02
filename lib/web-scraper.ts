import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

export interface ScrapedPageData {
  url: string;
  title: string;
  metaDescription: string;
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
  };
  content: string;
  wordCount: number;
  links: {
    internal: Array<{ url: string; text: string; title?: string }>;
    external: Array<{ url: string; text: string; title?: string; domain: string }>;
  };
  images: Array<{ src: string; alt: string; title?: string }>;
  keywords: string[];
  loadTime: number;
  statusCode: number;
}

export interface LinkAnalysis {
  totalLinks: number;
  internalLinks: number;
  externalLinks: number;
  brokenLinks: string[];
  linksByDomain: Record<string, number>;
  linksByPath: Record<string, number>;
  linkDistribution: {
    navigation: number;
    content: number;
    footer: number;
    sidebar: number;
  };
}

export interface BacklinkData {
  url: string;
  domain: string;
  anchorText: string;
  linkType: 'dofollow' | 'nofollow';
  context: string;
  pageTitle: string;
  domainAuthority?: number;
  pageAuthority?: number;
}

export class WebScraper {
  private static readonly USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
  private static readonly TIMEOUT = 30000;

  /**
   * Scrape a webpage using Cheerio (faster, for static content)
   */
  static async scrapeWithCheerio(url: string): Promise<ScrapedPageData> {
    const startTime = Date.now();
    
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
        },
        timeout: this.TIMEOUT,
        maxRedirects: 5,
      });

      const $ = cheerio.load(response.data);
      const loadTime = Date.now() - startTime;

      // Extract basic page data
      const title = $('title').text().trim();
      const metaDescription = $('meta[name="description"]').attr('content') || '';
      
      // Extract headings
      const headings = {
        h1: $('h1').map((_, el) => $(el).text().trim()).get(),
        h2: $('h2').map((_, el) => $(el).text().trim()).get(),
        h3: $('h3').map((_, el) => $(el).text().trim()).get(),
      };

      // Extract content
      const content = $('body').text().replace(/\s+/g, ' ').trim();
      const wordCount = content.split(/\s+/).length;

      // Extract links
      const links = this.extractLinks($, url);

      // Extract images
      const images = $('img').map((_, el) => ({
        src: $(el).attr('src') || '',
        alt: $(el).attr('alt') || '',
        title: $(el).attr('title'),
      })).get();

      // Extract keywords from content and meta tags
      const keywords = this.extractKeywords($, content);

      return {
        url,
        title,
        metaDescription,
        headings,
        content: content.substring(0, 5000), // Limit content length
        wordCount,
        links,
        images,
        keywords,
        loadTime,
        statusCode: response.status,
      };
    } catch (error) {
      console.error('Error scraping with Cheerio:', error);
      throw new Error(`Failed to scrape ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Scrape a webpage using Puppeteer (for dynamic content)
   */
  static async scrapeWithPuppeteer(url: string): Promise<ScrapedPageData> {
    const startTime = Date.now();
    let browser;

    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      });

      const page = await browser.newPage();
      await page.setUserAgent(this.USER_AGENT);
      
      const response = await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: this.TIMEOUT,
      });

      const loadTime = Date.now() - startTime;

      // Extract page data using page.evaluate
      const pageData = await page.evaluate(() => {
        const title = document.title;
        const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
        
        const headings = {
          h1: Array.from(document.querySelectorAll('h1')).map(el => el.textContent?.trim() || ''),
          h2: Array.from(document.querySelectorAll('h2')).map(el => el.textContent?.trim() || ''),
          h3: Array.from(document.querySelectorAll('h3')).map(el => el.textContent?.trim() || ''),
        };

        const content = document.body.textContent?.replace(/\s+/g, ' ').trim() || '';
        const wordCount = content.split(/\s+/).length;

        const images = Array.from(document.querySelectorAll('img')).map(img => ({
          src: img.src,
          alt: img.alt,
          title: img.title,
        }));

        return {
          title,
          metaDescription,
          headings,
          content: content.substring(0, 5000),
          wordCount,
          images,
        };
      });

      // Extract links using Puppeteer
      const links = await this.extractLinksWithPuppeteer(page, url);

      // Extract keywords
      const keywords = this.extractKeywordsFromText(pageData.content);

      await browser.close();

      return {
        url,
        ...pageData,
        links,
        keywords,
        loadTime,
        statusCode: response?.status() || 200,
      };
    } catch (error) {
      if (browser) await browser.close();
      console.error('Error scraping with Puppeteer:', error);
      throw new Error(`Failed to scrape ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Analyze links on a webpage
   */
  static async analyzeLinkStructure(url: string): Promise<LinkAnalysis> {
    try {
      const pageData = await this.scrapeWithCheerio(url);
      const { links } = pageData;

      const totalLinks = links.internal.length + links.external.length;
      const internalLinks = links.internal.length;
      const externalLinks = links.external.length;

      // Check for broken links (simplified check)
      const brokenLinks: string[] = [];
      
      // Count links by domain
      const linksByDomain: Record<string, number> = {};
      links.external.forEach(link => {
        linksByDomain[link.domain] = (linksByDomain[link.domain] || 0) + 1;
      });

      // Count links by internal path
      const linksByPath: Record<string, number> = {};
      links.internal.forEach(link => {
        try {
          const path = new URL(link.url).pathname;
          linksByPath[path] = (linksByPath[path] || 0) + 1;
        } catch (e) {
          // Invalid URL, skip
        }
      });

      // Analyze link distribution (simplified)
      const linkDistribution = {
        navigation: Math.floor(totalLinks * 0.2), // Estimate
        content: Math.floor(totalLinks * 0.6),
        footer: Math.floor(totalLinks * 0.15),
        sidebar: Math.floor(totalLinks * 0.05),
      };

      return {
        totalLinks,
        internalLinks,
        externalLinks,
        brokenLinks,
        linksByDomain,
        linksByPath,
        linkDistribution,
      };
    } catch (error) {
      console.error('Error analyzing link structure:', error);
      throw error;
    }
  }

  /**
   * Find backlinks to a domain (simplified simulation)
   */
  static async findBacklinks(domain: string, searchQueries: string[]): Promise<BacklinkData[]> {
    // This is a simplified simulation. In a real implementation, you would:
    // 1. Use SEO APIs like Ahrefs, SEMrush, or Moz
    // 2. Scrape search engines (with proper rate limiting)
    // 3. Use specialized backlink databases
    
    const backlinks: BacklinkData[] = [];
    
    // Simulate finding backlinks
    const simulatedBacklinks = [
      {
        url: `https://example.com/article-about-${domain.replace('.', '-')}`,
        domain: 'example.com',
        anchorText: `Visit ${domain}`,
        linkType: 'dofollow' as const,
        context: `This is a great resource from ${domain} that provides valuable information.`,
        pageTitle: `Article about ${domain}`,
        domainAuthority: 65,
        pageAuthority: 45,
      },
      {
        url: `https://blog.sample.org/review-of-${domain}`,
        domain: 'blog.sample.org',
        anchorText: domain,
        linkType: 'nofollow' as const,
        context: `We recommend checking out ${domain} for more details.`,
        pageTitle: `Review of ${domain}`,
        domainAuthority: 72,
        pageAuthority: 38,
      },
    ];

    return simulatedBacklinks;
  }

  /**
   * Extract links from a Cheerio instance
   */
  private static extractLinks($: cheerio.CheerioAPI, baseUrl: string) {
    const internal: Array<{ url: string; text: string; title?: string }> = [];
    const external: Array<{ url: string; text: string; title?: string; domain: string }> = [];
    
    const baseDomain = new URL(baseUrl).hostname;

    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim();
      const title = $(el).attr('title');

      if (!href) return;

      try {
        const absoluteUrl = new URL(href, baseUrl).href;
        const linkDomain = new URL(absoluteUrl).hostname;

        const linkData = { url: absoluteUrl, text, title };

        if (linkDomain === baseDomain) {
          internal.push(linkData);
        } else {
          external.push({ ...linkData, domain: linkDomain });
        }
      } catch (e) {
        // Invalid URL, skip
      }
    });

    return { internal, external };
  }

  /**
   * Extract links using Puppeteer
   */
  private static async extractLinksWithPuppeteer(page: any, baseUrl: string) {
    return await page.evaluate((baseUrl: string) => {
      const internal: Array<{ url: string; text: string; title?: string }> = [];
      const external: Array<{ url: string; text: string; title?: string; domain: string }> = [];
      
      const baseDomain = new URL(baseUrl).hostname;

      document.querySelectorAll('a[href]').forEach(el => {
        const href = el.getAttribute('href');
        const text = el.textContent?.trim() || '';
        const title = el.getAttribute('title') || undefined;

        if (!href) return;

        try {
          const absoluteUrl = new URL(href, baseUrl).href;
          const linkDomain = new URL(absoluteUrl).hostname;

          const linkData = { url: absoluteUrl, text, title };

          if (linkDomain === baseDomain) {
            internal.push(linkData);
          } else {
            external.push({ ...linkData, domain: linkDomain });
          }
        } catch (e) {
          // Invalid URL, skip
        }
      });

      return { internal, external };
    }, baseUrl);
  }

  /**
   * Extract keywords from page content and meta tags
   */
  private static extractKeywords($: cheerio.CheerioAPI, content: string): string[] {
    const keywords: Set<string> = new Set();

    // Extract from meta keywords
    const metaKeywords = $('meta[name="keywords"]').attr('content');
    if (metaKeywords) {
      metaKeywords.split(',').forEach(keyword => {
        keywords.add(keyword.trim().toLowerCase());
      });
    }

    // Extract from content (simple keyword extraction)
    const words = content.toLowerCase().match(/\b\w{3,}\b/g) || [];
    const wordFreq: Record<string, number> = {};
    
    words.forEach(word => {
      if (word.length > 3 && !this.isStopWord(word)) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    // Get top keywords by frequency
    const topKeywords = Object.entries(wordFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([word]) => word);

    topKeywords.forEach(keyword => keywords.add(keyword));

    return Array.from(keywords);
  }

  /**
   * Extract keywords from text content
   */
  private static extractKeywordsFromText(content: string): string[] {
    const words = content.toLowerCase().match(/\b\w{3,}\b/g) || [];
    const wordFreq: Record<string, number> = {};
    
    words.forEach(word => {
      if (word.length > 3 && !this.isStopWord(word)) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    return Object.entries(wordFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([word]) => word);
  }

  /**
   * Check if a word is a stop word
   */
  private static isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
      'between', 'among', 'this', 'that', 'these', 'those', 'i', 'me', 'my', 'myself', 'we',
      'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him',
      'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them',
      'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these',
      'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
      'having', 'do', 'does', 'did', 'doing', 'will', 'would', 'should', 'could', 'can', 'may',
      'might', 'must', 'shall', 'should', 'ought'
    ]);
    
    return stopWords.has(word);
  }
}