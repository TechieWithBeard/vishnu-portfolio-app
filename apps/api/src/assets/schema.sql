-- ==============================================================================
-- Vishnu Thankappan Portfolio - Supabase Database Schema
-- Run this in your Supabase SQL Editor to initialize all tables, RLS, and seed data.
-- ==============================================================================

-- 1. Enable UUID Extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing tables if re-running
DROP TABLE IF EXISTS writing CASCADE;
DROP TABLE IF EXISTS demos CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS experience CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS profile CASCADE;

-- 3. Profile Table
CREATE TABLE profile (
    id TEXT PRIMARY KEY DEFAULT 'default',
    name TEXT NOT NULL,
    alias TEXT,
    title TEXT NOT NULL,
    tagline TEXT,
    location TEXT,
    email TEXT,
    phone TEXT,
    linkedin TEXT,
    github TEXT,
    summary TEXT,
    availability JSONB DEFAULT '{"status": "Active Engineering & Architecture", "target": "Enterprise UI Architecture & AI Systems", "note": "Consulting, architectural advisory, and technical collaboration"}'::jsonb,
    skills JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Experience Table
CREATE TABLE experience (
    id TEXT PRIMARY KEY,
    role TEXT NOT NULL,
    company TEXT NOT NULL,
    period TEXT NOT NULL,
    location TEXT,
    highlights JSONB NOT NULL DEFAULT '[]'::jsonb,
    tech JSONB NOT NULL DEFAULT '[]'::jsonb,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Projects Table
CREATE TABLE projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    role TEXT,
    tech JSONB NOT NULL DEFAULT '[]'::jsonb,
    highlights JSONB NOT NULL DEFAULT '[]'::jsonb,
    github TEXT,
    live_demo TEXT,
    demo_type TEXT DEFAULT 'iframe',
    featured BOOLEAN DEFAULT false,
    category TEXT DEFAULT 'Architecture',
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Writing Table (Medium, Dev.to, LinkedIn, YouTube, Hashnode, etc.)
CREATE TABLE writing (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    platform TEXT NOT NULL,
    url TEXT NOT NULL,
    published_at TEXT,
    summary TEXT,
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    thumbnail TEXT,
    read_time TEXT,
    featured BOOLEAN DEFAULT false,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Live Demos Table
CREATE TABLE demos (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'iframe',
    remote_name TEXT,
    exposed_module TEXT,
    url TEXT,
    documentation TEXT,
    video TEXT,
    status TEXT NOT NULL DEFAULT 'live',
    tech JSONB NOT NULL DEFAULT '[]'::jsonb,
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    sandbox TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Skills Categories Table
CREATE TABLE skills (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    category_label TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    order_index INTEGER NOT NULL DEFAULT 0
);

-- 9. Agent Rate Limits / Persistent Visitor Quota Table
CREATE TABLE IF NOT EXISTS agent_rate_limits (
    id TEXT PRIMARY KEY, -- visitor_id (UUID stored in browser localStorage)
    ip_hash TEXT,
    prompts_used INTEGER NOT NULL DEFAULT 0,
    tokens_used INTEGER NOT NULL DEFAULT 0,
    last_prompt_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Agent Queries / Anonymous User Input Telemetry
CREATE TABLE IF NOT EXISTS agent_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    query TEXT NOT NULL,
    answer_preview TEXT,
    selected_tool TEXT,
    provider TEXT DEFAULT 'default',
    is_free_tier BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- Row-Level Security (RLS) Configuration
-- ==============================================================================

ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE writing ENABLE ROW LEVEL SECURITY;
ALTER TABLE demos ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_queries ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all portfolio items
CREATE POLICY "Public profile read" ON profile FOR SELECT USING (true);
CREATE POLICY "Public experience read" ON experience FOR SELECT USING (true);
CREATE POLICY "Public projects read" ON projects FOR SELECT USING (true);
CREATE POLICY "Public writing read" ON writing FOR SELECT USING (true);
CREATE POLICY "Public demos read" ON demos FOR SELECT USING (true);
CREATE POLICY "Public skills read" ON skills FOR SELECT USING (true);
CREATE POLICY "Public read agent_rate_limits" ON agent_rate_limits FOR SELECT USING (true);
CREATE POLICY "Public insert update agent_rate_limits" ON agent_rate_limits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public insert agent_queries" ON agent_queries FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read agent_queries" ON agent_queries FOR SELECT USING (true);

-- Allow full access to service_role / authenticated admin
CREATE POLICY "Admin profile full" ON profile FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin experience full" ON experience FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin projects full" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin writing full" ON writing FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin demos full" ON demos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin skills full" ON skills FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin agent_rate_limits full" ON agent_rate_limits FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- Initial Seed Data
-- ==============================================================================

-- Profile
INSERT INTO profile (id, name, alias, title, tagline, location, email, phone, linkedin, github, summary, availability, skills)
VALUES (
    'default',
    'Vishnu Thankappan',
    '@techiewithbeard',
    'Senior Frontend Engineer',
    'Scalable UI Architecture • AI-Powered Interfaces • Design Systems',
    'Bangalore, India',
    'vishnuthankappan@techiewithbeard.com',
    '+91-8373923785',
    'https://www.linkedin.com/in/vishnu-thankappan-7bbb0675/',
    'https://github.com/techiewithbeard',
    'Senior Frontend Engineer with 7+ years of experience engineering scalable, high-performance web platforms. Deep specialization in enterprise frontend architecture, Nx monorepos, reusable design systems, and modern Angular/React microfrontends. Actively shipping AI-powered interfaces with streaming LLM responses, LangChain, and LangGraph.',
    '{"status": "Active Engineering & Architecture", "target": "Enterprise UI Architecture & AI Systems", "note": "Consulting, architectural advisory, and technical collaboration"}'::jsonb,
    '{"frontendArchitecture": ["Angular 22", "Nx Monorepos", "Design Systems", "TypeScript", "Microfrontends", "Signals", "RxJS", "NgRx"], "aiInterfaces": ["LangChain", "LangGraph", "RAG Systems", "Streaming UIs", "Vercel AI SDK", "Agentic Workflows"], "testingQuality": ["Playwright", "Cypress", "Jasmine/Karma", "WCAG 2.2 AA A11y", "CI/CD Pipelines"], "tooling": ["Git", "Docker", "Webpack", "Tailwind CSS", "Azure", "REST & GraphQL APIs"], "crossPlatform": ["React", "Next.js", "Ionic", "Xamarin"]}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    alias = EXCLUDED.alias,
    title = EXCLUDED.title,
    tagline = EXCLUDED.tagline,
    location = EXCLUDED.location,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    linkedin = EXCLUDED.linkedin,
    github = EXCLUDED.github,
    summary = EXCLUDED.summary,
    availability = EXCLUDED.availability,
    skills = EXCLUDED.skills,
    updated_at = NOW();

-- Experience
INSERT INTO experience (id, role, company, period, location, highlights, tech, order_index) VALUES
(
    'exp-1',
    'Senior Frontend Engineer',
    'Parnasoft Technologies — Client: AVEVA',
    'March 2025 – Present',
    'Industrial SaaS (Global)',
    '["Architected and optimized a large-scale Nx monorepo orchestrating 5+ Angular enterprise applications, slashing CI/CD build & test durations by 25–35%.", "Designed and migrated modular shared UI/widget libraries across teams, cutting duplicated frontend code by 30–40%.", "Established comprehensive frontend test strategy across unit, integration, and E2E tiers utilizing Playwright and Cypress.", "Enforced strict architectural boundaries, code-sharing standards, and performance budgets across distributed engineering squads."]'::jsonb,
    '["Angular 22", "Nx Monorepo", "TypeScript", "Playwright", "Cypress", "Design Systems", "CI/CD"]'::jsonb,
    1
),
(
    'exp-2',
    'Frontend Specialist',
    'ACI Logistix',
    'March 2022 – March 2025',
    'Global Logistics Platform',
    '["Led end-to-end migration of mission-critical AngularJS logistics applications to modern Angular (v14+), significantly improving runtime performance and maintainability.", "Standardized predictable global state management across cross-functional modules using NgRx.", "Authored and maintained internal NPM design system libraries distributed through Azure Artifacts.", "Engineered cross-platform mobile scanning and tracking utilities using Ionic and modern web standards."]'::jsonb,
    '["Angular", "NgRx", "TypeScript", "RxJS", "Ionic", "Azure Artifacts", "REST APIs"]'::jsonb,
    2
),
(
    'exp-3',
    'Expert Frontend Engineer',
    'Maistering B.V',
    'January 2019 – March 2022',
    'Enterprise AI Platform',
    '["Built and evolved responsive AI-assisted business management platforms using Angular, TypeScript, and NgRx.", "Collaborated with cross-functional product and architecture leaders to deliver high-reliability enterprise features.", "Developed cross-platform mobile experiences with Xamarin and integrated real-time data synchronization.", "Championed clean code practices, component decoupling, and test-driven development in Agile squads."]'::jsonb,
    '["Angular", "NgRx", "TypeScript", "Xamarin", "Enterprise UI", "Agile"]'::jsonb,
    3
) ON CONFLICT (id) DO NOTHING;

-- Projects
INSERT INTO projects (id, title, description, role, tech, highlights, github, live_demo, demo_type, featured, category, order_index) VALUES
(
    'nx-monorepo-optimization',
    'Large-Scale Enterprise Nx Monorepo Architecture',
    'Restructured and optimized a massive monorepo supporting 5+ Angular applications, establishing affected computation graph builds and shared UI component libraries.',
    'Senior Frontend Engineer',
    '["Angular 22", "Nx Monorepo", "TypeScript", "CI/CD", "Design Tokens"]'::jsonb,
    '["25–35% reduction in total CI build and test execution cycles", "Eliminated ~30% code duplication with shared design system packages", "Enforced strict dependency boundary linting rules across teams"]'::jsonb,
    'https://github.com/techiewithbeard/nx-monorepo-architecture',
    '/experience',
    'native-federation',
    true,
    'Architecture',
    1
),
(
    'ai-rag-chat',
    'Production RAG Document Intelligence Interface',
    'High-performance document Q&A application featuring token streaming, interactive citations, document source inspector, and feedback telemetry.',
    'Creator & Architect',
    '["Angular 22", "LangChain", "LangGraph", "Streaming UI", "Nx", "Tailwind CSS"]'::jsonb,
    '["Real-time token streaming with resilient backoff and error recovery", "Interactive citation popovers mapped to exact vector retrieved source chunks", "Built as an isolated microfrontend ready for Native Federation consumption"]'::jsonb,
    'https://github.com/techiewithbeard/ai-rag-chat',
    '/demos',
    'native-federation',
    true,
    'AI Interfaces',
    2
),
(
    'multi-agent-dashboard',
    'Multi-Agent Workflow Orchestrator & Monitor',
    'Visual monitoring, execution timeline, and human-in-the-loop decision cockpit for LangGraph autonomous agent workflows.',
    'Creator & Architect',
    '["React 19", "Angular Signals", "LangGraph", "WebSockets", "Streaming"]'::jsonb,
    '["Real-time visualization of agent state transitions and branching decisions", "Human-in-the-loop pause, approve, and override control panel", "Zoneless reactive state synchronized over WebSocket events"]'::jsonb,
    'https://github.com/techiewithbeard/multi-agent-dashboard',
    '/demos',
    'module-federation',
    true,
    'AI Interfaces',
    3
),
(
    'angularjs-to-angular-migration',
    'Mission-Critical Enterprise UI Modernization',
    'Strategic incremental migration of legacy AngularJS applications to modern Angular with zero downtime and strict state contracts.',
    'Frontend Specialist',
    '["Angular", "NgRx", "TypeScript", "RxJS", "Microfrontends"]'::jsonb,
    '["Migrated complex operational logistics workflows with zero customer disruption", "Established standardized NgRx store patterns and immutable data flow", "Reduced bundle load time by 42% via lazy loaded route modules"]'::jsonb,
    null,
    '/experience',
    'iframe',
    true,
    'Modernization',
    4
) ON CONFLICT (id) DO NOTHING;

-- Writing / Articles (Medium, Dev.to, LinkedIn, YouTube, Hashnode)
INSERT INTO writing (id, title, platform, url, published_at, summary, tags, thumbnail, read_time, featured, order_index) VALUES
(
    'article-1',
    'Architecting Large-Scale Angular Applications with Nx Monorepos & Native Federation',
    'medium',
    'https://medium.com/@techiewithbeard/architecting-large-scale-angular-apps-with-nx-and-native-federation',
    '2026-06-15',
    'A deep dive into structuring enterprise Angular monorepos, optimizing CI build graphs with Nx affected, and deploying microfrontends using Native Federation.',
    '["Angular", "Nx Monorepo", "Microfrontends", "Architecture"]'::jsonb,
    null,
    '7 min read',
    true,
    1
),
(
    'article-2',
    'Building Responsive Streaming AI Interfaces with LangChain and Angular Signals',
    'dev.to',
    'https://dev.to/techiewithbeard/building-responsive-streaming-ai-interfaces-with-langchain-and-angular-signals',
    '2026-05-20',
    'How to handle real-time LLM token streams in Angular using modern Signals, error boundaries, and accessible markdown rendering.',
    '["AI", "LangChain", "Angular", "Signals", "Frontend"]'::jsonb,
    null,
    '6 min read',
    true,
    2
),
(
    'article-3',
    'From AngularJS to Angular 22: Enterprise Modernization Strategies That Actually Work',
    'linkedin',
    'https://www.linkedin.com/pulse/enterprise-angularjs-modernization-strategies-vishnu-thankappan/',
    '2026-04-10',
    'Key lessons, architectural patterns, and risk-mitigation strategies learned from migrating legacy enterprise suites to modern reactive frameworks.',
    '["Enterprise", "Angular", "Migration", "SoftwareEngineering"]'::jsonb,
    null,
    '5 min read',
    true,
    3
) ON CONFLICT (id) DO NOTHING;

-- Demos
INSERT INTO demos (id, title, description, type, remote_name, exposed_module, url, status, tech, tags, sandbox, order_index) VALUES
(
    'rag-chat',
    'RAG Document Q&A Assistant',
    'Streaming AI document Q&A interface with source citations and vector search evaluation telemetry.',
    'native-federation',
    'demoAngularRag',
    './Component',
    '/demos/rag-chat',
    'live',
    '["Angular 22", "LangChain", "Streaming UI", "Native Federation"]'::jsonb,
    '["AI", "RAG", "Microfrontend"]'::jsonb,
    null,
    1
),
(
    'agent-dashboard',
    'Multi-Agent Workflow Cockpit',
    'Visual monitoring and control dashboard for LangGraph multi-agent systems with human-in-the-loop checkpoints.',
    'native-federation',
    'demoAngularAgents',
    './Component',
    '/demos/agents',
    'live',
    '["Angular 22", "LangGraph", "Signals", "WebSockets"]'::jsonb,
    '["AI", "Agents", "Real-Time"]'::jsonb,
    null,
    2
),
(
    'react-ai-chat',
    'React + Vercel AI SDK Explorer',
    'Cross-framework AI chat interface built in React 19 and connected via Module Federation.',
    'module-federation',
    'demoReactAi',
    './App',
    '/demos/react-ai',
    'live',
    '["React 19", "Vercel AI SDK", "TypeScript"]'::jsonb,
    '["React", "AI", "Module Federation"]'::jsonb,
    null,
    3
),
(
    'streamlit-ai-demo',
    'Streamlit AI Rapid Prototype',
    'Interactive Python + Streamlit data exploration and model evaluation dashboard embedded securely.',
    'iframe',
    null,
    null,
    'https://share.streamlit.io',
    'live',
    '["Streamlit", "Python", "LangChain", "Data"]'::jsonb,
    '["Python", "Streamlit", "Prototype"]'::jsonb,
    'allow-scripts allow-same-origin allow-forms allow-popups',
    4
) ON CONFLICT (id) DO NOTHING;

-- Skills Categories
INSERT INTO skills (id, category, category_label, items, order_index) VALUES
('cat-1', 'frontendArchitecture', 'Frontend Architecture & Frameworks', '["Angular 22", "Nx Monorepos", "Design Systems", "TypeScript", "Microfrontends (Native Federation)", "Signals & RxJS", "Modular UI Architecture", "React 19 & Next.js"]'::jsonb, 1),
('cat-2', 'aiInterfaces', 'AI & Intelligent Interfaces', '["LangChain", "LangGraph", "RAG Applications", "Streaming UIs", "Vercel AI SDK", "Agentic Workflows", "Vector DB Integrations", "LLM Prompting & Evaluation"]'::jsonb, 2),
('cat-3', 'testingQuality', 'Testing, Quality & Accessibility', '["Playwright", "Cypress", "Jasmine & Karma", "WCAG 2.2 AA Accessibility", "Performance Profiling (CWV)", "CI/CD GitHub Actions"]'::jsonb, 3),
('cat-4', 'tooling', 'Tooling, Cloud & Ecosystem', '["Git & Trunk-Based Dev", "Docker", "Webpack & Vite", "Tailwind CSS v4", "Azure & Vercel", "REST & GraphQL APIs"]'::jsonb, 4),
('cat-5', 'crossPlatform', 'State Management & Platforms', '["NgRx & Signals Store", "Ionic Framework", "Cross-Platform Web", "Zoneless Angular", "PWA & Offline First"]'::jsonb, 5)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 9. Arcade Leaderboard & High Scores (Packet Runner Mini-Game)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS arcade_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_name TEXT NOT NULL DEFAULT 'PacketRunner',
    score INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for high score lookups
CREATE INDEX IF NOT EXISTS idx_arcade_scores_score ON arcade_scores (score DESC);

-- Row Level Security
ALTER TABLE arcade_scores ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'arcade_scores' AND policyname = 'Allow public read arcade_scores'
    ) THEN
        CREATE POLICY "Allow public read arcade_scores" ON arcade_scores FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'arcade_scores' AND policyname = 'Allow public insert arcade_scores'
    ) THEN
        CREATE POLICY "Allow public insert arcade_scores" ON arcade_scores FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- Baseline seed high score
INSERT INTO arcade_scores (player_name, score)
SELECT 'Vishnu (Architect)', 380
WHERE NOT EXISTS (SELECT 1 FROM arcade_scores);

