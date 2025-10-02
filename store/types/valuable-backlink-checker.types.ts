export interface BacklinkMetrics {
  traffic: number;
  relevance: number;
  trustFlow: number;
  citationFlow: number;
}

export interface BacklinkAnalysis {
  url: string;
  domain: string;
  domainAuthority: number;
  pageAuthority: number;
  doFollow: boolean;
  status: "valuable" | "moderate" | "low-value";
  metrics: BacklinkMetrics;
}

export interface BacklinkSummary {
  valuableCount: number;
  moderateCount: number;
  lowValueCount: number;
  doFollowCount: number;
  noFollowCount: number;
  averageDomainAuthority: number;
}

export interface ValuableBacklinkResult {
  totalBacklinks: number;
  valuableBacklinks: number;
  backlinksAnalyzed: BacklinkAnalysis[];
  summary: BacklinkSummary;
  analysis_summary: string;
  recommendations: string[];
  quality_score: number; // 0-100
}

export interface ValuableBacklinkRequest {
  url: string;
  vendor: 'gemini' | 'openai';
}

export interface ValuableBacklinkResponse {
  success: boolean;
  status: number;
  data: ValuableBacklinkResult;
}