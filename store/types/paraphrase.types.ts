import { PARAPHRASED_MODE } from "../constants";

export interface ParaphraseResult {
  original_text: string;
  paraphrased_text: string;
  similarity_score: number; // 0-100
  readability_improvement: number; // percentage improvement
  word_count: {
    original: number;
    paraphrased: number;
  };
  style_applied: string;
}

export interface ParaphraseRequest {
  text: string;
  settings?: {
    style?: 'formal' | 'casual' | 'academic' | 'creative';
    strength?: number; // 1-10 scale
  };
}

export type ParaphraseStyle = 'formal' | 'casual' | 'academic' | 'creative';

// Legacy types for backward compatibility
export interface ParaphaseResponse {
  success: boolean;
  status: number;
  path: string;
  data: {
    paraphrased_text: string;
  };
}

export type IParaphrasedModeType =
  (typeof PARAPHRASED_MODE)[keyof typeof PARAPHRASED_MODE];
