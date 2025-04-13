import { PLAGIARISM_CHECKER_DETECTION_MODEL } from "../constants";

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

export type IPlagiarismCheckerDetectionModelType =
  (typeof PLAGIARISM_CHECKER_DETECTION_MODEL)[keyof typeof PLAGIARISM_CHECKER_DETECTION_MODEL];
