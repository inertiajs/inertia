import { Inertia, HeadManager, Page } from '@inertiajs/inertia'
import { LayoutComponent } from './app'
import { FormFactory } from './form'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $inertia: Omit<typeof Inertia, 'form'> & { form: FormFactory }
    $page: Page
    $headManager: HeadManager
  }

  interface ComponentCustomOptions {
    layout?: LayoutComponent
    remember?: string | string[] | {
      data: string[]
      key?: string | (() => string)
    }
  }
}
