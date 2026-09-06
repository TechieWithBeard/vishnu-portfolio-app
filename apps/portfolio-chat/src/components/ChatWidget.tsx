import React, { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  references?: string[];
  selectedTool?: string;
  tokens?: number;
  timestamp: string;
}

interface ChatWidgetProps {
  apiUrl?: string;
  onClose?: () => void;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  apiUrl = 'https://vishnu-portfolio-api.onrender.com',
  onClose,
}) => {
  const isLocalHost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const [provider, setProvider] = useState<'openai' | 'huggingface' | 'ollama'>('openai');
  const [apiKey, setApiKey] = useState<string>('');
  const [hfToken, setHfToken] = useState<string>('');
  const [chatModel, setChatModel] = useState<string>('');
  const [ollamaUrl, setOllamaUrl] = useState<string>('http://localhost:11434');
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [quotaRemaining, setQuotaRemaining] = useState<number | null>(3);
  const [requiresCustomKey, setRequiresCustomKey] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'assistant',
      content:
        "Hello! I am Vishnu Thankappan's autonomous portfolio agent, built as a **React 19 microfrontend** federated inside this Angular 22 shell. Powered by LangGraph and Model Context Protocol. You have 3 free questions on our shared demo server to explore his enterprise architecture, Angular 22, and live AI apps. Ask me anything!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Persistent browser visitor ID stored in localStorage (persists across tab & browser closes)
  const getVisitorId = (): string => {
    try {
      let vid = localStorage.getItem('portfolio_visitor_id');
      if (!vid) {
        vid =
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : 'v_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now();
        localStorage.setItem('portfolio_visitor_id', vid);
      }
      return vid;
    } catch {
      return 'v_anon_' + Date.now();
    }
  };

  // Check persisted visitor quota from Supabase on mount
  useEffect(() => {
    const vid = getVisitorId();
    const checkQuota = async () => {
      try {
        const resp = await fetch(
          `${apiUrl.replace(/\/$/, '')}/api/agent/quota?visitor_id=${encodeURIComponent(vid)}`,
          {
            headers: {
              'x-visitor-id': vid,
            },
          }
        );
        if (resp.ok) {
          const data = await resp.json();
          if (typeof data.quota_remaining === 'number') {
            setQuotaRemaining(data.quota_remaining);
            if (data.quota_remaining === 0) {
              setRequiresCustomKey(true);
            }
          }
        }
      } catch {}
    };

    checkQuota();
  }, [apiUrl]);

  // Load session storage settings
  useEffect(() => {
    try {
      const savedProvider = sessionStorage.getItem('portfolio_chat_provider') as 'openai' | 'huggingface' | 'ollama';
      if (savedProvider && (isLocalHost || savedProvider !== 'ollama')) {
        setProvider(savedProvider);
      } else if (!isLocalHost && savedProvider === 'ollama') {
        setProvider('openai');
      }

      const savedKey = sessionStorage.getItem('portfolio_chat_openai_key') || '';
      if (savedKey) setApiKey(savedKey);

      const savedHf = sessionStorage.getItem('portfolio_chat_hf_token') || '';
      if (savedHf) setHfToken(savedHf);

      const savedModel = sessionStorage.getItem('portfolio_chat_model') || '';
      if (savedModel) setChatModel(savedModel);

      const savedOllama = sessionStorage.getItem('portfolio_chat_ollama_url') || '';
      if (savedOllama) setOllamaUrl(savedOllama);
    } catch {}
  }, [isLocalHost]);

  const hasCustomAuth =
    (provider === 'openai' && !!apiKey.trim()) ||
    (provider === 'huggingface' && !!hfToken.trim()) ||
    (provider === 'ollama');

  const saveSettings = (newProvider: 'openai' | 'huggingface' | 'ollama', key: string, hf: string, model: string, oUrl: string) => {
    setProvider(newProvider);
    setApiKey(key);
    setHfToken(hf);
    setChatModel(model);
    setOllamaUrl(oUrl);

    try {
      sessionStorage.setItem('portfolio_chat_provider', newProvider);
      sessionStorage.setItem('portfolio_chat_openai_key', key);
      sessionStorage.setItem('portfolio_chat_hf_token', hf);
      sessionStorage.setItem('portfolio_chat_model', model);
      sessionStorage.setItem('portfolio_chat_ollama_url', oUrl);
    } catch {}

    if ((newProvider === 'openai' && key.trim()) || (newProvider === 'huggingface' && hf.trim()) || newProvider === 'ollama') {
      setRequiresCustomKey(false);
    }
    setShowKeyModal(false);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'init',
        role: 'assistant',
        content:
          "Chat reset. I am ready for your next question with 0 history tokens carried over.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (userText?: string) => {
    let text = (userText || input).trim();
    if (!text || loading) return;

    if (text.length > 100) {
      text = text.slice(0, 100).trim();
    }

    if (provider === 'huggingface' && !hfToken.trim()) {
      setShowKeyModal(true);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // If out of 3 free queries and no custom key is provided:
    // whatever they type, send the predefined response!
    if ((requiresCustomKey || (quotaRemaining !== null && quotaRemaining <= 0)) && !hasCustomAuth) {
      setActiveTool('🔒 Free demo quota completed');
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content:
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
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setLoading(false);
        setActiveTool(null);
      }, 450);
      return;
    }

    setActiveTool('🧭 Routing query intent...');

    const phaseTimer1 = setTimeout(() => setActiveTool('🎯 Selecting optimal WebMCP tool...'), 700);
    const phaseTimer2 = setTimeout(() => setActiveTool('🌐 Fetching verified portfolio facts...'), 1600);
    const phaseTimer3 = setTimeout(() => setActiveTool('✂️ Pruning payload & synthesizing answer...'), 2600);

    try {
      const vid = getVisitorId();
      const endpoint = `${apiUrl.replace(/\/$/, '')}/api/agent/query`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-visitor-id': vid,
        'x-session-id': vid,
      };

      if (apiKey.trim()) {
        headers['x-openai-key'] = apiKey.trim();
      }
      if (hfToken.trim()) {
        headers['x-hf-token'] = hfToken.trim();
      }

      const payloadProvider = provider === 'huggingface' ? 'hugging face' : provider;
      const defaultModel =
        provider === 'openai' ? 'gpt-5-nano' : (provider === 'huggingface' ? 'Qwen/Qwen2.5-7B-Instruct' : 'llama3.2');
      const payloadModel = chatModel.trim() || defaultModel;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          question: text,
          target_url: 'https://www.techiewithbeard.com',
          provider: payloadProvider,
          chat_model: payloadModel,
          ollama_url: provider === 'ollama' ? ollamaUrl : undefined,
        }),
      });

      const data = await response.json();

      if (typeof data.quota_remaining === 'number') {
        setQuotaRemaining(data.quota_remaining);
      }
      if (data.requires_custom_key) {
        setRequiresCustomKey(true);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer || "I received Vishnu's portfolio data but could not synthesize an answer.",
        references: data.references || [],
        selectedTool: data.selected_tool || data.tool,
        tokens: data.total_tokens,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `⚠️ Failed to reach agent backend: ${err.message}. Please check your connection.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      clearTimeout(phaseTimer1);
      clearTimeout(phaseTimer2);
      clearTimeout(phaseTimer3);
      setLoading(false);
      setActiveTool(null);
    }
  };

  const quickPrompts = [
    'Tell me about your AVEVA Monorepo architecture',
    'Show your interactive LangGraph AI demos',
    'Angular 22 Signals & Zoneless expertise',
    'How can I contact or hire Vishnu?',
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: '440px',
        height: '620px',
        background: 'rgba(7, 10, 17, 0.94)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        borderRadius: '16px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(56, 189, 248, 0.15)',
        color: '#f8fafc',
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          background: 'rgba(15, 23, 42, 0.8)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 10px #10b981',
            }}
          />
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Vishnu AI Cockpit</span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'rgba(6, 182, 212, 0.16)',
                  border: '1px solid rgba(6, 182, 212, 0.4)',
                  color: '#38bdf8',
                  borderRadius: '12px',
                  padding: '1px 7px',
                  fontSize: '0.64rem',
                  fontWeight: 600,
                  letterSpacing: '0.2px',
                }}
                title="React 19 Microfrontend mounted inside Angular 22 Enterprise Shell"
              >
                ⚛️ React Component
              </span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
              React 19 MFE in Angular Shell • LangGraph • WebMCP
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={clearChat}
            title="Clear Chat (0 History Kept)"
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '0.72rem',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            🗑️ Clear
          </button>

          <button
            onClick={() => setShowKeyModal(true)}
            title="Configure Provider & Session Token"
            style={{
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#38bdf8',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '0.72rem',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            ⚙️ {hasCustomAuth ? 'Key Set' : (requiresCustomKey ? 'Add Key ⚠️' : 'Settings')}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                fontSize: '1.2rem',
                cursor: 'pointer',
                padding: '2px 6px',
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Quota & Stateless Guarantee Sub-Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '5px 18px',
          background: 'rgba(15, 23, 42, 0.65)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          fontSize: '0.67rem',
          color: '#38bdf8',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: hasCustomAuth ? '#10b981' : (quotaRemaining === 0 ? '#64748b' : '#38bdf8'),
              boxShadow: hasCustomAuth ? '0 0 6px #10b981' : (quotaRemaining === 0 ? 'none' : '0 0 6px #38bdf8'),
            }}
          />
          {hasCustomAuth
            ? '🟢 Personal Key Active • Unlimited'
            : quotaRemaining === 0
            ? '✨ Free Exploratory Quota Completed (3/3)'
            : `🎁 Free Demo: ${quotaRemaining ?? 3}/3 exploratory questions left`}
        </span>
        <span style={{ color: '#64748b' }}>
          {provider === 'huggingface'
            ? 'Hugging Face Hub'
            : provider === 'openai'
            ? hasCustomAuth
              ? 'Personal OpenAI'
              : 'Shared Demo Key'
            : 'Local Ollama'}
        </span>
      </div>

      {/* Messages Stream */}
      <div
        style={{
          flex: 1,
          padding: '16px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '86%',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <div
              style={{
                padding: '10px 14px',
                borderRadius: m.role === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                background:
                  m.role === 'user'
                    ? 'linear-gradient(135deg, #2563eb, #1d4ed8)'
                    : 'rgba(30, 41, 59, 0.85)',
                border: m.role === 'user' ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                color: '#f8fafc',
                fontSize: '0.88rem',
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
              }}
            >
              {m.content}

              {/* Tool Execution Tag */}
              {m.selectedTool && (
                <div
                  style={{
                    marginTop: '8px',
                    fontSize: '0.7rem',
                    color: '#38bdf8',
                    fontFamily: 'monospace',
                    background: 'rgba(56, 189, 248, 0.08)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    display: 'inline-block',
                  }}
                >
                  ⚡ Tool: {m.selectedTool}
                </div>
              )}

              {/* References */}
              {m.references && m.references.length > 0 && (
                <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {m.references.map((ref, idx) => (
                    <a
                      key={idx}
                      href={ref}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '0.68rem',
                        color: '#60a5fa',
                        textDecoration: 'none',
                        background: 'rgba(96, 165, 250, 0.1)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        border: '1px solid rgba(96, 165, 250, 0.2)',
                      }}
                    >
                      🔗 {ref.replace('https://', '')}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div
              style={{
                fontSize: '0.65rem',
                color: '#64748b',
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                padding: '0 4px',
              }}
            >
              {m.timestamp} {m.tokens ? `• ~${m.tokens} tokens (stateless: 0 history)` : ''}
            </div>
          </div>
        ))}

        {loading && (
          <div
            style={{
              alignSelf: 'flex-start',
              padding: '10px 14px',
              borderRadius: '14px 14px 14px 2px',
              background: 'rgba(30, 41, 59, 0.7)',
              fontSize: '0.82rem',
              color: '#38bdf8',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{ animation: 'spin 1s linear infinite' }}>⚡</span>
            {activeTool || 'LangGraph reasoning...'}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          padding: '8px 16px',
          overflowX: 'auto',
          background: 'rgba(15, 23, 42, 0.4)',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(qp)}
            disabled={loading}
            style={{
              flexShrink: 0,
              background: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '20px',
              color: '#cbd5e1',
              padding: '4px 10px',
              fontSize: '0.72rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Quota Exceeded Card - Intuitive & Non-Offensive */}
      {requiresCustomKey && !hasCustomAuth && (
        <div
          onClick={() => setShowKeyModal(true)}
          style={{
            padding: '10px 16px',
            background: 'linear-gradient(90deg, rgba(37, 99, 235, 0.12), rgba(56, 189, 248, 0.12))',
            borderTop: '1px solid rgba(56, 189, 248, 0.25)',
            color: '#cbd5e1',
            fontSize: '0.76rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1rem' }}>✨</span>
            <span>
              Free exploratory questions completed (3/3). Connect your <strong>OpenAI</strong> or <strong>Hugging Face</strong> key to keep chatting!
            </span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowKeyModal(true);
            }}
            style={{
              background: '#2563eb',
              border: 'none',
              color: '#ffffff',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Connect Key ⚙️
          </button>
        </div>
      )}

      {/* Input Box */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 16px',
          background: 'rgba(15, 23, 42, 0.95)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
          <input
            type="text"
            value={input}
            maxLength={100}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={
              requiresCustomKey && !hasCustomAuth
                ? "Ask a question (or connect your key in Settings)..."
                : "Ask about Vishnu's architecture, projects, or hire..."
            }
            disabled={loading}
            style={{
              width: '100%',
              background: 'rgba(30, 41, 59, 0.8)',
              border: input.length >= 100 ? '1px solid rgba(248, 113, 113, 0.6)' : '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              padding: '10px 52px 10px 14px',
              color: '#f8fafc',
              fontSize: '0.86rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {input.length > 0 && (
            <span
              style={{
                position: 'absolute',
                right: '10px',
                fontSize: '0.68rem',
                color: input.length >= 100 ? '#f87171' : input.length >= 80 ? '#fbbf24' : '#64748b',
                fontWeight: input.length >= 90 ? 600 : 400,
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            >
              {input.length}/100
            </span>
          )}
        </div>

        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          style={{
            background: 'linear-gradient(135deg, #38bdf8, #2563eb)',
            border: 'none',
            borderRadius: '8px',
            color: '#ffffff',
            padding: '10px 16px',
            fontSize: '0.88rem',
            fontWeight: 600,
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            opacity: loading || !input.trim() ? 0.6 : 1,
          }}
        >
          Send
        </button>
      </div>

      {/* Session Key & Provider Modal */}
      {showKeyModal && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 10,
          }}
        >
          <div
            style={{
              background: '#0f172a',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              borderRadius: '12px',
              padding: '20px',
              width: '100%',
              maxWidth: '380px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div style={{ fontSize: '1rem', fontWeight: 700 }}>⚙️ Agent Provider & Model</div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              Choose your AI provider. Keys are held strictly in your browser session memory.
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setProvider('openai')}
                style={{
                  flex: 1,
                  padding: '8px 4px',
                  borderRadius: '6px',
                  border: provider === 'openai' ? '1px solid #38bdf8' : '1px solid #334155',
                  background: provider === 'openai' ? 'rgba(56, 189, 248, 0.2)' : '#1e293b',
                  color: '#f8fafc',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  fontWeight: provider === 'openai' ? 600 : 400,
                }}
              >
                🟢 OpenAI
              </button>
              <button
                type="button"
                onClick={() => setProvider('huggingface')}
                style={{
                  flex: 1,
                  padding: '8px 4px',
                  borderRadius: '6px',
                  border: provider === 'huggingface' ? '1px solid #38bdf8' : '1px solid #334155',
                  background: provider === 'huggingface' ? 'rgba(56, 189, 248, 0.2)' : '#1e293b',
                  color: '#f8fafc',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  fontWeight: provider === 'huggingface' ? 600 : 400,
                }}
              >
                🤗 Hugging Face
              </button>
              {isLocalHost && (
                <button
                  type="button"
                  onClick={() => setProvider('ollama')}
                  style={{
                    flex: 1,
                    padding: '8px 4px',
                    borderRadius: '6px',
                    border: provider === 'ollama' ? '1px solid #38bdf8' : '1px solid #334155',
                    background: provider === 'ollama' ? 'rgba(56, 189, 248, 0.2)' : '#1e293b',
                    color: '#f8fafc',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    fontWeight: provider === 'ollama' ? 600 : 400,
                  }}
                >
                  🦙 Local Ollama
                </button>
              )}
            </div>

            {provider === 'openai' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.74rem', color: '#cbd5e1', marginBottom: '4px', display: 'block' }}>
                    OpenAI API Key (Session-Stored)
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-... (Leave blank to use 3 free demo queries)"
                    style={{
                      width: '100%',
                      background: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      color: '#f8fafc',
                      fontSize: '0.82rem',
                      boxSizing: 'border-box',
                    }}
                  />
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '4px' }}>
                    {apiKey.trim()
                      ? '⚡ Personal key active (unlimited queries unlocked).'
                      : '🎁 Leave blank to use 3 free prompts on the shared demo server.'}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.74rem', color: '#cbd5e1', marginBottom: '4px', display: 'block' }}>
                    Model Name Override
                  </label>
                  <input
                    type="text"
                    value={chatModel}
                    onChange={(e) => setChatModel(e.target.value)}
                    placeholder="gpt-5-nano (default)"
                    style={{
                      width: '100%',
                      background: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      color: '#f8fafc',
                      fontSize: '0.82rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            )}

            {provider === 'huggingface' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.74rem', color: '#cbd5e1', marginBottom: '4px', display: 'block' }}>
                    Hugging Face Access Token
                  </label>
                  <input
                    type="password"
                    value={hfToken}
                    onChange={(e) => setHfToken(e.target.value)}
                    placeholder="hf_..."
                    style={{
                      width: '100%',
                      background: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      color: '#f8fafc',
                      fontSize: '0.82rem',
                      boxSizing: 'border-box',
                    }}
                  />
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '4px' }}>
                    Free serverless inference via your personal Hugging Face access token.
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.74rem', color: '#cbd5e1', marginBottom: '4px', display: 'block' }}>
                    Chat Model Repo ID
                  </label>
                  <input
                    type="text"
                    value={chatModel}
                    onChange={(e) => setChatModel(e.target.value)}
                    placeholder="Qwen/Qwen2.5-7B-Instruct (default)"
                    style={{
                      width: '100%',
                      background: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      color: '#f8fafc',
                      fontSize: '0.82rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            )}

            {provider === 'ollama' && isLocalHost && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.74rem', color: '#cbd5e1', marginBottom: '4px', display: 'block' }}>
                    Ollama Base URL
                  </label>
                  <input
                    type="text"
                    value={ollamaUrl}
                    onChange={(e) => setOllamaUrl(e.target.value)}
                    placeholder="http://localhost:11434"
                    style={{
                      width: '100%',
                      background: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      color: '#f8fafc',
                      fontSize: '0.82rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.74rem', color: '#cbd5e1', marginBottom: '4px', display: 'block' }}>
                    Ollama Model Name
                  </label>
                  <input
                    type="text"
                    value={chatModel}
                    onChange={(e) => setChatModel(e.target.value)}
                    placeholder="llama3.2 (default)"
                    style={{
                      width: '100%',
                      background: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      color: '#f8fafc',
                      fontSize: '0.82rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                style={{
                  background: 'none',
                  border: '1px solid #475569',
                  borderRadius: '6px',
                  color: '#cbd5e1',
                  padding: '6px 12px',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => saveSettings(provider, apiKey, hfToken, chatModel, ollamaUrl)}
                style={{
                  background: '#2563eb',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#ffffff',
                  padding: '6px 14px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Save & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
