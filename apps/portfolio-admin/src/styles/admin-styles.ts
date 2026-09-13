/**
 * Portfolio Admin Studio - Scoped Design System & Styles
 *
 * Injected dynamically at runtime into document.head when the React 19
 * microfrontend is mounted. Scoped strictly under .admin-native-mount,
 * .app-container, and modal overlays to prevent any CSS bleed into the
 * Angular host shell while guaranteeing 100% style fidelity.
 */

export const adminStylesCss = `
/* ============================================================
   Design Tokens & CSS Variables
   ============================================================ */
:root,
.admin-native-mount,
.app-container,
.modal-overlay,
.toast-container {
  --bg-primary: #0b0f17;
  --bg-surface: #111827;
  --bg-surface-hover: #1f2937;
  --bg-card: #141c2e;
  --bg-card-hover: #1a243a;
  --border-subtle: #1e293b;
  --border-strong: #334155;
  
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  
  --accent-primary: #3b82f6;
  --accent-hover: #2563eb;
  --accent-subtle: rgba(59, 130, 246, 0.12);
  --accent-border: rgba(59, 130, 246, 0.35);

  --success: #10b981;
  --success-subtle: rgba(16, 185, 129, 0.12);
  --warning: #f59e0b;
  --danger: #ef4444;
  --danger-subtle: rgba(239, 68, 68, 0.12);

  --font-sans: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 20px;
  --radius-full: 9999px;

  --shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 14px rgba(0,0,0,0.4);
  --shadow-lg: 0 12px 30px rgba(0,0,0,0.5);
}

/* Base reset scoped to Admin mount and container */
.admin-native-mount,
.admin-native-mount *,
.app-container,
.app-container *,
.modal-overlay,
.modal-overlay *,
.toast-container,
.toast-container * {
  box-sizing: border-box;
}

.admin-native-mount,
.app-container {
  font-family: var(--font-sans);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

/* ============================================================
   Layout
   ============================================================ */
.app-container {
  display: grid;
  grid-template-columns: 260px 1fr;
  min-height: 700px;
  width: 100%;
}

/* ============================================================
   Sidebar
   ============================================================ */
.app-container .sidebar {
  background: var(--bg-surface);
  border-right: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1rem;
  position: sticky;
  top: 0;
  height: 100%;
  min-height: 700px;
  overflow-y: auto;
}

.app-container .sidebar-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem 1.5rem;
  border-bottom: 1px solid var(--border-subtle);
  margin-bottom: 1.5rem;
}

.app-container .sidebar-brand .logo-badge {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  font-weight: 800;
  font-size: 1.1rem;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  display: grid;
  place-items: center;
  box-shadow: 0 0 16px rgba(59, 130, 246, 0.4);
}

.app-container .sidebar-brand h1 {
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0;
  color: var(--text-primary);
}

.app-container .sidebar-brand small {
  color: var(--text-muted);
  font-size: 0.75rem;
  display: block;
  margin-top: 2px;
}

.app-container .nav-section-title {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  padding: 0.5rem 0.75rem;
  font-weight: 700;
}

.app-container .nav-menu {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.app-container .nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.85rem;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: all 0.15s ease;
  font-family: inherit;
}

.app-container .nav-item:hover {
  background: var(--bg-surface-hover);
  color: var(--text-primary);
}

.app-container .nav-item.active {
  background: var(--accent-subtle);
  color: #60a5fa;
  border-color: var(--accent-border);
  font-weight: 600;
}

.app-container .nav-item .badge-count {
  margin-left: auto;
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-full);
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
}

.app-container .sidebar-footer {
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* ============================================================
   Main Content Area & Topbar
   ============================================================ */
.app-container .main-content {
  display: flex;
  flex-direction: column;
  min-height: 700px;
  overflow-x: hidden;
  background-color: var(--bg-primary);
}

.app-container .topbar {
  background: rgba(17, 24, 39, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-subtle);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 20;
}

.app-container .page-body {
  padding: 2rem;
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

/* ============================================================
   Typography & Headings
   ============================================================ */
.app-container .page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 1rem;
}

.app-container .page-title {
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  margin: 0 0 0.25rem 0;
  color: var(--text-primary);
}

.app-container .page-subtitle {
  color: var(--text-secondary);
  font-size: 0.925rem;
  margin: 0;
}

/* ============================================================
   Buttons
   ============================================================ */
.app-container .btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 1.1rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s ease;
  text-decoration: none;
  font-family: inherit;
  line-height: 1.2;
}

.app-container .btn-primary {
  background: var(--accent-primary);
  color: white;
}
.app-container .btn-primary:hover {
  background: var(--accent-hover);
}

.app-container .btn-secondary {
  background: var(--bg-surface-hover);
  border-color: var(--border-strong);
  color: var(--text-primary);
}
.app-container .btn-secondary:hover {
  background: #374151;
}

.app-container .btn-success {
  background: var(--success);
  color: white;
}
.app-container .btn-success:hover {
  background: #059669;
}

.app-container .btn-danger {
  background: var(--danger-subtle);
  color: #f87171;
  border-color: rgba(239, 68, 68, 0.3);
}
.app-container .btn-danger:hover {
  background: var(--danger);
  color: white;
}

.app-container .btn-ghost {
  background: transparent;
  color: var(--text-secondary);
}
.app-container .btn-ghost:hover {
  color: var(--text-primary);
  background: var(--bg-surface-hover);
}

.app-container .btn-sm {
  padding: 0.35rem 0.75rem;
  font-size: 0.8rem;
}

/* ============================================================
   Cards & Status Badges
   ============================================================ */
.app-container .card {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  transition: border-color 0.15s ease;
}

.app-container .card:hover {
  border-color: var(--border-strong);
}

.app-container .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.app-container .card-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

.app-container .status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.25rem 0.65rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid transparent;
}

.app-container .status-pill.online {
  background: var(--success-subtle);
  color: #34d399;
  border-color: rgba(16, 185, 129, 0.3);
}

.app-container .status-pill.local {
  background: rgba(245, 158, 11, 0.12);
  color: #fbbf24;
  border-color: rgba(245, 158, 11, 0.3);
}

.app-container .status-pill .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

/* ============================================================
   Forms & Inputs
   ============================================================ */
.app-container .form-group {
  margin-bottom: 1.25rem;
}

.app-container .form-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.4rem;
  color: var(--text-secondary);
}

.app-container .form-input,
.app-container .form-textarea,
.app-container .form-select {
  width: 100%;
  padding: 0.65rem 0.85rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 0.9rem;
  font-family: inherit;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.app-container .form-input:focus,
.app-container .form-textarea:focus,
.app-container .form-select:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.app-container .form-textarea {
  min-height: 90px;
  resize: vertical;
}

.app-container .form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}

/* ============================================================
   Modals
   ============================================================ */
.modal-overlay,
.app-container .modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  display: grid;
  place-items: center;
  z-index: 10000;
  padding: 1.5rem;
  animation: adminFadeIn 0.15s ease-out;
}

.modal-content,
.app-container .modal-content {
  background: var(--bg-surface);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-xl);
  width: min(680px, 100%);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: var(--shadow-lg);
  animation: adminSlideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  color: var(--text-primary);
}

.modal-header,
.app-container .modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-subtle);
}

.modal-body,
.app-container .modal-body {
  padding: 1.5rem;
  overflow-y: auto;
}

.modal-footer,
.app-container .modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-subtle);
  background: var(--bg-card);
  border-radius: 0 0 var(--radius-xl) var(--radius-xl);
}

/* ============================================================
   Toasts
   ============================================================ */
.toast-container,
.app-container .toast-container {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 20000;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.toast,
.app-container .toast {
  background: var(--bg-surface);
  border: 1px solid var(--border-strong);
  color: var(--text-primary);
  padding: 0.85rem 1.25rem;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  animation: adminSlideIn 0.2s ease-out;
}

.toast.success, .app-container .toast.success { border-color: var(--success); }
.toast.error, .app-container .toast.error { border-color: var(--danger); }
.toast.info, .app-container .toast.info { border-color: var(--accent-primary); }

/* ============================================================
   Grids & Item Cards
   ============================================================ */
.app-container .items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.25rem;
}

.app-container .item-card {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;
  transition: all 0.15s ease;
}

.app-container .item-card:hover {
  border-color: var(--border-strong);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.app-container .item-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
}

.app-container .tag-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: var(--radius-sm);
  background: var(--bg-surface-hover);
  color: var(--text-secondary);
  border: 1px solid var(--border-subtle);
}

.app-container .tag-badge.platform-medium {
  background: rgba(0, 171, 107, 0.12);
  color: #10b981;
  border-color: rgba(0, 171, 107, 0.3);
}

.app-container .tag-badge.platform-devto {
  background: rgba(255, 255, 255, 0.1);
  color: #f8fafc;
}

.app-container .tag-badge.platform-linkedin {
  background: rgba(10, 102, 194, 0.15);
  color: #60a5fa;
  border-color: rgba(10, 102, 194, 0.3);
}

.app-container .tag-badge.platform-youtube {
  background: rgba(255, 0, 0, 0.12);
  color: #f87171;
  border-color: rgba(255, 0, 0, 0.3);
}

/* ============================================================
   Animations & Responsive Breakpoints
   ============================================================ */
@keyframes adminFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes adminSlideUp {
  from { opacity: 0; transform: translateY(12px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes adminSlideIn {
  from { transform: translateX(20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@media (max-width: 860px) {
  .app-container {
    grid-template-columns: 1fr;
  }
  .app-container .sidebar {
    position: relative;
    height: auto;
    min-height: auto;
  }
}
`;

/**
 * Dynamically injects the admin styles into document.head if not already present.
 */
export function injectAdminStyles(): void {
  if (typeof document === 'undefined') return;
  const styleId = 'portfolio-admin-styles';
  if (document.getElementById(styleId)) return;

  const styleEl = document.createElement('style');
  styleEl.id = styleId;
  styleEl.textContent = adminStylesCss;
  document.head.appendChild(styleEl);
}
