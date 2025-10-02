export type AIVendorType = 'gemini' | 'openai';

export interface AIVendorPayload {
  prompt?: string;
  api_key: string;
  model?: string;
}

export interface AIVendor {
  ask(input: AIVendorPayload): Promise<string>;
}