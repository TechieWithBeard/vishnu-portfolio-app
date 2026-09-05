/**
 * WebMCP Browser Interface for Vishnu Thankappan Portfolio
 * Exposes a structured client-side agent API on `window.agentAPI`
 * allowing in-browser AI agents and developers to query portfolio data.
 */

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

  window.agentAPI = {
    async getProfile() {
      try {
        const res = await fetch(`${apiUrl}/profile`);
        return await res.json();
      } catch (err: any) {
        return { error: `Failed to fetch profile: ${err.message}` };
      }
    },

    async getExperience(company?: string) {
      try {
        const res = await fetch(`${apiUrl}/experience`);
        const data = await res.json();
        if (company) {
          const filter = company.toLowerCase();
          return data.filter((e: any) => e.company?.toLowerCase().includes(filter));
        }
        return data;
      } catch (err: any) {
        return { error: `Failed to fetch experience: ${err.message}` };
      }
    },

    async getSkills(keyword?: string) {
      try {
        const res = await fetch(`${apiUrl}/skills`);
        const data = await res.json();
        if (keyword) {
          const kw = keyword.toLowerCase();
          return data
            .map((cat: any) => ({
              category: cat.categoryLabel,
              items: (cat.items || []).filter((i: string) => i.toLowerCase().includes(kw)),
            }))
            .filter((c: any) => c.items.length > 0);
        }
        return data;
      } catch (err: any) {
        return { error: `Failed to fetch skills: ${err.message}` };
      }
    },

    async getDemos() {
      try {
        const res = await fetch(`${apiUrl}/demos`);
        const data = await res.json();
        return data.map((d: any) => ({
          ...d,
          deeplink: `https://www.techiewithbeard.com/demos?demo=${encodeURIComponent(d.id)}`,
        }));
      } catch (err: any) {
        return { error: `Failed to fetch demos: ${err.message}` };
      }
    },

    async ask(question: string) {
      if (!question || !question.trim()) {
        return 'Please provide a question (e.g. `await agentAPI.ask("What did Vishnu do at AVEVA?")`)';
      }
      try {
        const res = await fetch(`${apiUrl}/agent/query`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question }),
        });
        return await res.json();
      } catch (err: any) {
        return { error: `Agent query failed: ${err.message}` };
      }
    },

    help() {
      console.log(`
%c🤖 Vishnu Thankappan — WebMCP Agentic Console
%cCallable Commands:
  • await agentAPI.ask("your question")  ➔ Natural language query
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
