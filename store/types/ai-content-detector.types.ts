export interface AIContentDetectionResult {
  original_text: string;
  ai_probability: number; // 0-100, probability that content is AI-generated
  human_probability: number; // 0-100, probability that content is human-written
  confidence_score: number; // 0-100, confidence in the detection
  detected_patterns: string[]; // Array of AI writing patterns detected
  analysis: {
    sentence_structure: string; // Analysis of sentence patterns
    vocabulary_complexity: string; // Analysis of word choice
    writing_style: string; // Analysis of overall style
    repetition_patterns: string; // Analysis of repetitive elements
  };
  recommendation: string; // Recommendation based on analysis
}

export interface AIContentDetectionRequest {
  text: string;
  vendor: 'gemini' | 'openai';
}

export interface AIContentDetectionResponse {
  success: boolean;
  status: number;
  data: AIContentDetectionResult;
}