import { PARAPHRASED_MODE } from "../constants";

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
