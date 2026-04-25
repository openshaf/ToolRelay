export interface ServerDefinition {
  name: string;
  command: string;
  args: string[];
  description: string;
  tools: string[];
}

export const SERVER_REGISTRY: Record<string, ServerDefinition> = {
  filesystem: {
    name: "filesystem",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-filesystem", "./tmp"],
    description: "Read, write, and manage local files",
    tools: ["read_file", "read_multiple_files", "write_file", "create_directory", "list_directory", "move_file", "search_files", "get_file_info", "list_allowed_directories"]
  },
  github: {
    name: "github",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-github"],
    description: "Manage GitHub repositories, issues, and PRs",
    tools: ["create_issue", "get_issue", "update_issue", "create_pull_request", "search_repositories", "get_file_contents", "create_or_update_file", "push_files"]
  },
  "brave-search": {
    name: "brave-search",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-brave-search"],
    description: "Search the web using Brave Search API",
    tools: ["brave_web_search", "brave_local_search"]
  },
  puppeteer: {
    name: "puppeteer",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-puppeteer"],
    description: "Browser automation for scraping and interaction",
    tools: ["puppeteer_navigate", "puppeteer_screenshot", "puppeteer_click", "puppeteer_fill", "puppeteer_evaluate"]
  },
  memory: {
    name: "memory",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-memory"],
    description: "Knowledge graph for persistent memory",
    tools: ["create_entities", "create_relations", "add_observations", "delete_entities", "delete_relations", "delete_observations", "read_graph", "search_nodes", "open_nodes"]
  },
  sqlite: {
    name: "sqlite",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-sqlite", "--db-path", "./test.db"],
    description: "Execute SQL queries on a local SQLite database",
    tools: ["read_query", "write_query", "create_table", "list_tables", "describe_table", "append_row"]
  }
};
