export function outputParser(response: string): any {
  const match = response.match(/```json\s*([\s\S]*?)\s*```/);

  if (!match || !match[1]) {
    throw new Error('No valid JSON block found in the response.');
  }

  try {
    return JSON.parse(match[1].trim());
  } catch (error) {
    throw new Error('Failed to parse JSON: ' + error);
  }
}