import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  HttpStatus,
  Logger,
  Headers,
} from '@nestjs/common';
import { Response } from 'express';
import { McpService } from './mcp.service';

@Controller()
export class McpController {
  private readonly logger = new Logger(McpController.name);

  constructor(private readonly mcpService: McpService) {}

  /**
   * 1. MCP Server-Sent Events (SSE) Endpoint
   * Spec: Anthropic Model Context Protocol SSE Transport
   * Connects Claude Desktop, Cursor, and automated agents.
   */
  @Get('mcp/sse')
  handleMcpSse(@Res() res: Response) {
    this.logger.log('📡 New MCP SSE Client connected');

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Notify client of the message post endpoint
    const postEndpoint = '/mcp/messages';
    res.write(`event: endpoint\ndata: ${postEndpoint}\n\n`);

    // Keep-alive heartbeat every 25s
    const heartbeat = setInterval(() => {
      res.write(': heartbeat\n\n');
    }, 25000);

    res.on('close', () => {
      clearInterval(heartbeat);
      this.logger.log('🔌 MCP SSE Client disconnected');
    });
  }

  /**
   * 2. MCP JSON-RPC 2.0 Message Endpoint
   * Receives tool calls, initialize requests, and queries from MCP clients.
   */
  @Post('mcp/messages')
  async handleMcpMessage(@Body() body: any, @Res() res: Response) {
    const { jsonrpc, id, method, params } = body;

    this.logger.log(`📥 MCP JSON-RPC Request: method=${method}, id=${id}`);

    try {
      // Handle standard MCP lifecycle
      if (method === 'initialize') {
        return res.status(HttpStatus.OK).json({
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: '2024-11-05',
            serverInfo: {
              name: 'vishnu-thankappan-portfolio-mcp',
              version: '1.0.0',
            },
            capabilities: {
              tools: {},
              prompts: {},
              resources: {},
            },
          },
        });
      }

      if (method === 'notifications/initialized') {
        return res.status(HttpStatus.OK).json({ jsonrpc: '2.0', id, result: {} });
      }

      if (method === 'ping') {
        return res.status(HttpStatus.OK).json({ jsonrpc: '2.0', id, result: {} });
      }

      // List available tools
      if (method === 'tools/list') {
        const tools = this.mcpService.getTools();
        return res.status(HttpStatus.OK).json({
          jsonrpc: '2.0',
          id,
          result: { tools },
        });
      }

      // Execute a specific tool
      if (method === 'tools/call') {
        const { name, arguments: toolArgs } = params || {};
        const toolResult = await this.mcpService.executeTool(name, toolArgs || {});

        return res.status(HttpStatus.OK).json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: typeof toolResult === 'string' ? toolResult : JSON.stringify(toolResult, null, 2),
              },
            ],
          },
        });
      }

      // Unsupported method fallback
      return res.status(HttpStatus.OK).json({
        jsonrpc: '2.0',
        id,
        error: {
          code: -32601,
          message: `Method '${method}' not found`,
        },
      });
    } catch (error: any) {
      this.logger.error(`MCP execution error: ${error.message}`);
      return res.status(HttpStatus.OK).json({
        jsonrpc: '2.0',
        id,
        error: {
          code: -32603,
          message: error.message || 'Internal MCP server error',
        },
      });
    }
  }

  /**
   * 3. ChatGPT Actions & LLM Full Context Endpoint
   * Returns clean, structured JSON context for Custom GPTs and Perplexity.
   * Path: /api/agent/context
   */
  @Get('agent/context')
  async getAgentContext() {
    return await this.mcpService.getFullAgentContext();
  }

  /**
   * 4. Natural Language Agent Query REST Endpoint
   * Exposes a direct question-answering endpoint for custom agent pipelines.
   * Path: /api/agent/query
   */
  @Post('agent/query')
  async queryAgent(@Body() body: { question: string }) {
    const question = body.question || '';
    if (!question.trim()) {
      return {
        answer: 'Please provide a question about Vishnu Thankappan’s experience, architecture, or skills.',
        references: [],
      };
    }
    return await this.mcpService.answerQuery(question);
  }

  /**
   * 5. Agent Tools Discovery Endpoint (REST)
   * Path: /api/agent/tools
   */
  @Get('agent/tools')
  getAgentTools() {
    return {
      server: 'Vishnu Thankappan Agentic Interface',
      protocol: 'Model Context Protocol 2024-11-05 & REST',
      tools: this.mcpService.getTools(),
    };
  }
}
