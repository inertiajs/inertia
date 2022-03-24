import Vue from 'vue'
import { Inertia, HeadManager, Page } from '@inertiajs/inertia'
import { LayoutComponent } from './app'

declare module 'vue/types/vue' {
  interface Vue {
    $inertia: typeof Inertia
    $page: Page
    $headManager?: HeadManager
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
