import Vue from 'vue'
import { Inertia, HeadManager, Page } from '@inertiajs/inertia'
import { LayoutComponent } from './app'
import { FormFactory } from './form'

declare module 'vue/types/vue' {
  interface Vue {
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
}

declare module 'vue/types/options' {
  interface ComponentOptions<V extends Vue> {
    /**
     * Define layout for current page.
     */
    layout?: LayoutComponent

    /**
     * Remember data.
     */
    remember?: string | string[] | {
      data: string[],
      key?: string | (() => string)
    }
  }
}

export {}
