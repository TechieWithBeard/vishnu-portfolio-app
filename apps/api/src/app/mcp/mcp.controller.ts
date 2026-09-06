import {
  Controller,
  Get,
  Post,
  Body,
  Res,
  HttpStatus,
  Logger,
  Headers,
  Query,
  Req,
} from '@nestjs/common';
import { Response } from 'express';
import { McpService } from './mcp.service';
import { SupabaseService } from '../supabase/supabase.service';

@Controller()
export class McpController {
  private readonly logger = new Logger(McpController.name);

  constructor(
    private readonly mcpService: McpService,
    private readonly supabaseService: SupabaseService,
  ) {}

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
   * 4. Agent Visitor Quota Query REST Endpoint
   * Returns current free exploratory quota stored in Supabase.
   * Path: /api/agent/quota
   */
  @Get('agent/quota')
  async getAgentQuota(
    @Query('visitor_id') visitorId?: string,
    @Headers('x-visitor-id') headerVisitorId?: string,
    @Headers('x-session-id') headerSessionId?: string,
    @Req() req?: any,
  ) {
    const vid = visitorId || headerVisitorId || headerSessionId || 'anonymous';
    const clientIp =
      (req?.headers?.['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req?.socket?.remoteAddress ||
      'anon';
    const ipHash =
      clientIp !== 'anon' ? Buffer.from(clientIp).toString('base64').substring(0, 16) : undefined;

    const quota = await this.supabaseService.getVisitorQuota(vid, ipHash);
    const maxPrompts = 3;
    const promptsUsed = quota.promptsUsed || 0;
    const remaining = Math.max(0, maxPrompts - promptsUsed);

    return {
      visitor_id: vid,
      prompts_used: promptsUsed,
      quota_remaining: remaining,
      max_prompts: maxPrompts,
      has_free_quota: remaining > 0,
      last_prompt_at: quota.lastPromptAt,
    };
  }

  /**
   * 5. Natural Language Agent Query REST Endpoint
   * Exposes a direct question-answering endpoint for custom agent pipelines.
   * Path: /api/agent/query
   * If ML_SERVICE_URL is set, delegates to the LangGraph ML backend service.
   */
  @Post('agent/query')
  async queryAgent(
    @Body()
    body: {
      question: string;
      target_url?: string;
      provider?: string;
      chat_model?: string;
      openai_base_url?: string;
      ollama_url?: string;
    },
    @Headers('x-openai-key') openAiKey?: string,
    @Headers('x-hf-token') hfToken?: string,
    @Headers('x-visitor-id') visitorIdHeader?: string,
    @Headers('x-session-id') sessionIdHeader?: string,
    @Req() req?: any,
  ) {
    const question = (body.question || '').trim();
    if (!question) {
      return {
        answer: 'Please provide a question about Vishnu Thankappan’s experience, architecture, or skills.',
        references: [],
      };
    }

    const vid = visitorIdHeader || sessionIdHeader || 'anonymous';
    const clientIp =
      (req?.headers?.['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req?.socket?.remoteAddress ||
      'anon';
    const ipHash =
      clientIp !== 'anon' ? Buffer.from(clientIp).toString('base64').substring(0, 16) : undefined;

    const hasCustomKey = !!(openAiKey?.trim() || hfToken?.trim() || body.provider === 'ollama');

    // 100 character restriction applies ONLY to free tier!
    const maxChars = hasCustomKey ? 1000 : 100;
    if (question.length > maxChars) {
      return {
        answer: hasCustomKey
          ? `Queries are limited to a maximum of 1,000 characters (your question has ${question.length} characters). Please ask a more focused question!`
          : `Queries on the free tier are limited to a maximum of 100 characters (your question has ${question.length} characters). Connect your API key in Settings (⚙️) for longer queries and unlimited chats!`,
        references: [],
      };
    }

    // Enforce Supabase Persistent Free Quota (3 exploratory queries)
    if (!hasCustomKey) {
      const quota = await this.supabaseService.getVisitorQuota(vid, ipHash);
      if ((quota.promptsUsed || 0) >= 3) {
        return {
          answer:
            "✨ **You've completed your 3 free exploratory questions!**\n\n" +
            "Thank you for exploring Vishnu's portfolio agent! To ensure this demo stays fast and accessible for everyone, free exploratory queries are capped at 3 per visitor.\n\n" +
            "To continue chatting and exploring without any limits:\n\n" +
            "1. Click **Settings (⚙️)** in the top bar (or use the banner below).\n" +
            "2. Add your personal **OpenAI API Key** (`sk-...`) or free **Hugging Face Token** (`hf_...`).\n" +
            "3. Your credentials stay strictly in your browser session memory and unlock **unlimited questions**.\n\n" +
            "You can also explore Vishnu's verified architecture directly at [techiewithbeard.com/experience](https://www.techiewithbeard.com/experience) or get in touch at [techiewithbeard.com/contact](https://www.techiewithbeard.com/contact)!",
          references: [
            'https://www.techiewithbeard.com/experience',
            'https://www.techiewithbeard.com/demos',
            'https://www.techiewithbeard.com/contact',
          ],
          quota_remaining: 0,
          is_free_tier: true,
          requires_custom_key: true,
        };
      }
    }

    let remainingQuota: number | undefined;

    if (!hasCustomKey) {
      const updatedCount = await this.supabaseService.incrementVisitorQuota(vid, ipHash);
      remainingQuota = Math.max(0, 3 - updatedCount);
    }

    const mlServiceUrl =
      process.env['ML_SERVICE_URL'] || 'https://vishnu-portfolio-ml.onrender.com';
    if (mlServiceUrl) {
      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (openAiKey) headers['x-openai-key'] = openAiKey;
        if (hfToken) headers['x-hf-token'] = hfToken;
        headers['x-session-id'] = vid;
        headers['x-visitor-id'] = vid;

        const response = await fetch(`${mlServiceUrl.replace(/\/$/, '')}/agent/query`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            question,
            target_url: body.target_url || 'https://www.techiewithbeard.com',
            provider: body.provider,
            chat_model: body.chat_model,
            openai_base_url: body.openai_base_url,
            ollama_url: body.ollama_url,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (!hasCustomKey && remainingQuota !== undefined) {
            data.quota_remaining = remainingQuota;
            data.is_free_tier = true;
            data.requires_custom_key = remainingQuota === 0;
          }
          return data;
        }
      } catch (err: any) {
        this.logger.warn(`ML backend call to ${mlServiceUrl} failed, falling back to local engine: ${err.message}`);
      }
    }

    const localResult = await this.mcpService.answerQuery(question);
    return {
      ...localResult,
      quota_remaining: remainingQuota,
      is_free_tier: !hasCustomKey,
      requires_custom_key: remainingQuota === 0,
    };
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

  /**
   * 6. Standard MCP Discovery Endpoints
   * Spec: Model Context Protocol /.well-known/mcp.json and /mcp.json
   */
  @Get(['.well-known/mcp.json', 'mcp.json'])
  getMcpDiscoveryManifest() {
    return {
      $schema: 'https://modelcontextprotocol.io/schema.json',
      name: 'techiewithbeard-portfolio-mcp',
      description: "Vishnu Thankappan's official portfolio Model Context Protocol (MCP) and WebMCP interface.",
      version: '1.0.0',
      author: 'Vishnu Thankappan (@techiewithbeard)',
      homepage: 'https://www.techiewithbeard.com',
      mcpServers: {
        'portfolio-mcp': {
          type: 'sse',
          url: 'https://vishnu-portfolio-api.onrender.com/mcp/sse',
          postEndpoint: 'https://vishnu-portfolio-api.onrender.com/mcp/messages',
        },
      },
      webmcp: {
        enabled: true,
        framework: 'Angular 22 (provideExperimentalWebMcpTools)',
        specification: 'https://angular.dev/ai/webmcp',
        runtimeApi: 'document.modelContext',
        tools: this.mcpService.getTools().map((t: any) => ({ name: t.name, description: t.description })),
      },
      endpoints: {
        sse: 'https://vishnu-portfolio-api.onrender.com/mcp/sse',
        messages: 'https://vishnu-portfolio-api.onrender.com/mcp/messages',
        context: 'https://vishnu-portfolio-api.onrender.com/api/agent/context',
        query: 'https://vishnu-portfolio-api.onrender.com/api/agent/query',
        llms: 'https://www.techiewithbeard.com/llms.txt',
      },
    };
  }
}
