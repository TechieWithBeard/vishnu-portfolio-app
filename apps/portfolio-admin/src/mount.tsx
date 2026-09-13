import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import { injectAdminStyles } from "./styles/admin-styles";

export interface MountAdminOptions {
  demoMode?: boolean;
}

export function mountAdmin(container: HTMLElement, options: MountAdminOptions = { demoMode: true }) {
  if (options.demoMode !== false) {
    sessionStorage.setItem("portfolio_admin_demo_mode", "true");
  }

  // Ensure scoped styles are injected into document.head
  injectAdminStyles();

  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  return () => {
    setTimeout(() => {
      root.unmount();
    }, 0);
  };
}

export { App };
export default App;
