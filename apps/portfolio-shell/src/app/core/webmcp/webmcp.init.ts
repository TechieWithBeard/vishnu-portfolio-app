/**
 * WebMCP Browser Interface for Vishnu Thankappan Portfolio
 * Exposes a structured client-side agent API on `window.agentAPI`
 * allowing in-browser AI agents and developers to query portfolio data.
 * Resilient to network outages with automatic client-side knowledge fallback.
 */

import { resume as fallbackResume, demos, projects } from '../../data/portfolio.data';

declare global {
  interface Window {
    agentAPI?: {
      getProfile: () => Promise<any>;
      getExperience: (company?: string) => Promise<any>;
      getSkills: (keyword?: string) => Promise<any>;
      getDemos: () => Promise<any>;
      ask: (question: string) => Promise<any>;
      help: () => void;
    };
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

  // Welcome console banner for developers & agents
  console.log(
    `%c⚡ WebMCP Interface Active %c— Type %cagentAPI.help()%c to query Vishnu's experience programmatically.`,
    'background: #2563eb; color: #ffffff; padding: 2px 6px; border-radius: 4px; font-weight: bold;',
    'color: #94a3b8;',
    'color: #38bdf8; font-weight: bold; text-decoration: underline;',
    'color: #94a3b8;'
  );
}
