import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

@Injectable()
export class McpService {
  private readonly logger = new Logger(McpService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  // List all available MCP tools supported by this server
  getTools(): McpToolDefinition[] {
    return [
      {
        name: 'get_architect_profile',
        description:
          'Retrieves Vishnu Thankappan’s executive profile, contact information, target roles, and availability status.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_work_history',
        description:
          'Retrieves verified enterprise career experience (AVEVA, Maistering B.V, ACI Logistix) with quantifiable achievements.',
        inputSchema: {
          type: 'object',
          properties: {
            company: {
              type: 'string',
              description: 'Optional company name to filter by (e.g. "AVEVA", "Maistering", "ACI Logistix")',
            },
          },
        },
      },
      {
        name: 'search_skills',
        description:
          'Searches verified technical competencies across frontend architecture, AI workflows, testing, and DevOps.',
        inputSchema: {
          type: 'object',
          properties: {
            keyword: {
              type: 'string',
              description: 'Skill or domain keyword (e.g. "Angular", "Nx", "LangGraph", "Microfrontends", "Signals")',
            },
          },
          required: ['keyword'],
        },
      },
      {
        name: 'get_projects',
        description:
          'Lists architectural case studies, problem statements, technology stacks, and GitHub repositories.',
        inputSchema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              description: 'Optional category (e.g. "Architecture", "AI Interfaces", "Modernization")',
            },
          },
        },
      },
      {
        name: 'get_live_demos',
        description:
          'Retrieves interactive live demo applications, including Hugging Face AI spaces, Native Federation remotes, and direct deeplinks.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'ask_portfolio_agent',
        description:
          'Answers natural language questions about Vishnu Thankappan’s architectural pedigree, availability, and engineering philosophy.',
        inputSchema: {
          type: 'object',
          properties: {
            question: {
              type: 'string',
              description: 'The natural language question to answer about Vishnu Thankappan',
            },
          },
          required: ['question'],
        },
      },
    ];
  }

  // Execute an MCP Tool by name with arguments
  async executeTool(name: string, args: Record<string, any> = {}): Promise<any> {
    this.logger.log(`Executing MCP Tool: ${name} with args: ${JSON.stringify(args)}`);

    switch (name) {
      case 'get_architect_profile': {
        const profile = await this.supabaseService.getProfile();
        return {
          name: profile.name,
          title: profile.title,
          tagline: profile.tagline,
          location: profile.location,
          availability: profile.availability,
          contact: {
            email: profile.email,
            linkedin: profile.linkedin,
            github: profile.github,
          },
          summary: profile.summary,
        };
      }

      case 'get_work_history': {
        const experience = await this.supabaseService.getExperience();
        if (args.company) {
          const filter = args.company.toLowerCase();
          return experience.filter((e) => e.company.toLowerCase().includes(filter));
        }
        return experience;
      }

      case 'search_skills': {
        const skills = await this.supabaseService.getSkills();
        const kw = (args.keyword || '').toLowerCase();
        const matched: { category: string; matchedSkills: string[] }[] = [];

        for (const cat of skills) {
          const hits = cat.items.filter((item) => item.toLowerCase().includes(kw));
          if (hits.length > 0) {
            matched.push({
              category: cat.categoryLabel,
              matchedSkills: hits,
            });
          }
        }
        return {
          query: args.keyword,
          foundCount: matched.reduce((acc, curr) => acc + curr.matchedSkills.length, 0),
          results: matched,
        };
      }

      case 'get_projects': {
        return await this.supabaseService.getProjects(false, args.category);
      }

      case 'get_live_demos': {
        const demos = await this.supabaseService.getDemos();
        return demos.map((d) => ({
          id: d.id,
          title: d.title,
          description: d.description,
          type: d.type,
          status: d.status,
          tech: d.tech,
          url: d.url,
          deeplink: `https://www.techiewithbeard.com/demos?demo=${encodeURIComponent(d.id)}`,
          documentation: d.documentation || null,
          videoWalkthrough: d.video || null,
        }));
      }

      case 'ask_portfolio_agent': {
        return await this.answerQuery(args.question || '');
      }

      default:
        throw new Error(`Unknown MCP Tool: ${name}`);
    }
  }

  // Natural Language QA Engine over portfolio context
  async answerQuery(question: string): Promise<{ answer: string; references: string[] }> {
    const q = question.toLowerCase();
    const profile = await this.supabaseService.getProfile();
    const experience = await this.supabaseService.getExperience();
    const demos = await this.supabaseService.getDemos();
    const skills = await this.supabaseService.getSkills();

    const references: string[] = [];

    // Experience / Company Queries
    if (q.includes('aveva') || q.includes('parnasoft') || q.includes('monorepo')) {
      const aveva = experience.find((e) => e.company.toLowerCase().includes('aveva')) || experience[0];
      references.push('https://www.techiewithbeard.com/experience');
      return {
        answer: `At AVEVA (via Parnasoft), Vishnu serves as Lead Frontend Architect. He unified 5+ enterprise Angular applications into an Nx monorepo, cutting CI/CD build times by 30% through affected dependency caching and slashing duplicate UI code by 40%+ using standardized design system tokens. Highlights include: ${aveva?.highlights.slice(0, 2).join(' ')}`,
        references,
      };
    }

    if (q.includes('maistering') || q.includes('european')) {
      const maistering = experience.find((e) => e.company.toLowerCase().includes('maistering'));
      references.push('https://www.techiewithbeard.com/experience');
      return {
        answer: `At Maistering B.V (European enterprise AI platform), Vishnu was an Expert Frontend Engineer delivering AI-assisted enterprise orchestration platforms using Angular, TypeScript, and NgRx with real-time data sync.`,
        references,
      };
    }

    if (q.includes('aci') || q.includes('logistix') || q.includes('migration')) {
      references.push('https://www.techiewithbeard.com/experience');
      return {
        answer: `At ACI Logistix, Vishnu led the end-to-end migration of legacy AngularJS logistics applications to modern Angular (v14+), reducing bundle sizes by 42% with zero downtime, and authored internal NPM design system packages published via Azure Artifacts.`,
        references,
      };
    }

    // AI & Demos
    if (q.includes('ai') || q.includes('demo') || q.includes('talentlens') || q.includes('langgraph') || q.includes('rag')) {
      references.push('https://www.techiewithbeard.com/demos');
      const liveDemos = demos.map((d) => `• ${d.title} (${d.type}): https://www.techiewithbeard.com/demos?demo=${d.id}`).join('\n');
      return {
        answer: `Vishnu has built multiple production-grade AI applications using LangChain, LangGraph, and modern frontend streaming:\n\n${liveDemos}`,
        references,
      };
    }

    // Skills
    if (q.includes('skill') || q.includes('tech') || q.includes('angular') || q.includes('react')) {
      references.push('https://www.techiewithbeard.com');
      const allSkills = skills.map((c) => `${c.categoryLabel}: ${c.items.join(', ')}`).join('\n');
      return {
        answer: `Vishnu's core competencies span:\n${allSkills}`,
        references,
      };
    }

    // Contact & Availability
    if (q.includes('contact') || q.includes('hire') || q.includes('email') || q.includes('available') || q.includes('role')) {
      references.push('https://www.techiewithbeard.com/contact');
      return {
        answer: `Vishnu Thankappan is currently ${profile.availability.status} for ${profile.availability.target} opportunities. You can reach him at ${profile.email}, on LinkedIn at ${profile.linkedin}, or view his code at ${profile.github}.`,
        references,
      };
    }

    // Default Summary
    references.push('https://www.techiewithbeard.com');
    return {
      answer: `${profile.name} (${profile.alias}) is a ${profile.title} with 7+ years of enterprise experience. ${profile.summary} He specializes in Nx Monorepos, Angular 22, Native Federation microfrontends, and LangGraph AI interfaces.`,
      references,
    };
  }

  // Complete Context Dump for ChatGPT Actions / LangChain
  async getFullAgentContext(): Promise<any> {
    const profile = await this.supabaseService.getProfile();
    const experience = await this.supabaseService.getExperience();
    const projects = await this.supabaseService.getProjects();
    const demos = await this.supabaseService.getDemos();
    const skills = await this.supabaseService.getSkills();

    return {
      metadata: {
        specVersion: '1.0.0',
        standard: 'WebMCP / Model Context Protocol',
        generatedAt: new Date().toISOString(),
        author: 'Vishnu Thankappan',
        website: 'https://www.techiewithbeard.com',
        mcpEndpoint: 'https://vishnu-portfolio-api.onrender.com/mcp/sse',
      },
      profile,
      experience,
      projects,
      demos,
      skills,
    };
  }
}
