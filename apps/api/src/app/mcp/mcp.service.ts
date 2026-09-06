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
  async executeTool(name: string, rawArgs: any = {}): Promise<any> {
    this.logger.log(`Executing MCP Tool: ${name} with rawArgs: ${JSON.stringify(rawArgs)}`);

    let args: Record<string, any> = {};
    if (typeof rawArgs === 'string') {
      const trimmed = rawArgs.trim();
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        try {
          args = JSON.parse(trimmed);
        } catch {
          args = { question: trimmed, keyword: trimmed, company: trimmed };
        }
      } else {
        args = { question: trimmed, keyword: trimmed, company: trimmed };
      }
    } else if (rawArgs && typeof rawArgs === 'object') {
      args = rawArgs;
    }

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
        const companyFilter = args.company || args.filter || '';
        if (companyFilter) {
          const filter = companyFilter.toLowerCase();
          return experience.filter((e) => e.company.toLowerCase().includes(filter));
        }
        return experience;
      }

      case 'search_skills': {
        const skills = await this.supabaseService.getSkills();
        const kw = (args.keyword || args.query || args.skill || '').toLowerCase();
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
          query: args.keyword || args.query || kw,
          foundCount: matched.reduce((acc, curr) => acc + curr.matchedSkills.length, 0),
          results: matched.length > 0 ? matched : skills,
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
        const question = args.question || args.query || args.prompt || '';
        return await this.answerQuery(question);
      }

      default:
        throw new Error(`Unknown MCP Tool: ${name}`);
    }
  }

  // Natural Language QA Engine over portfolio context
  async answerQuery(question: string): Promise<{ answer: string; references: string[] }> {
    const q = (question || '').toLowerCase().trim();
    const profile = await this.supabaseService.getProfile();
    const experience = await this.supabaseService.getExperience();
    const demos = await this.supabaseService.getDemos();
    const skills = await this.supabaseService.getSkills();

    const references: string[] = [];

    // 1. AVEVA / Parnasoft
    if (q.includes('aveva') || q.includes('parnasoft')) {
      const aveva = experience.find((e) => e.company.toLowerCase().includes('aveva')) || experience[0];
      references.push('https://www.techiewithbeard.com/experience');
      return {
        answer: `At AVEVA (via Parnasoft), Vishnu serves as Lead Frontend Architect. He unified 5+ enterprise Angular applications into an Nx monorepo, cutting CI/CD build times by 30% through affected dependency caching and slashing duplicate UI code by 40%+ using standardized design system tokens. Highlights include: ${aveva?.highlights?.slice(0, 3)?.join(' ') || ''}`,
        references,
      };
    }

    // 2. Maistering B.V
    if (q.includes('maistering') || q.includes('european') || q.includes('netherlands')) {
      references.push('https://www.techiewithbeard.com/experience');
      return {
        answer: `At Maistering B.V (European enterprise AI platform), Vishnu was an Expert Frontend Engineer delivering AI-assisted enterprise orchestration platforms using Angular, TypeScript, and NgRx with real-time data sync.`,
        references,
      };
    }

    // 3. ACI Logistix
    if (q.includes('aci') || q.includes('logistix') || q.includes('migration') || q.includes('logistics')) {
      references.push('https://www.techiewithbeard.com/experience');
      return {
        answer: `At ACI Logistix, Vishnu led the end-to-end migration of legacy AngularJS logistics applications to modern Angular (v14+), reducing bundle sizes by 42% with zero downtime, and authored internal NPM design system packages published via Azure Artifacts.`,
        references,
      };
    }

    // 4. Career History & Experience / Timeline
    if (q.includes('year') || q.includes('how long') || q.includes('experience') || q.includes('career') || q.includes('history') || q.includes('track record') || q.includes('companies') || q.includes('where')) {
      references.push('https://www.techiewithbeard.com/experience');
      return {
        answer: `Vishnu Thankappan has 7+ years of enterprise engineering experience (2019 – Present):\n• AVEVA / Parnasoft (2022 – Present): Lead Frontend Architect\n• Maistering B.V (2021 – 2022): Expert Frontend Engineer (European AI)\n• ACI Logistix (2019 – 2021): Senior Software Engineer\n\nDeeply specialized in Nx monorepos, Native Federation microfrontends, Angular 22 Signals, and streaming AI interfaces.`,
        references,
      };
    }

    // 5. Chat Widget Architecture / React Component Inquiry
    if ((q.includes('react') || q.includes('chat') || q.includes('widget') || q.includes('cockpit')) && (q.includes('this') || q.includes('how') || q.includes('built') || q.includes('what') || q.includes('angular') || q.includes('mfe') || q.includes('component'))) {
      references.push('https://www.techiewithbeard.com/architecture');
      return {
        answer: `Great architectural observation! ⚛️ This exact AI Chat Cockpit is a **React 19 microfrontend** built with TypeScript and Vite, dynamically mounted inside Vishnu's **Angular 22 enterprise shell** using custom element wrapping and Native Federation! It showcases seamless multi-framework interoperability within an Nx monorepo.`,
        references,
      };
    }

    // 6. Architecture & Monorepos & Microfrontends
    if (q.includes('monorepo') || q.includes('nx') || q.includes('federation') || q.includes('microfrontend') || q.includes('architect')) {
      references.push('https://www.techiewithbeard.com/architecture');
      return {
        answer: `As Lead Frontend Architect, Vishnu specializes in:\n• Nx Enterprise Monorepos: Module federation, affected CI/CD caching, and strict module boundary rules (eslint-plugin-nx-enforce-module-boundaries).\n• Native Federation: Framework-agnostic microfrontends sharing Angular 22 and React 19 shells.\n• Design Systems: Centralized Figma-to-code token pipelines reducing duplicate UI code across teams by 40%+.`,
        references,
      };
    }

    // 6. AI & Demos & Projects
    if (q.includes('ai') || q.includes('demo') || q.includes('project') || q.includes('talentlens') || q.includes('langgraph') || q.includes('rag') || q.includes('llm') || q.includes('agent')) {
      references.push('https://www.techiewithbeard.com/demos');
      const liveDemos = demos.map((d) => `• ${d.title} (${d.type}): https://www.techiewithbeard.com/demos?demo=${d.id}`).join('\n');
      return {
        answer: `Vishnu has built multiple production-grade AI applications using LangChain, LangGraph, and modern frontend streaming:\n\n${liveDemos}`,
        references,
      };
    }

    // 7. Skills & Tech Stack
    if (q.includes('skill') || q.includes('tech') || q.includes('stack') || q.includes('angular') || q.includes('react') || q.includes('typescript') || q.includes('next') || q.includes('node') || q.includes('nest')) {
      references.push('https://www.techiewithbeard.com');
      const allSkills = skills.map((c) => `${c.categoryLabel}: ${c.items.join(', ')}`).join('\n');
      return {
        answer: `Vishnu's core competencies span:\n${allSkills}`,
        references,
      };
    }

    // 8. Funny, Personal, or Out-of-Context Banter
    const isFunnyOrPersonal =
      q.includes('joke') ||
      q.includes('funny') ||
      q.includes('haha') ||
      q.includes('lol') ||
      q.includes('coffee') ||
      q.includes('pizza') ||
      q.includes('food') ||
      q.includes('beer') ||
      q.includes('whiskey') ||
      q.includes('girlfriend') ||
      q.includes('boyfriend') ||
      q.includes('married') ||
      q.includes('marry') ||
      q.includes('love') ||
      q.includes('secret') ||
      q.includes('hobbies') ||
      q.includes('hobby') ||
      q.includes('game') ||
      q.includes('robot') ||
      q.includes('skynet') ||
      q.includes('weather');

    if (isFunnyOrPersonal) {
      references.push('https://www.techiewithbeard.com');
      let joke = 'Why do frontend architects love dark mode? Because light attracts bugs! 🐛';
      if (q.includes('coffee')) {
        joke = 'Vishnu converts dark roast espresso into clean TypeScript and Angular 22 Signals at a 1:1 ratio! ☕⚡';
      } else if (q.includes('robot') || q.includes('skynet')) {
        joke = "Don't worry, the robots aren't taking over yet—we're still busy trying to vertically center a `<div>`! 🤖😅";
      } else if (q.includes('pizza') || q.includes('food')) {
        joke = 'A great slice of pizza is like an enterprise Nx monorepo: crisp crust, perfect layers, and zero circular dependencies! 🍕';
      } else if (q.includes('marry') || q.includes('married') || q.includes('love')) {
        joke = 'Vishnu is already in a committed relationship—with clean code architecture, semantic HTML, and his espresso machine! 💍☕';
      }

      return {
        answer:
          `😄 ${joke}\n\n` +
          `*(P.S. I've logged this curveball and beamed a note directly over to Vishnu's terminal. ` +
          `He'll definitely get a kick out of this and will follow up with you next time!)*\n\n` +
          `In the meantime, feel free to ask me anything about his 7+ years of enterprise UI architecture or live AI demos at [techiewithbeard.com](https://www.techiewithbeard.com)!`,
        references,
      };
    }

    // 9. Contact & Availability / Hiring
    if (q.includes('contact') || q.includes('hire') || q.includes('email') || q.includes('available') || q.includes('role') || q.includes('rate') || q.includes('reach') || q.includes('linkedin')) {
      references.push('https://www.techiewithbeard.com/contact');
      return {
        answer: `Vishnu Thankappan is currently ${profile.availability?.status || 'Open'} for ${profile.availability?.target || 'Staff / Lead Frontend Architect'} opportunities.\n• Email: ${profile.email}\n• LinkedIn: ${profile.linkedin}\n• GitHub: ${profile.github}`,
        references,
      };
    }

    // 9. Bio / Overview / Who is Vishnu
    if (!q || q.includes('who') || q.includes('about') || q.includes('bio') || q.includes('intro') || q.includes('profile') || q.includes('tell me') || q.includes('summary')) {
      references.push('https://www.techiewithbeard.com');
      return {
        answer: `${profile.name} (${profile.alias}) is a ${profile.title} based in ${profile.location}. With 7+ years of enterprise experience, he leads architecture across Nx monorepos, Angular 22, Native Federation microfrontends, and LangGraph AI interfaces.`,
        references,
      };
    }

    // 10. Default contextual answer
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
