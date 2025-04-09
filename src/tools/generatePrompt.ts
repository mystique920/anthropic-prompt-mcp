import { z } from 'zod';
import axios from 'axios'; // Import axios
import { config } from '../config.js'; // Import config for API key
// Removed RequestHandlerExtra import

// API Constants
const ANTHROPIC_API_BASE_URL = 'https://api.anthropic.com/v1/experimental';
const ANTHROPIC_VERSION = '2023-06-01';
const ANTHROPIC_BETA = 'prompt-tools-2025-04-02';
const ENDPOINT = 'generate_prompt';

// Schema Definition
export const generatePromptSchema = z.object({
  task: z.string().describe('Task description.'),
  target_model: z.string().describe('Target model ID.'),
});

// Handler Function - Removed 'extra' parameter
export const handleGeneratePrompt = async (
  args: z.infer<typeof generatePromptSchema>
  // extra parameter removed
) => {
  console.log(`Handling ${ENDPOINT} with args:`, args);
  const url = `${ANTHROPIC_API_BASE_URL}/${ENDPOINT}`;
  const apiKey = config.anthropicApiKey;

  try {
    // Directly call axios here
    const response = await axios.post(url, args, {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
        'anthropic-beta': ANTHROPIC_BETA,
        'content-type': 'application/json',
      },
    });
    console.log(`${ENDPOINT} result:`, response.data);
    // Wrap the response data and cast to 'any' to bypass strict return type check
    return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] } as any;
  } catch (error: any) {
    const errorDetails = error.response?.data ? JSON.stringify(error.response.data) : error.message;
    console.error(`Error in ${ENDPOINT} handler:`, errorDetails);
    // Cast error return to 'any' and include more details
    return { content: [{ type: 'text', text: `Error: Failed to ${ENDPOINT}: ${errorDetails}` }], isError: true } as any;
  }
};