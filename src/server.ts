import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod'; // Needed for z.infer if used in handlers, keep for now
import { config } from './config.js'; // Load config early

// Import schemas and handlers from tool files
import { generatePromptSchema, handleGeneratePrompt } from './tools/generatePrompt.js';
import { improvePromptSchema, handleImprovePrompt } from './tools/improvePrompt.js';
import { templatizePromptSchema, handleTemplatizePrompt } from './tools/templatizePrompt.js';

console.log('Initializing MCP Anthropic Server...');

// --- Server Setup ---

try {
  // Validate API Key
  if (!config.anthropicApiKey) {
    throw new Error('ANTHROPIC_KEY environment variable is not set.');
  }
  const maskedKey = config.anthropicApiKey.substring(0, 3) + '...' + config.anthropicApiKey.substring(config.anthropicApiKey.length - 4);
  console.log(`Anthropic API Key loaded (masked): ${maskedKey}`);

  // Create Server Instance
  const server = new McpServer({
    name: 'mcp-anthropic',
    description: 'MCP Server for Anthropic Prompt Tools',
    version: '0.1.0', // Consider reading from package.json
  });

  // --- Tool Registration ---

  // generate_prompt tool
  server.tool(
    'generate_prompt',
    generatePromptSchema.shape, // Pass the .shape property for ZodRawShape
    handleGeneratePrompt // Pass the imported handler directly
  );

  // improve_prompt tool
  server.tool(
    'improve_prompt',
    improvePromptSchema.shape, // Pass the .shape property
    handleImprovePrompt // Pass the imported handler directly
  );

  // templatize_prompt tool
  server.tool(
    'templatize_prompt',
    templatizePromptSchema.shape, // Pass the .shape property
    handleTemplatizePrompt // Pass the imported handler directly
  );

  console.log(`Registered tools: generate_prompt, improve_prompt, templatize_prompt`);

  // --- Connect Transport ---
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.log('MCP Anthropic Server connected to transport and ready.');

} catch (error) {
  console.error('Failed to initialize or connect MCP Anthropic Server:', error);
  process.exit(1);
}