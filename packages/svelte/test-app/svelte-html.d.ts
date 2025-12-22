declare module 'svelte/elements' {
  export interface HTMLAttributes<T extends EventTarget> {
    'scroll-region'?: boolean | '' | undefined
    'oncancel-token'?: ((event: CustomEvent<{ token: any }>) => void) | (() => void)
  }
}

export {}
