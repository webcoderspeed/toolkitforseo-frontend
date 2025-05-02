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
