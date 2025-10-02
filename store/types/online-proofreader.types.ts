export interface ProofreadingError {
  type: 'grammar' | 'spelling' | 'punctuation' | 'style' | 'word_choice';
  text: string;
  suggestion: string;
  explanation: string;
  severity: 'low' | 'medium' | 'high';
  position: {
    start: number;
    end: number;
  };
}

export interface ProofreadingResult {
  original_text: string;
  corrected_text: string;
  errors: ProofreadingError[];
  corrections_made: number;
  improvement_score: number; // 0-100, how much the text was improved
  readability_score: {
    original: number;
    corrected: number;
  };
  word_count: {
    original: number;
    corrected: number;
  };
  suggestions: {
    grammar: string[];
    style: string[];
    clarity: string[];
  };
  overall_quality_score: number; // 0-100
}

export interface ProofreadingRequest {
  text: string;
  settings: {
    grammar: boolean;
    spelling: boolean;
    punctuation: boolean;
    style: boolean;
    word_choice: boolean;
  };
  vendor: 'gemini' | 'openai';
}

export interface ProofreadingResponse {
  success: boolean;
  status: number;
  data: ProofreadingResult;
}