export interface GrammarError {
  type: "grammar" | "spelling" | "punctuation" | "style";
  text: string;
  suggestion: string;
  explanation: string;
  severity: "low" | "medium" | "high";
  position: {
    start: number;
    end: number;
  };
}

export interface GrammarResult {
  original_text: string;
  corrected_text: string;
  errors: GrammarError[];
  grammar_score: number; // 0-100
  total_errors: number;
  error_density: number; // errors per 100 words
}

// Legacy types for backward compatibility
export interface GrammarCheckResponse {
  success: boolean;
  status: number;
  path: string;
  data: GrammarCheckData;
}

export interface GrammarCheckData {
  errors: GrammarCheckError[];
  score: number;
  corrected_text: string
}

export interface GrammarCheckError {
  type: "grammar" | "spelling" | "punctuation";
  text: string;
  suggestion: string;
  position: [number, number];
}
