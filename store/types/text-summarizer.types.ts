export interface KeyPoint {
  point: string;
  importance: number; // 1-10 scale
}

export interface SummaryResult {
  original_text: string;
  summary: string;
  key_points: KeyPoint[];
  compression_ratio: number; // percentage of original length
  word_count: {
    original: number;
    summary: number;
  };
  reading_time: {
    original_minutes: number;
    summary_minutes: number;
  };
}

export interface SummarizeRequest {
  text: string;
  settings?: {
    length?: 'short' | 'medium' | 'long';
    style?: 'bullet_points' | 'paragraph' | 'abstract';
    focus?: 'general' | 'key_facts' | 'conclusions' | 'methodology';
  };
}

export type SummaryLength = 'short' | 'medium' | 'long';
export type SummaryStyle = 'bullet_points' | 'paragraph' | 'abstract';
export type SummaryFocus = 'general' | 'key_facts' | 'conclusions' | 'methodology';