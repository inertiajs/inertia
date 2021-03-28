export interface Page {
  component: string,
  props: Record<string, unknown>
  url: string,
  version: string|null

  // Refactor away
  scrollRegions: unknown
  rememberedState: Record<string, unknown>
  resolvedErrors: Record<string, unknown>
}
