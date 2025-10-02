export interface SentenceRephrase {
  original_sentence: string;
  rephrased_sentence: string;
  style: string;
  changes_made: string[];
  improvement_type: string;
  readability_improvement: number;
}

export interface SentenceRephraseResult {
  original_sentence: string;
  rephrase_options: SentenceRephrase[];
  best_option: SentenceRephrase;
  style_applied: string;
  word_count: {
    original: number;
    average_rephrased: number;
  };
  readability_scores: {
    original: number;
    best_rephrased: number;
  };
  suggestions: string[];
}

export interface SentenceRephraseRequest {
  sentence: string;
  style: 'formal' | 'casual' | 'academic' | 'creative' | 'concise' | 'detailed';
  vendor: 'gemini' | 'openai';
}

export interface SentenceRephraseResponse {
  success: boolean;
  status: number;
  data: SentenceRephraseResult;
}