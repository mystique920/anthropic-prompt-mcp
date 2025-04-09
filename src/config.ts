import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Retrieves the Anthropic API key from environment variables.
 * Throws an error if the key is not found.
 *
 * @returns {string} The Anthropic API key.
 * @throws {Error} If ANTHROPIC_KEY environment variable is not set.
 */
function getApiKey(): string {
  const apiKey = process.env.ANTHROPIC_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_KEY environment variable is not set.');
  }
  return apiKey;
}

export const config = {
  anthropicApiKey: getApiKey(),
};