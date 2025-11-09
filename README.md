# Claude Agent SDK tool call hook bug

Reproduction of Claude Agent SDK tool call hook bug:

The last post tool use hook is not triggered if the agent hits the max turn limit.

## Reproduction

Run the script with `npm start`.

## Expected behavior

The last post tool use hook should be triggered.

There should be 2 tool call executions and 2 tool call hook calls.

## Actual behavior

There are 2 tool call executions but only 1 post tool use hook call.

```
executions [
  'get_weather: {"location":"San Francisco","units":"celsius"}',
  'get_weather: {"location":"Singapore","units":"celsius"}'
]
hookCalls [
  '{"session_id":"e96b68e8-ab6b-41e1-9fa2-1639e7762027",..., "tool_name":"mcp__my-custom-tools__get_weather","tool_input":{"location":"San Francisco"},"tool_response":[{"type":"text","text":"Temperature: 25°\\nConditions: sunny\\nHumidity: 50%"}]}'
]
number of tool call executions 2
number of tool call hook calls 1
```
