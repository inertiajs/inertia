// Composing a layer is browser work: the visit fires DOM events, writes history and resets scroll.
// Loaded as a vitest setup file, so the globals stand before any module that reads them at import.

const session = new Map<string, string>()

// `eventHandler.init()` registers its listeners here, so keeping them lets a test drive popstate
// through the handler the browser would rather than reaching past it.
export const listeners = new Map<string, EventListener>()

// The stub has no listeners of its own, so a test that needs a cancelable event cancelled says so
// here: `dispatchEvent` returning false is exactly what a listener calling preventDefault does.
export const veto = { types: new Set<string>() }

globalThis.window = {
  location: new URL('http://localhost/users'),
  history: { state: {}, pushState: () => {}, replaceState: () => {}, go: () => {} },
  navigator: { userAgent: 'node' },
  scrollTo: () => {},
  addEventListener: (type: string, listener: EventListener) => listeners.set(type, listener),
  requestAnimationFrame: () => 0,
  setTimeout: () => 0,
  // Encrypting an entry is real crypto against a real session store, so an encrypted stack can be
  // read back rather than only asserted to be unreadable.
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
