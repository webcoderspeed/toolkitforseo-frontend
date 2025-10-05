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

    // Create AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(
        `${this.apiUrl}/${model}:generateContent?key=${api_key}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payloadData),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error (${response.status}): ${errorText}`);
      }

      const data: GeminiResponse = await response.json();
      const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

      if (!responseText) {
        throw new Error('No response text received from Gemini API');
      }

      return responseText;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.error('Gemini API request timed out after 10 seconds');
          throw new Error('Request timed out. Please try again.');
        }
        
        if (error.message.includes('fetch')) {
          console.error('Network error during Gemini API request:', error);
          throw new Error('Network error. Please check your connection and try again.');
        }
      }
      
      console.error('Error during Gemini analysis request:', error);
      throw error;
    }
  }
}