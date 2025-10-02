export interface EssayRewriteResult {
  original_text: string;
  rewritten_text: string;
  essay_type: string;
  academic_level: string;
  improvements: {
    structure: string[];
    content: string[];
    language: string[];
    citations: string[];
  };
  word_count: {
    original: number;
    rewritten: number;
  };
  readability_metrics: {
    grade_level: string;
    reading_ease: number;
    complexity_score: number;
  };
  plagiarism_risk: string;
  quality_score: number;
}

export interface EssayRewriteRequest {
  text: string;
  essay_type: 'argumentative' | 'descriptive' | 'narrative' | 'expository' | 'persuasive' | 'analytical';
  academic_level: 'high_school' | 'undergraduate' | 'graduate' | 'professional';
  vendor: 'gemini' | 'openai';
}

export interface EssayRewriteResponse {
  success: boolean;
  status: number;
  data: EssayRewriteResult;
}