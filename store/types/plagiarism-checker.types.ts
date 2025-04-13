export interface PlagiarismCheckerResponse {
    success: boolean;
    status: number;
    path: string;
    data: PlagiarismCheckerData;
  }
  
  export interface PlagiarismCheckerData {
    score: number;
    original_content: number;
    plagiarized_content: number;
    sources: PlagiarismCheckerDataSource[];
  }
  
  export interface PlagiarismCheckerDataSource {
    url: string;
    similarity: number;
  }