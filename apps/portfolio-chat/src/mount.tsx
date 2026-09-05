import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChatWidget } from './components/ChatWidget';

export interface MountChatOptions {
  apiUrl?: string;
  onClose?: () => void;
}

export function mountChat(container: HTMLElement, options: MountChatOptions = {}) {
  const root = ReactDOM.createRoot(container);
  root.render(<ChatWidget apiUrl={options.apiUrl} onClose={options.onClose} />);

  return () => {
    setTimeout(() => {
      root.unmount();
    }, 0);
  };
}

// Custom Element registration for Web Component federation
class PortfolioChatElement extends HTMLElement {
  private root: ReactDOM.Root | null = null;

  connectedCallback() {
    const apiUrl = this.getAttribute('api-url') || undefined;
    this.root = ReactDOM.createRoot(this);
    this.root.render(
      <ChatWidget
        apiUrl={apiUrl}
        onClose={() => {
          this.dispatchEvent(new CustomEvent('close-chat', { bubbles: true }));
        }}
      />
    );
  }

  disconnectedCallback() {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
  }
}

if (typeof window !== 'undefined' && !customElements.get('portfolio-chat-widget')) {
  customElements.define('portfolio-chat-widget', PortfolioChatElement);
}

export { ChatWidget };
export default ChatWidget;
