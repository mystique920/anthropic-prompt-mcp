# MCP Anthropic Server (`mcp-anthropic`)

An MCP (Model Context Protocol) server providing tools to interact with Anthropic's experimental prompt engineering APIs.

## Features

Provides the following tools:

*   **`generate_prompt`**: Generates a prompt based on a task description.
*   **`improve_prompt`**: Improves an existing prompt based on feedback.
*   **`templatize_prompt`**: Converts a concrete prompt example into a reusable template.

## Setup

1.  **Clone the repository (if applicable)**
2.  **Navigate to the project directory:**
    ```bash
    cd mcp-anthropic
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```
4.  **Configure API Key:**
    *   Create a `.env` file in the project root (`./mcp-anthropic/.env`).
    *   Add your Anthropic API key to the `.env` file:
        ```dotenv
        ANTHROPIC_KEY=your_anthropic_api_key_here
        ```
    *   Ensure this file is **not** committed to version control (it should be covered by `.gitignore`).

## Running the Server

1.  **Build the TypeScript code:**
    ```bash
    npm run build
    ```
2.  **Start the server:**
    ```bash
    npm start
    ```
    The server will start and listen for MCP connections. You should see output indicating the server has started and which tools are registered.

## Tools Documentation

### `generate_prompt`

Generates a prompt based on a task description.

**Input Schema:**

```json
{
  "type": "object",
  "properties": {
    "task": {
      "type": "string",
      "description": "A description of the task the prompt should be designed for (e.g., \"a chef for a meal prep planning service\")."
    },
    "target_model": {
      "type": "string",
      "description": "The target Anthropic model identifier (e.g., \"claude-3-opus-20240229\")."
    }
  },
  "required": ["task", "target_model"]
}
```

### `improve_prompt`

Improves an existing prompt based on feedback.

**Input Schema:**

```json
{
  "type": "object",
  "properties": {
    "messages": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "role": { "type": "string", "description": "Role (e.g., 'user', 'assistant')." },
          "content": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "type": { "type": "string", "description": "Content type (e.g., 'text')." },
                "text": { "type": "string", "description": "Text content." }
              },
              "required": ["type", "text"]
            },
            "description": "Content blocks."
          }
        },
        "required": ["role", "content"]
      },
      "description": "The sequence of messages representing the prompt conversation."
    },
    "system": {
      "type": "string",
      "description": "(Optional) A system prompt to guide the model."
    },
    "feedback": {
      "type": "string",
      "description": "Specific feedback on how to improve the prompt (e.g., \"Make it more detailed\")."
    },
    "target_model": {
      "type": "string",
      "description": "The target Anthropic model identifier (e.g., \"claude-3-opus-20240229\")."
    }
  },
  "required": ["messages", "feedback", "target_model"]
}
```

### `templatize_prompt`

Converts a concrete prompt example into a reusable template.

**Input Schema:**

```json
{
  "type": "object",
  "properties": {
    "messages": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "role": { "type": "string", "description": "Role (e.g., 'user', 'assistant')." },
          "content": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "type": { "type": "string", "description": "Content type (e.g., 'text')." },
                "text": { "type": "string", "description": "Text content." }
              },
              "required": ["type", "text"]
            },
            "description": "Content blocks."
          }
        },
        "required": ["role", "content"]
      },
      "description": "The sequence of messages representing the prompt conversation example."
    },
    "system": {
      "type": "string",
      "description": "(Optional) A system prompt associated with the example."
    }
  },
  "required": ["messages"]
}