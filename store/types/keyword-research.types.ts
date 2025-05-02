export interface KeywordResearchResponse {
  success: boolean;
  status: number;
  path: string;
  data: KeywordResearchData;
}

export interface KeywordResearchData {
  keywords: KeywordResearch[];
}

export interface KeywordResearch {
  url: string;
  keyword_overlap: number;
  competitors_keywords: number;
  common_keywords: number;
  share: number;
  target_keywords: number;
  dr: number;
  traffic: number;
  value: number;
}