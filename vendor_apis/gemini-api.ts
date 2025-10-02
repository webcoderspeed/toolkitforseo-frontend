import { AIVendor, AIVendorPayload } from './types/ai-vendor.types';
import { GeminiResponse } from './types/gemini-api.types';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_DEFAULT_MODEL = 'gemini-2.5-flash';

export class GeminiVendor implements AIVendor {
  private readonly apiUrl: string;

  constructor() {
    this.apiUrl = GEMINI_API_URL;
  }

  async ask(payload: AIVendorPayload): Promise<string> {
    const {
      api_key,
      model = GEMINI_DEFAULT_MODEL,
      prompt = 'Analyze the following text and answer it like human would do',
    } = payload;

    const payloadData = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    };

    try {
      const response = await fetch(
        `${this.apiUrl}/${model}:generateContent?key=${api_key}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payloadData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: GeminiResponse = await response.json();
      const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

      return responseText;
    } catch (error) {
      console.error('Error during analysis request:', error);
      throw error;
    }
  }
}