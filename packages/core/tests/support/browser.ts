// Vitest setup file, so these globals stand before any module that reads them at import.

const session = new Map<string, string>()

// Keeps what `eventHandler.init()` registers, so a test can drive popstate through the real handler.
export const listeners = new Map<string, EventListener>()

// The stub has no listeners, so a test cancels an event by naming its type here.
export const veto = { types: new Set<string>() }

globalThis.window = {
  location: new URL('http://localhost/users'),
  history: { state: {}, pushState: () => {}, replaceState: () => {}, go: () => {} },
  navigator: { userAgent: 'node' },
  scrollTo: () => {},
  addEventListener: (type: string, listener: EventListener) => listeners.set(type, listener),
  requestAnimationFrame: () => 0,
  setTimeout: () => 0,
  // Real crypto against a real session store, so an encrypted stack can be read back.
  crypto: globalThis.crypto,
  sessionStorage: {
    getItem: (key: string) => session.get(key) ?? null,
    setItem: (key: string, value: string) => session.set(key, value),
    removeItem: (key: string) => session.delete(key),
    clear: () => session.clear(),
  },
} as unknown as Window & typeof globalThis

globalThis.document = {
  dispatchEvent: (event: Event) => !veto.types.has(event.type),
  querySelectorAll: () => [],
  getElementById: () => null,
  addEventListener: () => {},
  // The error dialog mounts real elements (dialog.ts), so the stub has to hand them out.
  createElement: () => ({
    style: {},
    setAttribute: () => {},
    addEventListener: () => {},
    appendChild: () => {},
    prepend: () => {},
    querySelectorAll: () => [],
    showModal: () => {},
    focus: () => {},
    remove: () => {},
  }),
  head: { appendChild: () => {} },
  body: { prepend: () => {} },
} as unknown as Document
