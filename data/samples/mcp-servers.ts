/**
 * MCP Servers Dataset
 *
 * Model Context Protocol (MCP) servers that expose tools, resources, and prompts
 * to language models. Data from MCP registry and reference implementations.
 */

export default [
  {
    "name": "Filesystem",
    "provider": "MCP",
    "language": "TypeScript",
    "capabilities": ["tools"],
    "description": "Secure file operations with configurable access controls",
    "transport": "stdio",
    "open_source": true,
    "website": "https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem",
    "tools_count": 5,
    "resources_support": false,
    "prompts_support": false,
    "use_cases": ["File read/write", "Directory listing", "Secure operations"]
  },
  {
    "name": "Fetch",
    "provider": "MCP",
    "language": "TypeScript",
    "capabilities": ["tools"],
    "description": "Web content fetching and conversion for efficient LLM usage",
    "transport": "stdio",
    "open_source": true,
    "website": "https://github.com/modelcontextprotocol/servers/tree/main/src/fetch",
    "tools_count": 3,
    "resources_support": false,
    "prompts_support": false,
    "use_cases": ["Web scraping", "Content extraction", "URL fetching"]
  },
  {
    "name": "Git",
    "provider": "MCP",
    "language": "TypeScript",
    "capabilities": ["tools"],
    "description": "Read, search, and manipulate Git repositories",
    "transport": "stdio",
    "open_source": true,
    "website": "https://github.com/modelcontextprotocol/servers/tree/main/src/git",
    "tools_count": 8,
    "resources_support": false,
    "prompts_support": false,
    "use_cases": ["Repo management", "Branch operations", "Commit history"]
  },
  {
    "name": "Memory",
    "provider": "MCP",
    "language": "TypeScript",
    "capabilities": ["tools", "resources"],
    "description": "Knowledge graph-based persistent memory system",
    "transport": "stdio",
    "open_source": true,
    "website": "https://github.com/modelcontextprotocol/servers/tree/main/src/memory",
    "tools_count": 6,
    "resources_support": true,
    "prompts_support": false,
    "use_cases": ["Knowledge storage", "Context retention", "Memory recall"]
  },
  {
    "name": "Sequential Thinking",
    "provider": "MCP",
    "language": "TypeScript",
    "capabilities": ["tools", "prompts"],
    "description": "Dynamic problem-solving through thought sequences",
    "transport": "stdio",
    "open_source": true,
    "website": "https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking",
    "tools_count": 4,
    "resources_support": false,
    "prompts_support": true,
    "use_cases": ["Reasoning chains", "Step-by-step analysis", "Complex problem solving"]
  },
  {
    "name": "Time",
    "provider": "MCP",
    "language": "TypeScript",
    "capabilities": ["tools"],
    "description": "Time and timezone conversion capabilities",
    "transport": "stdio",
    "open_source": true,
    "website": "https://github.com/modelcontextprotocol/servers/tree/main/src/time",
    "tools_count": 2,
    "resources_support": false,
    "prompts_support": false,
    "use_cases": ["Timezone conversion", "Time formatting", "Date calculations"]
  },
  {
    "name": "Everything",
    "provider": "MCP",
    "language": "TypeScript",
    "capabilities": ["tools", "resources", "prompts"],
    "description": "Reference server with prompts, resources, and tools",
    "transport": "stdio",
    "open_source": true,
    "website": "https://github.com/modelcontextprotocol/servers/tree/main/src/everything",
    "tools_count": 12,
    "resources_support": true,
    "prompts_support": true,
    "use_cases": ["Reference implementation", "SDK testing", "Feature demo"]
  },
  {
    "name": "AWS",
    "provider": "AWS",
    "language": "TypeScript",
    "capabilities": ["tools"],
    "description": "AWS services integration for development workflow",
    "transport": "stdio",
    "open_source": true,
    "website": "https://github.com/awslabs/mcp",
    "tools_count": 15,
    "resources_support": false,
    "prompts_support": false,
    "use_cases": ["AWS CLI", "Bedrock", "CloudWatch", "S3"]
  },
  {
    "name": "GitHub",
    "provider": "GitHub",
    "language": "TypeScript",
    "capabilities": ["tools"],
    "description": "Repository management, file operations, and GitHub API",
    "transport": "stdio",
    "open_source": true,
    "website": "https://github.com/modelcontextprotocol/servers-archived/tree/main/src/github",
    "tools_count": 10,
    "resources_support": false,
    "prompts_support": false,
    "use_cases": ["PR management", "Issues", "File operations", "Search"]
  },
  {
    "name": "PostgreSQL",
    "provider": "Community",
    "language": "TypeScript",
    "capabilities": ["tools"],
    "description": "Read-only database access with schema inspection",
    "transport": "stdio",
    "open_source": true,
    "website": "https://github.com/modelcontextprotocol/servers-archived/tree/main/src/postgres",
    "tools_count": 4,
    "resources_support": false,
    "prompts_support": false,
    "use_cases": ["Query execution", "Schema inspection", "Data analysis"]
  }
]
