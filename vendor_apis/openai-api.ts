import OpenAI from "openai";
import { AIVendor, AIVendorPayload } from "./types/ai-vendor.types";

const OPENAI_DEFAULT_MODEL = "gpt-4o-mini";

export class OpenAIVendor implements AIVendor {
  async ask(payload: AIVendorPayload): Promise<string> {
    const {
      api_key: apiKey,
      model = OPENAI_DEFAULT_MODEL,
      prompt = "Analyze the following text and answer it like human would do",
    } = payload;

    if (!apiKey) {
      throw new Error("OpenAI API key is required");
    }

    try {
      const openai = new OpenAI({
        apiKey,
      });

      const completion = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 4000,
        temperature: 0.7,
      });

      const responseText = completion.choices[0]?.message?.content ?? "";
      return responseText;
    } catch (error) {
      console.error(
        "Error during OpenAI analysis request:",
        JSON.stringify(error)
      );
      throw error;
    }
  }
}
