import { Inertia, HeadManager, Page } from '@inertiajs/inertia'
import { LayoutComponent } from './app'
import { FormFactory } from './form'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    /**
     * Inertia router instance.
     */
    $inertia: Omit<typeof Inertia, 'form'> & { form: FormFactory }

    /**
     * Current page infomation.
     */
    $page: Page

    /**
     * Inertia page head manager.
     */
    $headManager: HeadManager
  }

  interface ComponentCustomOptions {
    /**
     * Define layout for current page.
     */
    layout?: LayoutComponent

    /**
     * Remember data.
     */
    remember?: string | string[] | {
      data: string[]
      key?: string | (() => string)
    }
  }
}

export {}
