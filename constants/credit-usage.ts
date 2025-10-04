/**
 * Credit Usage Constants
 * Centralized configuration for tool credit costs and categories
 */

export interface ToolCreditConfig {
  credits: number;
  category: string;
  description?: string;
}

export const CREDIT_USAGE: Record<string, ToolCreditConfig> = {
  // SEO Analysis Tools
  'page-speed-test': {
    credits: 1,
    category: 'seo',
    description: 'Page speed analysis with performance metrics'
  },
  'ssl-checker': {
    credits: 1,
    category: 'security',
    description: 'SSL certificate analysis and security check'
  },
  'website-seo-score-checker': {
    credits: 2,
    category: 'seo',
    description: 'Comprehensive SEO analysis with recommendations'
  },
  'google-index-checker': {
    credits: 1,
    category: 'seo',
    description: 'Google indexing status and sitemap analysis'
  },
  'meta-tag-generator': {
    credits: 1,
    category: 'seo',
    description: 'AI-powered meta tag generation and optimization'
  },
  'backlink-checker': {
    credits: 2,
    category: 'seo',
    description: 'Backlink analysis and quality assessment'
  },
  'valuable-backlink-checker': {
    credits: 2,
    category: 'seo',
    description: 'High-value backlink identification and analysis'
  },
  'website-link-count-checker': {
    credits: 1,
    category: 'seo',
    description: 'Internal and external link count analysis'
  },
  'anchor-text-distribution': {
    credits: 1,
    category: 'seo',
    description: 'Anchor text distribution analysis'
  },

  // Keyword Research Tools
  'keyword-research': {
    credits: 2,
    category: 'keyword',
    description: 'Comprehensive keyword research and analysis'
  },
  'keyword-competition': {
    credits: 1,
    category: 'keyword',
    description: 'Keyword competition analysis'
  },
  'seo-keyword-competition-analysis': {
    credits: 2,
    category: 'keyword',
    description: 'Advanced SEO keyword competition analysis'
  },
  'live-keyword-analyzer': {
    credits: 1,
    category: 'keyword',
    description: 'Real-time keyword performance analysis'
  },
  'long-tail-keyword-suggestion': {
    credits: 1,
    category: 'keyword',
    description: 'Long-tail keyword suggestions and analysis'
  },

  // Content Tools
  'ai-content-detector': {
    credits: 1,
    category: 'content',
    description: 'AI-generated content detection'
  },
  'plagiarism': {
    credits: 2,
    category: 'content',
    description: 'Plagiarism detection and originality check'
  },
  'grammar-check': {
    credits: 1,
    category: 'content',
    description: 'Grammar and spelling check'
  },
  'sentence-checker': {
    credits: 1,
    category: 'content',
    description: 'Sentence structure and clarity analysis'
  },
  'sentence-rephraser': {
    credits: 1,
    category: 'content',
    description: 'AI-powered sentence rephrasing'
  },
  'paraphrase': {
    credits: 1,
    category: 'content',
    description: 'Text paraphrasing and rewriting'
  },
  'article-rewriter': {
    credits: 2,
    category: 'content',
    description: 'Complete article rewriting and optimization'
  },
  'essay-rewriter': {
    credits: 2,
    category: 'content',
    description: 'Essay rewriting and improvement'
  },
  'text-summarize': {
    credits: 1,
    category: 'content',
    description: 'Text summarization and key points extraction'
  },
  'online-proofreader': {
    credits: 1,
    category: 'content',
    description: 'Professional proofreading and editing'
  },

  // Link Building Tools
  'backlink-maker': {
    credits: 3,
    category: 'link-building',
    description: 'Backlink opportunity identification and outreach'
  }
};

/**
 * Get credit configuration for a tool
 */
export function getToolCreditConfig(toolName: string): ToolCreditConfig | null {
  return CREDIT_USAGE[toolName] || null;
}

/**
 * Get credit cost for a tool
 */
export function getToolCreditCost(toolName: string): number {
  const config = getToolCreditConfig(toolName);
  return config ? config.credits : 1; // Default to 1 credit if not found
}

/**
 * Get tool category
 */
export function getToolCategory(toolName: string): string {
  const config = getToolCreditConfig(toolName);
  return config ? config.category : 'general'; // Default category
}

/**
 * Get all tools by category
 */
export function getToolsByCategory(category: string): string[] {
  return Object.keys(CREDIT_USAGE).filter(
    toolName => CREDIT_USAGE[toolName].category === category
  );
}

/**
 * Get all available categories
 */
export function getAllCategories(): string[] {
  const categories = new Set(
    Object.values(CREDIT_USAGE).map(config => config.category)
  );
  return Array.from(categories);
}

/**
 * Validate if a tool exists in the credit system
 */
export function isValidTool(toolName: string): boolean {
  return toolName in CREDIT_USAGE;
}