// Lightweight registry for live validation providers (Vue adapter)
// Built-in: laravel-precognition

export type ProviderModuleShape = {
  // Provider must expose a factory compatible with our usage
  createValidator: (requestFactory: (client: any) => Promise<any> | any, initialData: Record<string, any>) => any
  toSimpleValidationErrors?: (errors: any) => Record<string, string>
  resolveName?: (event: Event) => string | undefined
}

export type LiveValidationProviderAdapter = {
  id: string
  import: () => Promise<ProviderModuleShape>
}

const registry = new Map<string, LiveValidationProviderAdapter>()

export function registerLiveValidationProvider(adapter: LiveValidationProviderAdapter) {
  registry.set(adapter.id, adapter)
}

export function getLiveValidationProvider(id: string): LiveValidationProviderAdapter | null {
  return registry.get(id) ?? null
}

export async function detectInstalledProviders(): Promise<string[]> {
  return Array.from(registry.keys())
}