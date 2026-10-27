import { ExternalNavigationOptions } from './types'

// A document has one active Inertia router, even when its host replaces the mount.
export const navigation = {
  external: undefined as ExternalNavigationOptions | undefined,
  generation: 0,
  active: true,

  init(external?: ExternalNavigationOptions) {
    this.external = external
    this.active = true

    return ++this.generation
  },

  isCurrent(generation: number) {
    return this.active && generation === this.generation
  },
}
