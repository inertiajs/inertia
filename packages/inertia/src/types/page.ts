import { Errors } from '.'

export interface Page {
  component: string,
  props: {
    [key: string]: unknown,
    errors: Errors,
  }
  url: string,
  version: string|null

  // Refactor away
  scrollRegions: Array<{ top: number, left: number }>
  rememberedState: Record<string, unknown>
  resolvedErrors: Errors
}
