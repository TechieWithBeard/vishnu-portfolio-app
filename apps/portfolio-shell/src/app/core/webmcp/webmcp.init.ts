/**
 * WebMCP Browser Interface for Vishnu Thankappan Portfolio
 * Exposes a structured client-side agent API on `window.agentAPI`
 * allowing in-browser AI agents and developers to query portfolio data.
 * Resilient to network outages with automatic client-side knowledge fallback.
 */

import { resume as fallbackResume, demos, projects } from '../../data/portfolio.data';

interface WebMcpTool {
  name: string;
  title?: string;
  description: string;
  inputSchema: {
    type: string;
    properties?: Record<string, any>;
    required?: string[];
  };
  execute: (args?: any) => Promise<any> | any;
}

interface ModelContextApi {
  registerTool: (tool: WebMcpTool) => Promise<any> | any;
  unregisterTool?: (name: string) => Promise<any> | any;
  listTools?: () => Promise<any> | any;
}

declare global {
  interface Navigator {
    modelContext?: ModelContextApi;
    modelContextTesting?: any;
  }
  interface Document {
    modelContext?: ModelContextApi;
  }
  interface Window {
    agentAPI?: {
      getProfile: () => Promise<any>;
      getExperience: (company?: string) => Promise<any>;
      getSkills: (keyword?: string) => Promise<any>;
      getDemos: () => Promise<any>;
      ask: (question: string) => Promise<any>;
      help: () => void;
      tools?: WebMcpTool[];
    };
    modelContext?: ModelContextApi;
  }
}

export function initWebMcp(apiUrl: string): void {
  if (typeof window === 'undefined') return;

  // Local fallback knowledge answer engine
  function answerQueryLocally(question: string): { answer: string; references: string[] } {
    const q = question.toLowerCase();
    const references: string[] = [];

    // Experience / Years
    if (q.includes('year') || q.includes('how long') || q.includes('experience')) {
      references.push('https://www.techiewithbeard.com/experience');
      return {
        answer: 'Vishnu Thankappan has 7+ years of enterprise engineering experience (2019 – Present), delivering high-scale frontend architectures and AI interfaces for AVEVA, ACI Logistix, and Maistering B.V.',
        references,
      };
    }

    // AVEVA / Monorepo
    if (q.includes('aveva') || q.includes('parnasoft') || q.includes('monorepo')) {
      references.push('https://www.techiewithbeard.com/experience');
      return {
        answer: 'At AVEVA (via Parnasoft), Vishnu is Lead Frontend Architect. He unified 5+ production Angular enterprise applications into an Nx monorepo, cutting CI/CD build times by 30% through affected dependency caching and slashing duplicate UI code by 40%+ using standardized design system tokens.',
        references,
      };
    }

    // Maistering B.V
    if (q.includes('maistering') || q.includes('european')) {
      references.push('https://www.techiewithbeard.com/experience');
      return {
        answer: 'At Maistering B.V (European enterprise AI platform), Vishnu worked as an Expert Frontend Engineer delivering AI-assisted business management platforms using Angular, TypeScript, and NgRx with real-time data sync.',
        references,
      };
    }

    // ACI Logistix
    if (q.includes('aci') || q.includes('logistix') || q.includes('migration')) {
      references.push('https://www.techiewithbeard.com/experience');
      return {
        answer: 'At ACI Logistix, Vishnu led the end-to-end migration of legacy AngularJS logistics applications to modern Angular (v14+), reducing bundle sizes by 42% with zero downtime, and authored internal NPM design system packages published via Azure Artifacts.',
        references,
      };
    }

    // AI & Demos
    if (q.includes('ai') || q.includes('demo') || q.includes('talentlens') || q.includes('langgraph') || q.includes('rag')) {
      references.push('https://www.techiewithbeard.com/demos');
      const demoList = demos.map((d) => `• ${d.title} (${d.type}): https://www.techiewithbeard.com/demos?demo=${d.id}`).join('\n');
      return {
        answer: `Vishnu has built multiple production-grade AI applications using LangChain, LangGraph, and modern frontend streaming:\n\n${demoList}`,
        references,
      };
    }

    // Skills
    if (q.includes('skill') || q.includes('tech') || q.includes('angular') || q.includes('react')) {
      references.push('https://www.techiewithbeard.com');
      return {
        answer: `Vishnu's core competencies span: Angular 22, React 19, TypeScript 5.8+, Nx Monorepos, Native Federation, Microfrontends, LangChain, LangGraph, Streaming UIs, RAG, Playwright, and CI/CD pipelines.`,
        references,
      };
    }

    // Contact & Hiring
    if (q.includes('contact') || q.includes('hire') || q.includes('email') || q.includes('available') || q.includes('role')) {
      references.push('https://www.techiewithbeard.com/contact');
      return {
        answer: `Vishnu Thankappan is currently ${fallbackResume.availability.status} for ${fallbackResume.availability.target}. You can reach him at ${fallbackResume.email}, on LinkedIn at ${fallbackResume.linkedin}, or view his code at ${fallbackResume.github}.`,
        references,
      };
    }

    // Default Summary
    references.push('https://www.techiewithbeard.com');
    return {
      answer: `${fallbackResume.name} (${fallbackResume.alias}) is a ${fallbackResume.title} with 7+ years of enterprise experience. ${fallbackResume.summary}`,
      references,
    };
  }

  window.agentAPI = {
    async getProfile() {
      try {
        const res = await fetch(`${apiUrl}/profile`);
        if (res.ok) return await res.json();
      } catch {}
      return fallbackResume;
    },

    async getExperience(company?: string) {
      let data = fallbackResume.experience;
      try {
        const res = await fetch(`${apiUrl}/experience`);
        if (res.ok) data = await res.json();
      } catch {}
      if (company) {
        const filter = company.toLowerCase();
        return data.filter((e: any) => e.company?.toLowerCase().includes(filter));
      }
      return data;
    },

    async getSkills(keyword?: string) {
      const skillsMap = fallbackResume.skills;
      if (keyword) {
        const kw = keyword.toLowerCase();
        const results: Record<string, string[]> = {};
        for (const [cat, items] of Object.entries(skillsMap) as [string, string[]][]) {
          const hits = items.filter((i: string) => i.toLowerCase().includes(kw));
          if (hits.length > 0) results[cat] = hits;
        }
        return results;
      }
      return skillsMap;
    },

    async getDemos() {
      let list = demos;
      try {
        const res = await fetch(`${apiUrl}/demos`);
        if (res.ok) list = await res.json();
      } catch {}
      return list.map((d: any) => ({
        ...d,
        deeplink: `https://www.techiewithbeard.com/demos?demo=${encodeURIComponent(d.id)}`,
      }));
    },

    async ask(question: string) {
      if (!question || !question.trim()) {
        return 'Please provide a question (e.g. `await agentAPI.ask("What did Vishnu do at AVEVA?")`)';
      }

      // Try server endpoint first
      try {
        const res = await fetch(`${apiUrl}/agent/query`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question }),
        });
        if (res.ok) {
          return await res.json();
        }
      } catch {}

      // Resilient local answer fallback
      return answerQueryLocally(question);
    },

    help() {
      console.log(`
%c🤖 Vishnu Thankappan — WebMCP Agentic Console
%cCallable Commands:
  • await agentAPI.ask("your question")  ➔ Natural language query (e.g. "how many years of experience?")
  • await agentAPI.getProfile()          ➔ Complete bio & status
  • await agentAPI.getExperience("AVEVA")➔ Filtered enterprise track record
  • await agentAPI.getSkills("LangGraph")➔ Verified technology matrix
  • await agentAPI.getDemos()             ➔ Interactive microfrontends & deep links
  • llms.txt standard                     ➔ https://www.techiewithbeard.com/llms.txt
  • MCP SSE Endpoint                     ➔ https://vishnu-portfolio-api.onrender.com/mcp/sse
      `, 'font-weight: bold; font-size: 1.1em; color: #3b82f6;', 'color: #94a3b8;');
    },
  };

  const tools: WebMcpTool[] = [
    {
      name: 'get_architect_profile',
      title: 'Get Architect Profile',
      description: "Retrieve Vishnu Thankappan's architect profile, contact details, availability status, and bio.",
      inputSchema: {
        type: 'object',
        properties: {},
      },
      execute: async () => {
        const res = await window.agentAPI!.getProfile();
        return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
      },
    },
    {
      name: 'get_work_history',
      title: 'Get Enterprise Work History',
      description: "Retrieve Vishnu's enterprise work history and track record at AVEVA, Maistering B.V, and ACI Logistix.",
      inputSchema: {
        type: 'object',
        properties: {
          company: {
            type: 'string',
            description: "Optional company name filter (e.g. 'AVEVA', 'Maistering', 'ACI Logistix')",
          },
        },
      },
      execute: async (args: any) => {
        const res = await window.agentAPI!.getExperience(args?.company);
        return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
      },
    },
    {
      name: 'search_skills',
      title: 'Search Technical Skills',
      description: "Search Vishnu's verified technical skills across Frontend Architecture, AI Interfaces, and DevOps.",
      inputSchema: {
        type: 'object',
        properties: {
          keyword: {
            type: 'string',
            description: "Keyword to filter skills (e.g. 'Angular', 'LangGraph', 'TypeScript')",
          },
        },
      },
      execute: async (args: any) => {
        const res = await window.agentAPI!.getSkills(args?.keyword);
        return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
      },
    },
    {
      name: 'get_live_demos',
      title: 'Get Interactive Demos',
      description: "Retrieve all interactive AI and frontend demos with deep-links, live sandboxes, and documentation.",
      inputSchema: {
        type: 'object',
        properties: {},
      },
      execute: async () => {
        const res = await window.agentAPI!.getDemos();
        return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
      },
    },
    {
      name: 'ask_portfolio_agent',
      title: 'Ask Portfolio Agent',
      description: "Query Vishnu Thankappan's career, architectural decisions, and projects using natural language.",
      inputSchema: {
        type: 'object',
        properties: {
          question: {
            type: 'string',
            description: "Natural language query about Vishnu's experience or architecture",
          },
        },
        required: ['question'],
      },
      execute: async (args: any) => {
        const res = await window.agentAPI!.ask(args?.question || args?.query || '');
        const text = typeof res === 'string' ? res : JSON.stringify(res, null, 2);
        return { content: [{ type: 'text', text }] };
      },
    },
  ];

  window.agentAPI.tools = tools;

  // 1. Hook up declarative forms in DOM (Chrome DevTools scans these)
  function bindDeclarativeForms() {
    const formBindings: Record<string, (fd: FormData) => Promise<any>> = {
      'webmcp-tool-profile': async () => window.agentAPI!.getProfile(),
      'webmcp-tool-experience': async (fd) => window.agentAPI!.getExperience(fd.get('company') as string || undefined),
      'webmcp-tool-skills': async (fd) => window.agentAPI!.getSkills(fd.get('keyword') as string || undefined),
      'webmcp-tool-demos': async () => window.agentAPI!.getDemos(),
      'webmcp-tool-ask': async (fd) => window.agentAPI!.ask(fd.get('question') as string || ''),
    };

    for (const [id, fn] of Object.entries(formBindings)) {
      const form = document.getElementById(id) as HTMLFormElement;
      if (form && !form.dataset['bound']) {
        form.dataset['bound'] = 'true';
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const result = await fn(new FormData(form));
          console.log(`%c[WebMCP Activity] %c${id} executed:`, 'color: #8b5cf6; font-weight: bold;', 'color: #38bdf8;', result);
          return result;
        });
      }
    }
  }

  // 2. Register tools with Chrome's native ModelContext API (document.modelContext or navigator.modelContext)
  async function registerNativeModelContext() {
    bindDeclarativeForms();

    const targets: ModelContextApi[] = [];
    if (document.modelContext && typeof document.modelContext.registerTool === 'function') {
      targets.push(document.modelContext);
    }
    if (navigator.modelContext && typeof navigator.modelContext.registerTool === 'function') {
      targets.push(navigator.modelContext);
    }
    if (window.modelContext && typeof window.modelContext.registerTool === 'function') {
      targets.push(window.modelContext);
    }

    // Polyfill / standard shim if browser hasn't attached modelContext yet
    if (targets.length === 0) {
      const toolMap = new Map<string, WebMcpTool>();
      tools.forEach((t) => toolMap.set(t.name, t));

      const standardShim: ModelContextApi = {
        async registerTool(tool: WebMcpTool) {
          toolMap.set(tool.name, tool);
        },
        async unregisterTool(name: string) {
          toolMap.delete(name);
        },
        async listTools() {
          return Array.from(toolMap.values());
        },
      };

      try {
        if (!document.modelContext) (document as any).modelContext = standardShim;
        if (!navigator.modelContext) (navigator as any).modelContext = standardShim;
        if (!window.modelContext) (window as any).modelContext = standardShim;
      } catch {}

      targets.push(standardShim);
    }

    let registeredCount = 0;
    for (const ctx of targets) {
      for (const tool of tools) {
        try {
          await ctx.registerTool(tool);
          registeredCount++;
        } catch {
          // Ignore if tool already registered
        }
      }
      try {
        const ev = new CustomEvent('toolchange', { detail: { tools } });
        (ctx as any).dispatchEvent?.(ev);
      } catch {}
    }

    if (registeredCount > 0) {
      console.log(
        `%c⚡ WebMCP Tools Registered in DevTools %c(${tools.length} available tools)`,
        'background: #10b981; color: #ffffff; padding: 2px 6px; border-radius: 4px; font-weight: bold;',
        'color: #94a3b8;'
      );
    }
  }

  // Register immediately and on lifecycle events
  registerNativeModelContext();
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', registerNativeModelContext);
    }
    window.addEventListener('load', registerNativeModelContext);
    setTimeout(registerNativeModelContext, 300);
    setTimeout(registerNativeModelContext, 1200);
  }

  // Welcome console banner for developers & agents
  console.log(
    `%c⚡ WebMCP Interface Active %c— Type %cagentAPI.help()%c to query Vishnu's experience programmatically.`,
    'background: #2563eb; color: #ffffff; padding: 2px 6px; border-radius: 4px; font-weight: bold;',
    'color: #94a3b8;',
    'color: #38bdf8; font-weight: bold; text-decoration: underline;',
    'color: #94a3b8;'
  );
}
