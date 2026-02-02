export type SSRTemplate = (configureCall: string, options: string) => string

export interface FrameworkConfig {
  package: string
  extensions: string[]
  extractDefault?: boolean
  ssr?: SSRTemplate
}

export interface SSROptions {
  port?: number
  cluster?: boolean
}

export function formatSSROptions(options: SSROptions): string {
  const entries = Object.entries(options).filter(([, v]) => v !== undefined)

  return entries.length > 0 ? `, ${JSON.stringify(Object.fromEntries(entries))}` : ''
}
