import { AIVendor, AIVendorType } from './types';
import { GeminiVendor } from './gemini-api';
import { OpenAIVendor } from './openai-api';

export class AIVendorFactory {
  static createVendor(type: AIVendorType): AIVendor {
    switch (type) {
      case 'gemini':
        return new GeminiVendor();
      case 'openai':
        return new OpenAIVendor();
      default:
        throw new Error(`Unsupported AI vendor type: ${type}`);
    }
  }
}