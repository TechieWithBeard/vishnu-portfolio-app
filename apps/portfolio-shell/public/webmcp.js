/**
 * Official WebMCP (Web Model Context Protocol) Runtime & Polyfill
 * Conforms to Chromium WebMCP Specification (Blink script_tools)
 * and Angular 22 WebMCP Standard (https://angular.dev/ai/webmcp).
 * 
 * Supports:
 * - Native Chrome document.modelContext / navigator.modelContext (Chrome 146+ with #enable-webmcp-testing)
 * - Complete spec-compliant polyfill when running in browsers without native support
 * - Bidirectional Chrome DevTools & Extension window.postMessage protocol
 * - Declarative HTML form tools with toolautosubmit
 */
(function () {
  if (typeof window === 'undefined') return;

  // Global registry for registered tools
  window.__webmcp_registered_tools = window.__webmcp_registered_tools || new Map();

  // Helper to format return values into the MCP standard: { content: [{ type: 'text', text }] }
  function formatMcpResponse(data) {
    if (data && typeof data === 'object' && Array.isArray(data.content)) {
      return data;
    }
    const text = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    return {
      content: [{ type: 'text', text: text }]
    };
  }

  // Scan all declarative HTML forms in the document
  function scanDeclarativeForms(doc) {
    const tools = [];
    if (!doc || !doc.querySelectorAll) return tools;

    const forms = doc.querySelectorAll('form[toolname]');
    for (let i = 0; i < forms.length; i++) {
      const form = forms[i];
      const name = form.getAttribute('toolname');
      if (!name) continue;

      const desc = form.getAttribute('tooldescription') || '';
      const title = form.getAttribute('tooltitle') || name;
      const props = {};
      const required = [];

      const fields = form.querySelectorAll('input[name], select[name], textarea[name]');
      for (let j = 0; j < fields.length; j++) {
        const field = fields[j];
        const fName = field.name;
        if (!fName) continue;
        const fDesc = field.getAttribute('toolparamdescription') || field.placeholder || '';
        let type = 'string';
        let enumVals;

        if (field.tagName === 'SELECT') {
          type = 'string';
          enumVals = Array.from(field.options).map(function(o) { return o.value || o.text; });
        } else if (field.type === 'number' || field.type === 'range') {
          type = 'number';
        } else if (field.type === 'checkbox') {
          type = 'boolean';
        }

        const propDef = { type: type };
        if (fDesc) propDef.description = fDesc;
        if (enumVals && enumVals.length) propDef.enum = enumVals;
        props[fName] = propDef;

        if (field.hasAttribute('required')) {
          required.push(fName);
        }
      }

      const inputSchema = {
        type: 'object',
        properties: props,
        additionalProperties: false
      };
      if (required.length > 0) inputSchema.required = required;

      tools.push({
        name: name,
        title: title,
        description: desc,
        inputSchema: inputSchema,
        window: window,
        origin: window.location.origin,
        _form: form,
      });
    }
    return tools;
  }

  // Combine registered imperative tools and declarative forms
  function getAllTools() {
    const list = [];
    const seen = new Set();

    // 1. Imperative tools registered via registerTool
    if (window.__webmcp_registered_tools) {
      for (const t of window.__webmcp_registered_tools.values()) {
        seen.add(t.name);
        list.push({
          name: t.name,
          title: t.title || t.name,
          description: t.description || '',
          inputSchema: t.inputSchema || { type: 'object', properties: {} },
          window: window,
          origin: window.location.origin,
          annotations: t.annotations,
          _execute: t._execute || t.execute
        });
      }
    }

    // 2. Declarative forms in document
    const forms = scanDeclarativeForms(window.document);
    for (const f of forms) {
      if (!seen.has(f.name)) {
        seen.add(f.name);
        list.push(f);
      }
    }

    return list;
  }

  // Check if native Chrome ModelContext exists (Blink native)
  const existingDocCtx = window.document && window.document.modelContext;
  const existingNavCtx = window.navigator && window.navigator.modelContext;
  const nativeCtx = (existingDocCtx && typeof existingDocCtx.registerTool === 'function')
    ? existingDocCtx
    : (existingNavCtx && typeof existingNavCtx.registerTool === 'function')
      ? existingNavCtx
      : null;

  if (nativeCtx) {
    // --- NATIVE MODE (Chrome with #enable-webmcp-testing) ---
    // DO NOT redefine or delete the native object. Enhance it seamlessly!
    const origRegister = nativeCtx.registerTool.bind(nativeCtx);

    nativeCtx.registerTool = async function (toolDef, options) {
      if (!toolDef || !toolDef.name) {
        throw new TypeError('Invalid tool: name is required');
      }

      // Store in memory for DevTools inspection
      window.__webmcp_registered_tools.set(toolDef.name, Object.assign({}, toolDef, {
        _execute: toolDef.execute
      }));

      // Call Chrome Blink native registerTool
      let res;
      try {
        res = await origRegister(toolDef, options);
      } catch (err) {
        // Native may throw if already registered, which is safe to ignore
      }

      // Dispatch standard toolchange event
      try {
        nativeCtx.dispatchEvent(new Event('toolchange'));
      } catch (e) {}

      return res;
    };

    // Ensure getTools() is available on native context for DevTools Application > WebMCP
    if (typeof nativeCtx.getTools !== 'function') {
      nativeCtx.getTools = async function (opts) {
        const tools = getAllTools();
        const allowedOrigins = Array.isArray(opts && opts.fromOrigins) ? new Set(opts.fromOrigins) : null;
        return tools.filter(function(t) {
          return t.origin === window.location.origin || (allowedOrigins && allowedOrigins.has(t.origin));
        });
      };
    }

    // Ensure executeTool() is available
    if (typeof nativeCtx.executeTool !== 'function') {
      nativeCtx.executeTool = async function (toolRef, args) {
        const name = typeof toolRef === 'string' ? toolRef : (toolRef && toolRef.name);
        let parsedArgs = args;
        if (typeof args === 'string') {
          try { parsedArgs = JSON.parse(args); } catch (e) {}
        }
        if (window.__webmcp_registered_tools.has(name)) {
          const t = window.__webmcp_registered_tools.get(name);
          const fn = t._execute || t.execute;
          if (typeof fn === 'function') {
            const raw = await fn(parsedArgs);
            return formatMcpResponse(raw);
          }
        }
        throw new Error('Tool ' + name + ' not found');
      };
    }

    // Mirror to both document and navigator
    if (!window.document.modelContext) window.document.modelContext = nativeCtx;
    if (!window.navigator.modelContext) window.navigator.modelContext = nativeCtx;
    window.modelContext = nativeCtx;

    console.log('⚡ WebMCP Native Engine Active with DevTools Enhancements');
  } else {
    // --- POLYFILL MODE (Standard Spec Implementation) ---
    class ModelContextPolyfill extends EventTarget {
      #toolChangeHandler = null;

      get ontoolchange() {
        return this.#toolChangeHandler;
      }

      set ontoolchange(handler) {
        if (this.#toolChangeHandler) this.removeEventListener('toolchange', this.#toolChangeHandler);
        this.#toolChangeHandler = handler;
        if (handler) this.addEventListener('toolchange', handler);
      }

      async registerTool(toolDef, options) {
        options = options || {};
        if (!toolDef || typeof toolDef !== 'object') throw new DOMException('Invalid tool object', 'TypeError');
        const name = toolDef.name;
        const desc = toolDef.description;
        if (!name || typeof name !== 'string') throw new DOMException('Invalid tool name', 'InvalidStateError');
        if (!desc || typeof desc !== 'string') throw new DOMException('Invalid tool description', 'InvalidStateError');

        if (options.signal) {
          if (options.signal.aborted) throw options.signal.reason || new DOMException('Aborted', 'AbortError');
          options.signal.addEventListener('abort', () => this.unregisterTool(name));
        }

        const item = {
          name: name,
          title: toolDef.title || name,
          description: desc,
          inputSchema: toolDef.inputSchema || { type: 'object', properties: {} },
          window: window,
          origin: window.location.origin,
          annotations: toolDef.annotations,
          _execute: toolDef.execute,
        };

        window.__webmcp_registered_tools.set(name, item);
        this.dispatchEvent(new Event('toolchange'));
      }

      unregisterTool(name) {
        const deleted = window.__webmcp_registered_tools.delete(name);
        if (deleted) this.dispatchEvent(new Event('toolchange'));
        return deleted;
      }

      async getTools(opts) {
        const all = getAllTools();
        const allowedOrigins = Array.isArray(opts && opts.fromOrigins) ? new Set(opts.fromOrigins) : null;
        return all.filter(function(t) {
          return t.origin === window.location.origin || (allowedOrigins && allowedOrigins.has(t.origin));
        });
      }

      async executeTool(toolRef, args) {
        const name = typeof toolRef === 'string' ? toolRef : (toolRef && toolRef.name);
        let parsedArgs = args;
        if (typeof args === 'string') {
          try { parsedArgs = JSON.parse(args); } catch (e) {}
        }

        if (window.__webmcp_registered_tools.has(name)) {
          const t = window.__webmcp_registered_tools.get(name);
          const fn = t._execute || t.execute;
          if (typeof fn === 'function') {
            const raw = await fn(parsedArgs);
            return formatMcpResponse(raw);
          }
        }

        // Check declarative form
        const form = window.document ? window.document.querySelector('form[toolname="' + name + '"]') : null;
        if (form) {
          return new Promise(function(resolve, reject) {
            try {
              const submitEvt = new CustomEvent('submit', { cancelable: true, bubbles: true });
              submitEvt.agentInvoked = true;
              submitEvt.respondWith = function(res) {
                Promise.resolve(res).then(function(r) { resolve(formatMcpResponse(r)); }).catch(reject);
              };
              form.dispatchEvent(submitEvt);
            } catch (err) {
              reject(err);
            }
          });
        }

        throw new Error('Tool ' + name + ' not found');
      }
    }

    const polyfillInstance = new ModelContextPolyfill();
    try {
      if (!window.document.modelContext) window.document.modelContext = polyfillInstance;
    } catch (e) {}
    try {
      if (!window.navigator.modelContext) window.navigator.modelContext = polyfillInstance;
    } catch (e) {}
    window.modelContext = polyfillInstance;

    console.log('⚡ WebMCP Polyfill Active (document.modelContext & navigator.modelContext)');
  }

  // Chrome DevTools / Extension Window PostMessage Protocol
  window.addEventListener('message', async function (event) {
    const data = event.data;
    const source = event.source;
    if (!data || !source) return;

    if (data.type === 'WEBMCP_GET_TOOLS_REQUEST') {
      const tools = getAllTools().map(function(t) {
        return {
          name: t.name,
          title: t.title || t.name,
          description: t.description,
          inputSchema: t.inputSchema,
          origin: t.origin,
          annotations: t.annotations,
        };
      });

      source.postMessage({
        type: 'WEBMCP_GET_TOOLS_RESPONSE',
        requestId: data.requestId,
        tools: tools,
      }, '*');
    }

    if (data.type === 'WEBMCP_EXECUTE_TOOL_REQUEST') {
      const name = data.name;
      const args = data.args;
      const requestId = data.requestId;
      try {
        const ctx = window.document?.modelContext || window.navigator?.modelContext || window.modelContext;
        if (!ctx || typeof ctx.executeTool !== 'function') throw new Error('WebMCP executeTool unavailable');
        const result = await ctx.executeTool({ name: name }, args);
        source.postMessage({
          type: 'WEBMCP_EXECUTE_TOOL_RESPONSE',
          requestId: requestId,
          success: true,
          result: result,
        }, '*');
      } catch (err) {
        source.postMessage({
          type: 'WEBMCP_EXECUTE_TOOL_RESPONSE',
          requestId: requestId,
          success: false,
          error: err.message || String(err),
        }, '*');
      }
    }
  });
})();
