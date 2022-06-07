import Vue from 'vue'
import { Inertia, HeadManager, Page } from '@inertiajs/inertia'
import { LayoutComponent } from './app'
import { FormFactory } from './form'

declare module 'vue/types/vue' {
  interface Vue {
    $inertia: Omit<typeof Inertia, 'form'> & { form: FormFactory }
    $page: Page
    $headManager: HeadManager
  }
}

declare module 'vue/types/options' {
  interface ComponentOptions<V extends Vue> {
    layout?: LayoutComponent
    remember?: string | string[] | {
      data: string[],
      key?: string | (() => string)
    }
  }
}
