import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

// Get API key from environment variables with fallback
const API_KEY = process.env.OPENAI_API_KEY || '';

const openai = new OpenAI({ apiKey: API_KEY });

/**
 * Generate architectural documentation from repository code
 */
export async function generateArchitecturalDoc(codeContent: string): Promise<string> {
  try {
    const prompt = `
    Please analyze the following repository code and generate a comprehensive architectural documentation.
    Focus on the overall structure, key components, design patterns, and how different parts of the system interact.
    Format the output as markdown with proper headings, code blocks, and bullet points as needed.
    
    Code:
    ${codeContent.substring(0, 100000)} // Limit to first ~100K characters to avoid token limits
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: "You are an experienced software architect who specializes in creating clear, detailed architectural documentation." },
        { role: "user", content: prompt }
      ],
      max_tokens: 4000,
    });

    return response.choices[0].message.content || "Failed to generate documentation";
  } catch (error) {
    console.error("Error generating architectural documentation:", error);
    throw new Error(`Failed to generate architectural documentation: ${error.message}`);
  }
}

/**
 * Generate user stories from repository code
 */
export async function generateUserStories(codeContent: string): Promise<string> {
  try {
    const prompt = `
    Please analyze the following repository code and generate user stories that describe the functionality from an end-user perspective.
    Include acceptance criteria for each story when possible.
    Format the output as markdown with proper headings and structure.
    
    Code:
    ${codeContent.substring(0, 100000)} // Limit to first ~100K characters to avoid token limits
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: "You are a product manager who specializes in creating detailed user stories from technical implementations." },
        { role: "user", content: prompt }
      ],
      max_tokens: 4000,
    });

    return response.choices[0].message.content || "Failed to generate user stories";
  } catch (error) {
    console.error("Error generating user stories:", error);
    throw new Error(`Failed to generate user stories: ${error.message}`);
  }
}

/**
 * Generate custom analysis based on specific prompts
 */
export async function generateCustomAnalysis(codeContent: string, customPrompt: string): Promise<string> {
  try {
    const prompt = `
    Please analyze the following repository code and respond to this specific request:
    
    ${customPrompt}
    
    Code:
    ${codeContent.substring(0, 100000)} // Limit to first ~100K characters to avoid token limits
    `;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: "You are an AI assistant specialized in code analysis and documentation generation." },
        { role: "user", content: prompt }
      ],
      max_tokens: 4000,
    });

    return response.choices[0].message.content || "Failed to generate custom analysis";
  } catch (error) {
    console.error("Error generating custom analysis:", error);
    throw new Error(`Failed to generate custom analysis: ${error.message}`);
  }
}

/**
 * Check if API key is valid by making a simple request
 */
export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const testOpenai = new OpenAI({ apiKey });
    
    // Make a simple request to verify the API key
    const response = await testOpenai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "user", content: "This is a test message to verify the API key." }
      ],
      max_tokens: 10,
    });
    
    return response.choices && response.choices.length > 0;
  } catch (error) {
    console.error("API key validation failed:", error);
    return false;
  }
}

export default {
  generateArchitecturalDoc,
  generateUserStories,
  generateCustomAnalysis,
  validateApiKey,
};
