'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Download, Eye, Code, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface MetaTagData {
  title: string;
  description: string;
  keywords: string;
  author: string;
  robots: string;
  canonical: string;
  og_title: string;
  og_description: string;
  og_image: string;
  og_url: string;
  og_type: string;
  og_site_name: string;
  twitter_card: string;
  twitter_title: string;
  twitter_description: string;
  twitter_image: string;
  twitter_site: string;
  twitter_creator: string;
  schema_type: string;
  schema_data: any;
  additional_tags: Array<{
    name: string;
    content: string;
    property?: string;
  }>;
}

interface MetaTagResult {
  basic_meta: string;
  open_graph: string;
  twitter_cards: string;
  structured_data: string;
  complete_html: string;
  seo_score: number;
  recommendations: Array<{
    type: string;
    message: string;
    priority: string;
  }>;
  preview: {
    google: {
      title: string;
      description: string;
      url: string;
    };
    facebook: {
      title: string;
      description: string;
      image: string;
    };
    twitter: {
      title: string;
      description: string;
      image: string;
    };
  };
}

export default function MetaTagGenerator() {
  const [formData, setFormData] = useState<MetaTagData>({
    title: '',
    description: '',
    keywords: '',
    author: '',
    robots: 'index, follow',
    canonical: '',
    og_title: '',
    og_description: '',
    og_image: '',
    og_url: '',
    og_type: 'website',
    og_site_name: '',
    twitter_card: 'summary_large_image',
    twitter_title: '',
    twitter_description: '',
    twitter_image: '',
    twitter_site: '',
    twitter_creator: '',
    schema_type: 'WebSite',
    schema_data: {},
    additional_tags: []
  });
  const [result, setResult] = useState<MetaTagResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [vendor, setVendor] = useState<'gemini' | 'openai'>('gemini');

  const handleInputChange = (field: keyof MetaTagData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateMetaTags = async () => {
    if (!formData.title || !formData.description) {
      toast.error('Title and description are required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/meta-tag-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          vendor
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate meta tags');
      }

      const data = await response.json();
      setResult(data);
      toast.success('Meta tags generated successfully!');
    } catch (error) {
      console.error('Error generating meta tags:', error);
      toast.error('Failed to generate meta tags');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };

  const downloadHTML = () => {
    if (!result) return;
    
    const blob = new Blob([result.complete_html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meta-tags.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('HTML file downloaded!');
  };

  const autoFillFromTitle = () => {
    if (formData.title) {
      setFormData(prev => ({
        ...prev,
        og_title: prev.og_title || prev.title,
        twitter_title: prev.twitter_title || prev.title
      }));
    }
  };

  const autoFillFromDescription = () => {
    if (formData.description) {
      setFormData(prev => ({
        ...prev,
        og_description: prev.og_description || prev.description,
        twitter_description: prev.twitter_description || prev.description
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
            <Code className="h-8 w-8 text-blue-600" />
            Meta Tag Generator
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Generate comprehensive meta tags for better SEO and social media sharing
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Meta Tag Configuration
                </CardTitle>
                <CardDescription>
                  Fill in the details to generate optimized meta tags
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-4 mb-6">
                  <div className="flex-1">
                    <Label htmlFor="vendor">AI Vendor</Label>
                    <Select value={vendor} onValueChange={(value: 'gemini' | 'openai') => setVendor(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gemini">Gemini</SelectItem>
                        <SelectItem value="openai">OpenAI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="basic">Basic</TabsTrigger>
                    <TabsTrigger value="social">Social</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                    <TabsTrigger value="schema">Schema</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4">
                    <div>
                      <Label htmlFor="title">Page Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Enter page title (50-60 characters)"
                        maxLength={60}
                        onBlur={autoFillFromTitle}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        {formData.title.length}/60 characters
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="description">Meta Description *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Enter meta description (150-160 characters)"
                        maxLength={160}
                        rows={3}
                        onBlur={autoFillFromDescription}
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        {formData.description.length}/160 characters
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="keywords">Keywords</Label>
                      <Input
                        id="keywords"
                        value={formData.keywords}
                        onChange={(e) => handleInputChange('keywords', e.target.value)}
                        placeholder="keyword1, keyword2, keyword3"
                      />
                    </div>

                    <div>
                      <Label htmlFor="author">Author</Label>
                      <Input
                        id="author"
                        value={formData.author}
                        onChange={(e) => handleInputChange('author', e.target.value)}
                        placeholder="Author name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="robots">Robots</Label>
                      <Select value={formData.robots} onValueChange={(value) => handleInputChange('robots', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="index, follow">index, follow</SelectItem>
                          <SelectItem value="noindex, nofollow">noindex, nofollow</SelectItem>
                          <SelectItem value="index, nofollow">index, nofollow</SelectItem>
                          <SelectItem value="noindex, follow">noindex, follow</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="canonical">Canonical URL</Label>
                      <Input
                        id="canonical"
                        value={formData.canonical}
                        onChange={(e) => handleInputChange('canonical', e.target.value)}
                        placeholder="https://example.com/page"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="social" className="space-y-4">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">Open Graph (Facebook)</h4>
                      
                      <div>
                        <Label htmlFor="og_title">OG Title</Label>
                        <Input
                          id="og_title"
                          value={formData.og_title}
                          onChange={(e) => handleInputChange('og_title', e.target.value)}
                          placeholder="Open Graph title"
                        />
                      </div>

                      <div>
                        <Label htmlFor="og_description">OG Description</Label>
                        <Textarea
                          id="og_description"
                          value={formData.og_description}
                          onChange={(e) => handleInputChange('og_description', e.target.value)}
                          placeholder="Open Graph description"
                          rows={2}
                        />
                      </div>

                      <div>
                        <Label htmlFor="og_image">OG Image URL</Label>
                        <Input
                          id="og_image"
                          value={formData.og_image}
                          onChange={(e) => handleInputChange('og_image', e.target.value)}
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>

                      <div>
                        <Label htmlFor="og_url">OG URL</Label>
                        <Input
                          id="og_url"
                          value={formData.og_url}
                          onChange={(e) => handleInputChange('og_url', e.target.value)}
                          placeholder="https://example.com/page"
                        />
                      </div>

                      <div>
                        <Label htmlFor="og_type">OG Type</Label>
                        <Select value={formData.og_type} onValueChange={(value) => handleInputChange('og_type', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="website">Website</SelectItem>
                            <SelectItem value="article">Article</SelectItem>
                            <SelectItem value="product">Product</SelectItem>
                            <SelectItem value="profile">Profile</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="og_site_name">OG Site Name</Label>
                        <Input
                          id="og_site_name"
                          value={formData.og_site_name}
                          onChange={(e) => handleInputChange('og_site_name', e.target.value)}
                          placeholder="Site name"
                        />
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                      <h4 className="font-semibold text-gray-900">Twitter Cards</h4>
                      
                      <div>
                        <Label htmlFor="twitter_card">Twitter Card Type</Label>
                        <Select value={formData.twitter_card} onValueChange={(value) => handleInputChange('twitter_card', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="summary">Summary</SelectItem>
                            <SelectItem value="summary_large_image">Summary Large Image</SelectItem>
                            <SelectItem value="app">App</SelectItem>
                            <SelectItem value="player">Player</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="twitter_title">Twitter Title</Label>
                        <Input
                          id="twitter_title"
                          value={formData.twitter_title}
                          onChange={(e) => handleInputChange('twitter_title', e.target.value)}
                          placeholder="Twitter title"
                        />
                      </div>

                      <div>
                        <Label htmlFor="twitter_description">Twitter Description</Label>
                        <Textarea
                          id="twitter_description"
                          value={formData.twitter_description}
                          onChange={(e) => handleInputChange('twitter_description', e.target.value)}
                          placeholder="Twitter description"
                          rows={2}
                        />
                      </div>

                      <div>
                        <Label htmlFor="twitter_image">Twitter Image URL</Label>
                        <Input
                          id="twitter_image"
                          value={formData.twitter_image}
                          onChange={(e) => handleInputChange('twitter_image', e.target.value)}
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>

                      <div>
                        <Label htmlFor="twitter_site">Twitter Site</Label>
                        <Input
                          id="twitter_site"
                          value={formData.twitter_site}
                          onChange={(e) => handleInputChange('twitter_site', e.target.value)}
                          placeholder="@username"
                        />
                      </div>

                      <div>
                        <Label htmlFor="twitter_creator">Twitter Creator</Label>
                        <Input
                          id="twitter_creator"
                          value={formData.twitter_creator}
                          onChange={(e) => handleInputChange('twitter_creator', e.target.value)}
                          placeholder="@username"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="advanced" className="space-y-4">
                    <div>
                      <Label>Additional Meta Tags</Label>
                      <p className="text-sm text-gray-500 mb-2">
                        Add custom meta tags as needed
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            additional_tags: [...prev.additional_tags, { name: '', content: '' }]
                          }));
                        }}
                      >
                        Add Meta Tag
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="schema" className="space-y-4">
                    <div>
                      <Label htmlFor="schema_type">Schema Type</Label>
                      <Select value={formData.schema_type} onValueChange={(value) => handleInputChange('schema_type', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="WebSite">WebSite</SelectItem>
                          <SelectItem value="Article">Article</SelectItem>
                          <SelectItem value="Product">Product</SelectItem>
                          <SelectItem value="Organization">Organization</SelectItem>
                          <SelectItem value="Person">Person</SelectItem>
                          <SelectItem value="LocalBusiness">LocalBusiness</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>
                </Tabs>

                <Button 
                  onClick={generateMetaTags} 
                  disabled={loading || !formData.title || !formData.description}
                  className="w-full"
                  size="lg"
                >
                  {loading ? 'Generating...' : 'Generate Meta Tags'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {result && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        Generated Meta Tags
                      </span>
                      <Badge variant={result.seo_score >= 80 ? "default" : result.seo_score >= 60 ? "secondary" : "destructive"}>
                        SEO Score: {result.seo_score}/100
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="basic" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="basic">Basic</TabsTrigger>
                        <TabsTrigger value="social">Social</TabsTrigger>
                        <TabsTrigger value="schema">Schema</TabsTrigger>
                        <TabsTrigger value="preview">Preview</TabsTrigger>
                      </TabsList>

                      <TabsContent value="basic" className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label>Basic Meta Tags</Label>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(result.basic_meta, 'Basic meta tags')}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                            {result.basic_meta}
                          </pre>
                        </div>
                      </TabsContent>

                      <TabsContent value="social" className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label>Open Graph Tags</Label>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(result.open_graph, 'Open Graph tags')}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                            {result.open_graph}
                          </pre>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label>Twitter Card Tags</Label>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(result.twitter_cards, 'Twitter card tags')}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                            {result.twitter_cards}
                          </pre>
                        </div>
                      </TabsContent>

                      <TabsContent value="schema" className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label>Structured Data</Label>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(result.structured_data, 'Structured data')}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                            {result.structured_data}
                          </pre>
                        </div>
                      </TabsContent>

                      <TabsContent value="preview" className="space-y-4">
                        <div className="space-y-4">
                          <div className="border rounded-lg p-4">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              Google Search Preview
                            </h4>
                            <div className="space-y-1">
                              <div className="text-blue-600 text-lg hover:underline cursor-pointer">
                                {result.preview.google.title}
                              </div>
                              <div className="text-green-700 text-sm">
                                {result.preview.google.url}
                              </div>
                              <div className="text-gray-600 text-sm">
                                {result.preview.google.description}
                              </div>
                            </div>
                          </div>

                          <div className="border rounded-lg p-4">
                            <h4 className="font-semibold mb-2">Facebook Preview</h4>
                            <div className="flex gap-3">
                              {result.preview.facebook.image && (
                                <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center text-xs">
                                  Image
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="font-medium text-sm">
                                  {result.preview.facebook.title}
                                </div>
                                <div className="text-gray-600 text-xs mt-1">
                                  {result.preview.facebook.description}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="border rounded-lg p-4">
                            <h4 className="font-semibold mb-2">Twitter Preview</h4>
                            <div className="space-y-2">
                              {result.preview.twitter.image && (
                                <div className="w-full h-32 bg-gray-200 rounded flex items-center justify-center text-sm">
                                  Twitter Image
                                </div>
                              )}
                              <div className="font-medium text-sm">
                                {result.preview.twitter.title}
                              </div>
                              <div className="text-gray-600 text-xs">
                                {result.preview.twitter.description}
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        onClick={() => copyToClipboard(result.complete_html, 'Complete HTML')}
                        className="flex-1"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy All
                      </Button>
                      <Button
                        variant="outline"
                        onClick={downloadHTML}
                        className="flex-1"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download HTML
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {result.recommendations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-orange-600" />
                        SEO Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {result.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'secondary' : 'outline'}>
                              {rec.priority}
                            </Badge>
                            <div className="flex-1">
                              <div className="font-medium text-sm">{rec.type}</div>
                              <div className="text-gray-600 text-sm">{rec.message}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}