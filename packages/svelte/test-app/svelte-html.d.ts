declare module 'svelte/elements' {
  export interface HTMLAttributes<T extends EventTarget> {
    'scroll-region'?: boolean | '' | undefined
  }
}

export {}
