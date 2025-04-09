# Documentation: MCP Server Integration with LibreChat

## Purpose

This document summarizes the key findings and best practices discovered while developing and debugging the `mcp-anthropic` server for integration as a child process within LibreChat, particularly concerning API key handling and SDK usage.

## Problem Recap: Previous Issues (`prompt-tool`)

Initial attempts (referenced in `../antropic-prompt/issues.md`) faced significant challenges:

*   **API Key Reading:** Consistently failed to read the API key from configuration files (e.g., `.promptapi`) specified via environment variables (`PROMPT_API_CONFIG_PATH`).
*   **Silent Failures:** File reading/parsing logic seemed to fail silently within the Docker/LibreChat environment, making debugging difficult. Logs within `try...catch` blocks around file I/O did not appear.
*   **Hypothesis:** Disconnect between source code, compiled code, and the actual execution environment, or subtle Node.js `fs` issues within the container.

## Solution: Environment Variables via `librechat.yaml`

The core issue stemmed from attempting file-based secret management within the MCP server's code, which is unreliable given how LibreChat launches these servers.

**Key Findings & Best Practices:**

1.  **Execution Context:** LibreChat runs MCP servers as **child processes**. The server script's working directory and environment variables are controlled by LibreChat, not the server's own project folder.

2.  **API Key Handling - The Correct Way:**
    *   **Avoid File Reading:** Do not attempt to read secrets from files located within the MCP server's project directory when running integrated with LibreChat. This is prone to failure due to mismatched execution context.
    *   **Use Environment Variables:** Pass API keys and other secrets directly as environment variables *to* the child process *from* LibreChat.

3.  **Configuring LibreChat (`librechat.yaml`):**
    *   Define your MCP server under the `mcpServers:` section.
    *   Specify the `command` (e.g., `node`) and `args` (path to the **compiled** server script, like `/app/mcp-servers/mcp-anthropic/build/server.js`).
    *   **Use the `env:` block** under your server's definition. This maps variables from LibreChat's main environment into the specific child process for your server.
        ```yaml
        mcpServers:
          # ... other servers ...

          # Example for our Anthropic server (adjust name/path as needed in actual config)
          anthropic-server: # Or prompt-tool, or mcp-anthropic
            command: node
            args:
              # Path *within the LibreChat container* where you copy the compiled code
              - /app/mcp-servers/mcp-anthropic/build/server.js
            env:
              # This reads ANTHROPIC_KEY from LibreChat's main env
              # and makes it available as process.env.ANTHROPIC_KEY inside server.js
              ANTHROPIC_KEY: ${ANTHROPIC_KEY}
        ```
    *   Ensure the corresponding variable (`ANTHROPIC_KEY` in this example) is defined in LibreChat's main `.env` file or its Docker environment configuration.

4.  **MCP Server Code Implementation:**
    *   Read the secret directly using `process.env`:
        ```typescript
        // In src/config.ts or directly where needed
        const apiKey = process.env.ANTHROPIC_KEY;
        if (!apiKey) {
          throw new Error('ANTHROPIC_KEY environment variable is not set.');
        }
        ```
    *   The `dotenv` package is still useful for loading a local `.env` file **only during standalone testing** (e.g., running `npm start` from the `./mcp-anthropic` directory). It will likely have no effect when run via LibreChat.

5.  **MCP SDK Usage Quirks (Observed during debugging):**
    *   **`server.tool()`:** Requires the Zod schema's `.shape` property as the second argument, not the Zod object itself.
    *   **Handler Return:** The handler function's return value must strictly match the SDK's expected structure, specifically `{ content: [...] }` where `content` is an array of specific content part types (text, image, etc.). Returning raw API data caused errors. Casting the return value `as any` was used as a workaround for strict type checking issues.
    *   **Deep Imports:** Some SDK components require deep imports (e.g., `import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';`). Check examples or SDK source if standard imports fail.

By following the environment variable approach managed through `librechat.yaml`, we ensure secrets are reliably passed to the MCP server child process, avoiding the pitfalls of file-based methods in this specific integration context.