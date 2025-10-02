import { AIVendor, AIVendorType } from './types';
import { GeminiVendor } from './gemini-api';

export class AIVendorFactory {
  static createVendor(type: AIVendorType): AIVendor {
    switch (type) {
      case 'gemini':
        return new GeminiVendor();
      case 'openai':
        // TODO: Implement OpenAI vendor when needed
        throw new Error('OpenAI vendor not implemented yet');
      default:
        throw new Error(`Unsupported AI vendor type: ${type}`);
    }
  }
}