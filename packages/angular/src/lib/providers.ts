import { makeEnvironmentProviders, type EnvironmentProviders, type Provider } from '@angular/core'
import { InertiaRenderer } from './renderer'
import { InertiaRuntime } from './runtime'
import { INERTIA_APP_PROPS } from './tokens'
import type { InertiaAppProps } from './types'

export function provideInertiaApp(
  props: InertiaAppProps,
  additionalProviders: Array<Provider | EnvironmentProviders> = [],
): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: INERTIA_APP_PROPS, useValue: props },
    InertiaRuntime,
    InertiaRenderer,
    ...additionalProviders,
  ])
}
