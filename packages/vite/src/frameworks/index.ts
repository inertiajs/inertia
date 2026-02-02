import type { FrameworkConfig } from './types'
import { config as vue } from './vue'
import { config as react } from './react'
import { config as svelte } from './svelte'

export type { SSROptions, SSRTemplate, FrameworkConfig } from './types'
export { formatOptions } from './types'

const frameworks: FrameworkConfig[] = [vue, react, svelte]

export const defaultFrameworks: Record<string, FrameworkConfig> = Object.fromEntries(
  frameworks.map((config) => [config.package, config]),
)
