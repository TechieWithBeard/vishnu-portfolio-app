import { EnvironmentProviders, provideExperimentalWebMcpTools } from '@angular/core';
import { resume, demos } from '../../data/portfolio.data';

/**
 * Helper to safely extract arguments whether Chrome DevTools passes:
 * - A parsed JavaScript object: { question: "..." }
 * - A stringified JSON object: '{"question":"..."}'
 * - A raw string parameter: "What did you do at AVEVA?"
 */
function extractParam(rawArgs: any, key: string, fallbackKey?: string): string {
  if (!rawArgs) return '';
  if (typeof rawArgs === 'object') {
    const val = rawArgs[key] ?? (fallbackKey ? rawArgs[fallbackKey] : '');
    return typeof val === 'string' ? val.trim() : (val ? String(val) : '');
  }
  if (typeof rawArgs === 'string') {
    const trimmed = rawArgs.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === 'object') {
          const val = parsed[key] ?? (fallbackKey ? parsed[fallbackKey] : '');
          return typeof val === 'string' ? val.trim() : (val ? String(val) : '');
        }
      } catch {}
    }
    // Direct raw string passed in DevTools input field
    return trimmed;
  }
  return '';
}

/**
 * Official Angular 22 WebMCP Tools Provider
 * Implements https://angular.dev/ai/webmcp
 * Exposes portfolio query capabilities directly to Chrome DevTools (Application > WebMCP)
 * and in-browser AI agents with full DI-lifecycle management.
 */
export function providePortfolioWebMcp(): EnvironmentProviders {
  return provideExperimentalWebMcpTools([
    {
      name: 'get_architect_profile',
      description: "Retrieve Vishnu Thankappan's architect profile, contact details, availability status, and bio.",
      inputSchema: {
        type: 'object',
        properties: {},
      },
      execute: async () => {
        let profile = resume;
        if (window.agentAPI) {
          try {
            profile = await window.agentAPI.getProfile();
          } catch {}
        }
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              name: profile.name,
              alias: profile.alias,
              title: profile.title,
              tagline: profile.tagline,
              location: profile.location,
              availability: profile.availability,
              email: profile.email,
              linkedin: profile.linkedin,
              github: profile.github,
              summary: profile.summary,
            }, null, 2),
          }],
        };
      },
    },
    {
      name: 'get_work_history',
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
      execute: async (rawArgs: any) => {
        const company = extractParam(rawArgs, 'company');
        let history = resume.experience;
        if (window.agentAPI) {
          try {
            history = await window.agentAPI.getExperience(company || undefined);
          } catch {}
        } else if (company) {
          const filter = company.toLowerCase();
          history = history.filter((e) => e.company.toLowerCase().includes(filter));
        }

        return {
          content: [{
            type: 'text',
            text: JSON.stringify(history.map((h) => ({
              company: h.company,
              role: h.role,
              period: h.period,
              location: h.location,
              highlights: h.highlights,
              tech: h.tech,
            })), null, 2),
          }],
        };
      },
    },
    {
      name: 'search_skills',
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
      execute: async (rawArgs: any) => {
        const keyword = extractParam(rawArgs, 'keyword');
        let skills: Record<string, string[]> = resume.skills;
        if (window.agentAPI) {
          try {
            skills = await window.agentAPI.getSkills(keyword || undefined);
          } catch {}
        } else if (keyword) {
          const kw = keyword.toLowerCase();
          const filtered: Record<string, string[]> = {};
          for (const [cat, items] of Object.entries(skills)) {
            const hits = items.filter((i) => i.toLowerCase().includes(kw));
            if (hits.length > 0) filtered[cat] = hits;
          }
          skills = filtered;
        }

        return {
          content: [{
            type: 'text',
            text: JSON.stringify(skills, null, 2),
          }],
        };
      },
    },
    {
      name: 'get_live_demos',
      description: "Retrieve all interactive AI and frontend demos with deep-links, live sandboxes, and documentation.",
      inputSchema: {
        type: 'object',
        properties: {},
      },
      execute: async () => {
        let liveDemos = demos;
        if (window.agentAPI) {
          try {
            liveDemos = await window.agentAPI.getDemos();
          } catch {}
        }
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(liveDemos.map((d) => ({
              id: d.id,
              title: d.title,
              description: d.description,
              type: d.type,
              url: `https://www.techiewithbeard.com/demos?demo=${d.id}`,
            })), null, 2),
          }],
        };
      },
    },
    {
      name: 'ask_portfolio_agent',
      description: "Query Vishnu Thankappan's career, architectural decisions, and projects using natural language.",
      inputSchema: {
        type: 'object',
        properties: {
          question: {
            type: 'string',
            description: "Natural language query about Vishnu's experience, architecture, or skills",
          },
        },
        required: ['question'],
      },
      execute: async (rawArgs: any) => {
        const question = extractParam(rawArgs, 'question', 'query');
        let answer: any = null;
        if (window.agentAPI) {
          try {
            answer = await window.agentAPI.ask(question);
          } catch {}
        }

        const text = typeof answer === 'string'
          ? answer
          : JSON.stringify(answer || { answer: 'Portfolio agent answering...', question }, null, 2);

        return {
          content: [{ type: 'text', text }],
        };
      },
    },
  ]);
}
