export interface ArticleRewriteResult {
  original_text: string;
  rewritten_text: string;
  rewrite_style: string;
  changes_made: string[];
  word_count: {
    original: number;
    rewritten: number;
  };
  readability_score: {
    original: number;
    rewritten: number;
  };
  improvements: string[];
  uniqueness_percentage: number;
}

export interface ArticleRewriteRequest {
  text: string;
  style: 'formal' | 'casual' | 'academic' | 'creative' | 'professional';
  vendor: 'gemini' | 'openai';
}

export interface ArticleRewriteResponse {
  success: boolean;
  status: number;
  data: ArticleRewriteResult;
}