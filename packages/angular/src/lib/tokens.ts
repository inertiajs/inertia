import { InjectionToken, type ViewContainerRef } from '@angular/core'
import type { PageProps } from '@inertiajs/core'
import type { InertiaAppProps } from './types'

export const INERTIA_APP_PROPS = new InjectionToken<InertiaAppProps<PageProps>>('INERTIA_APP_PROPS')

export const INERTIA_LAYOUT_CHILD = new InjectionToken<(outlet: ViewContainerRef) => void>('INERTIA_LAYOUT_CHILD')
