import { EnvironmentProviders, provideExperimentalWebMcpTools } from '@angular/core';
import { resume, demos } from '../../data/portfolio.data';

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
        const data = window.agentAPI ? await window.agentAPI.getProfile() : resume;
        return {
          content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
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
      execute: async (args: any) => {
        const company = args?.company;
        const data = window.agentAPI ? await window.agentAPI.getExperience(company) : resume.experience;
        return {
          content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
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
      execute: async (args: any) => {
        const keyword = args?.keyword;
        const data = window.agentAPI ? await window.agentAPI.getSkills(keyword) : resume.skills;
        return {
          content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
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
        const data = window.agentAPI ? await window.agentAPI.getDemos() : demos;
        return {
          content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
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
            description: "Natural language query about Vishnu's experience or architecture",
          },
        },
        required: ['question'],
      },
      execute: async (args: any) => {
        const question = args?.question || args?.query || '';
        const data = window.agentAPI ? await window.agentAPI.ask(question) : { answer: 'Portfolio agent loading...' };
        const text = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
        return {
          content: [{ type: 'text', text }],
        };
      },
    },
  ]);
}
