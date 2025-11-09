import {
  createSdkMcpServer,
  HookCallback,
  HookInput,
  query,
  SDKMessage,
  SDKUserMessage,
  tool,
} from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

const executions: string[] = [];
const hookCalls: string[] = [];
const messages: SDKMessage[] = [];

const customServer = createSdkMcpServer({
  name: "my-custom-tools",
  version: "1.0.0",
  tools: [
    tool(
      "get_weather",
      "Get current weather for a location",
      {
        location: z.string().describe("City name or coordinates"),
        units: z
          .enum(["celsius", "fahrenheit"])
          .default("celsius")
          .describe("Temperature units"),
      },
      async (_args) => {
        // Call weather API
        executions.push(`get_weather: ${JSON.stringify(_args)}`);
        return {
          content: [
            {
              type: "text",
              text: `Temperature: 25°\nConditions: sunny\nHumidity: 50%`,
            },
          ],
        };
      }
    ),
  ],
});

// Create async generator that monitors for result message
async function* promptGenerator() {
  yield {
    type: "user" as const,
    message: {
      role: "user" as const,
      content:
        "Use the get_weather tool to get the weather in San Francisco, Singapore, and Tokyo.",
    },
  } as SDKUserMessage;
}

const toolCallHook: HookCallback = async (
  input: HookInput, // Union of all hook input types
  toolUseID: string | undefined,
  options: { signal: AbortSignal }
) => {
  hookCalls.push(JSON.stringify(input));
  return {};
};

async function run() {
  // Consume messages and populate the shared array
  for await (const message of query({
    prompt: promptGenerator(),
    options: {
      mcpServers: {
        "my-custom-tools": customServer,
      },
      allowedTools: [
        "mcp__my-custom-tools__get_weather", // Allow the weather tool
      ],
      hooks: {
        PostToolUse: [{ hooks: [toolCallHook] }],
      },
      maxTurns: 3,
    },
  })) {
    if (message.type === "result" && message.subtype === "success") {
      console.log(message.result);
    } else if (message.type === "assistant" && message.message.content) {
      console.log(
        "assistant",
        JSON.stringify(message.message.content, null, 2)
      );
    } else if (message.type === "user" && message.message.content) {
      console.log("user", JSON.stringify(message.message.content, null, 2));
    } else {
      console.log("other", JSON.stringify(message, null, 2));
    }
    messages.push(message);
  }

  // console.log("messages", messages);
  console.log("executions", executions);
  console.log("hookCalls", hookCalls);
  console.log("number of tool call executions", executions.length);
  console.log("number of tool call hook calls", hookCalls.length);
}

run();
