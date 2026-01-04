import { EventEmitter } from "events";
import WebSocket from "ws";
import { log, error } from "../utils/logger";

interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

interface MCPResource {
  uri: string;
  name: string;
  mimeType?: string;
}

interface MCPServerConfig {
  name: string;
  url: string;
  apiKey?: string;
  capabilities?: string[];
}

interface MCPMessage {
  jsonrpc: "2.0";
  id?: string | number;
  method?: string;
  params?: unknown;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

export class MCPClient extends EventEmitter {
  private servers: Map<string, WebSocket> = new Map();
  private pendingRequests: Map<string, {
    resolve: (value: unknown) => void;
    reject: (reason: unknown) => void;
    timeout: NodeJS.Timeout;
  }> = new Map();
  private serverTools: Map<string, MCPTool[]> = new Map();
  private serverResources: Map<string, MCPResource[]> = new Map();
  private requestId = 0;
  private requestTimeout = 30000;

  async connect(config: MCPServerConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(config.url, {
        headers: config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {},
      });

      ws.on("open", async () => {
        log(`Connected to MCP server: ${config.name}`);
        this.servers.set(config.name, ws);
        
        // Initialize the connection
        try {
          await this.initialize(config.name);
          await this.discoverCapabilities(config.name);
          this.emit("connected", { server: config.name });
          resolve();
        } catch (err) {
          reject(err);
        }
      });

      ws.on("message", (data) => {
        try {
          const message: MCPMessage = JSON.parse(data.toString());
          this.handleMessage(config.name, message);
        } catch (err) {
          error(`Failed to parse MCP message from ${config.name}:`, err);
        }
      });

      ws.on("close", () => {
        log(`Disconnected from MCP server: ${config.name}`);
        this.servers.delete(config.name);
        this.serverTools.delete(config.name);
        this.serverResources.delete(config.name);
        this.emit("disconnected", { server: config.name });
      });

      ws.on("error", (err) => {
        error(`MCP server error (${config.name}):`, err);
        reject(err);
      });
    });
  }

  disconnect(serverName: string): void {
    const ws = this.servers.get(serverName);
    if (ws) {
      ws.close();
      this.servers.delete(serverName);
    }
  }

  disconnectAll(): void {
    for (const [name, ws] of this.servers) {
      ws.close();
    }
    this.servers.clear();
    this.serverTools.clear();
    this.serverResources.clear();
  }

  isConnected(serverName: string): boolean {
    const ws = this.servers.get(serverName);
    return ws?.readyState === WebSocket.OPEN;
  }

  getConnectedServers(): string[] {
    return Array.from(this.servers.keys());
  }

  getTools(serverName?: string): MCPTool[] {
    if (serverName) {
      return this.serverTools.get(serverName) || [];
    }
    
    const allTools: MCPTool[] = [];
    for (const tools of this.serverTools.values()) {
      allTools.push(...tools);
    }
    return allTools;
  }

  getResources(serverName?: string): MCPResource[] {
    if (serverName) {
      return this.serverResources.get(serverName) || [];
    }
    
    const allResources: MCPResource[] = [];
    for (const resources of this.serverResources.values()) {
      allResources.push(...resources);
    }
    return allResources;
  }

  async callTool(
    serverName: string,
    toolName: string,
    args: Record<string, unknown>
  ): Promise<unknown> {
    return this.sendRequest(serverName, "tools/call", {
      name: toolName,
      arguments: args,
    });
  }

  async readResource(serverName: string, uri: string): Promise<unknown> {
    return this.sendRequest(serverName, "resources/read", { uri });
  }

  async prompt(
    serverName: string,
    promptName: string,
    args?: Record<string, unknown>
  ): Promise<unknown> {
    return this.sendRequest(serverName, "prompts/get", {
      name: promptName,
      arguments: args,
    });
  }

  private async initialize(serverName: string): Promise<void> {
    await this.sendRequest(serverName, "initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {
        roots: { listChanged: true },
        sampling: {},
      },
      clientInfo: {
        name: "SpaceChildDev",
        version: "1.0.0",
      },
    });

    await this.sendNotification(serverName, "notifications/initialized", {});
  }

  private async discoverCapabilities(serverName: string): Promise<void> {
    // List available tools
    try {
      const toolsResult = await this.sendRequest(serverName, "tools/list", {});
      if (toolsResult && typeof toolsResult === "object" && "tools" in toolsResult) {
        this.serverTools.set(serverName, (toolsResult as { tools: MCPTool[] }).tools);
        log(`Discovered ${(toolsResult as { tools: MCPTool[] }).tools.length} tools from ${serverName}`);
      }
    } catch (err) {
      log(`No tools available from ${serverName}`);
    }

    // List available resources
    try {
      const resourcesResult = await this.sendRequest(serverName, "resources/list", {});
      if (resourcesResult && typeof resourcesResult === "object" && "resources" in resourcesResult) {
        this.serverResources.set(serverName, (resourcesResult as { resources: MCPResource[] }).resources);
        log(`Discovered ${(resourcesResult as { resources: MCPResource[] }).resources.length} resources from ${serverName}`);
      }
    } catch (err) {
      log(`No resources available from ${serverName}`);
    }
  }

  private sendRequest(
    serverName: string,
    method: string,
    params?: unknown
  ): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const ws = this.servers.get(serverName);
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        reject(new Error(`Not connected to MCP server: ${serverName}`));
        return;
      }

      const id = `${++this.requestId}`;
      const message: MCPMessage = {
        jsonrpc: "2.0",
        id,
        method,
        params,
      };

      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`Request timeout: ${method}`));
      }, this.requestTimeout);

      this.pendingRequests.set(id, { resolve, reject, timeout });
      ws.send(JSON.stringify(message));
    });
  }

  private sendNotification(
    serverName: string,
    method: string,
    params?: unknown
  ): void {
    const ws = this.servers.get(serverName);
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const message: MCPMessage = {
      jsonrpc: "2.0",
      method,
      params,
    };

    ws.send(JSON.stringify(message));
  }

  private handleMessage(serverName: string, message: MCPMessage): void {
    // Handle responses
    if (message.id !== undefined) {
      const pending = this.pendingRequests.get(String(message.id));
      if (pending) {
        clearTimeout(pending.timeout);
        this.pendingRequests.delete(String(message.id));

        if (message.error) {
          pending.reject(new Error(message.error.message));
        } else {
          pending.resolve(message.result);
        }
      }
      return;
    }

    // Handle notifications
    if (message.method) {
      this.emit("notification", {
        server: serverName,
        method: message.method,
        params: message.params,
      });

      // Handle specific notifications
      switch (message.method) {
        case "notifications/tools/list_changed":
          this.discoverCapabilities(serverName);
          break;
        case "notifications/resources/list_changed":
          this.discoverCapabilities(serverName);
          break;
      }
    }
  }
}

// Singleton instance
export const mcpClient = new MCPClient();
