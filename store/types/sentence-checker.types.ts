export interface SentenceError {
  type: 'grammar' | 'punctuation' | 'spelling' | 'style' | 'clarity' | 'structure';
  message: string;
  suggestion: string;
  position: {
    start: number;
    end: number;
  };
  severity: 'low' | 'medium' | 'high';
}

export interface SentenceCheckResult {
  original_sentence: string;
  corrected_sentence: string;
  errors: SentenceError[];
  improvements: string[];
  readability_score: number;
  complexity_level: 'simple' | 'moderate' | 'complex';
  word_count: number;
  character_count: number;
  suggestions: {
    clarity: string[];
    conciseness: string[];
    style: string[];
  };
  overall_score: number;
}

export interface SentenceCheckRequest {
  sentence: string;
  check_type: 'grammar' | 'style' | 'clarity' | 'all';
  vendor: 'gemini' | 'openai';
}

export interface SentenceCheckResponse {
  success: boolean;
  status: number;
  data: SentenceCheckResult;
}