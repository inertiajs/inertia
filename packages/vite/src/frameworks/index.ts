import type { FrameworkConfig } from '../types'
import { config as vue } from './vue'
import { config as react } from './react'
import { config as svelte } from './svelte'

const frameworks: FrameworkConfig[] = [vue, react, svelte]

export const defaultFrameworks: Record<string, FrameworkConfig> = Object.fromEntries(
  frameworks.map((config) => [config.package, config]),
)
