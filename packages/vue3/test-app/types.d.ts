import type { Method, Page, PageProps, Router } from '@inertiajs/core'
import type { FakeLiveTransportControls } from './fakeLiveTransport'

declare global {
  interface Window {
    testing: {
      Inertia: Router
    }
    initialPage: Page
    _inertia_request_dump: {
      headers: Record<string, string>
      method: Method
      form: Record<string, unknown> | undefined
      files: MulterFile[] | object
      query: Record<string, unknown>
      url: string
      $page: Page
    }
    _inertia_page_key: number | undefined
    _inertia_props: PageProps
    _inertia_layout_id: number | undefined
    _inertia_site_layout_props: PageProps
    _inertia_nested_layout_id: number | undefined
    _inertia_nested_layout_props: PageProps
    _inertia_page_props: PageProps
    _inertia_app_layout_id: string | undefined
    _inertia_content_layout_id: string | undefined
    _plugin_global_props: object
    resolverReceivedPage: Page | null
    __inertiaLive: FakeLiveTransportControls
    __inertiaEcho: {
      emit(channel: string, event: string, payload?: unknown): void
      status(status: string): void
      log(): string[]
      swap(): void
    }
  }

  interface ImportMeta {
    readonly glob: <T>(pattern: string, options: { eager: true }) => Record<string, T>
  }
}

export type MulterFile = Express.Multer.File
