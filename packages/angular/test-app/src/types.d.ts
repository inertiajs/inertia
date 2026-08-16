import type { Method, Page, Router } from '@inertiajs/core'

declare module '@inertiajs/core' {
  interface InertiaConfig {
    flashDataType: { message?: string }
    layoutProps: { title?: string; showSidebar?: boolean }
    namedLayoutProps: {
      app: { title?: string; theme?: string }
      content: { padding?: string; maxWidth?: string }
    }
    sharedPageProps: { auth?: { user: { id: number; name: string } | null } }
  }
}

declare global {
  interface Window {
    initialPage?: Page
    _inertia_request_dump: {
      headers: Record<string, string>
      method: Method
      form: Record<string, unknown> | undefined
      files: unknown
      query: Record<string, unknown>
      url: string
      $page: Page
    }
    resolverReceivedPage: Page | null
    _inertia_props: Record<string, unknown>
    _inertia_page_props: Record<string, unknown>
    _inertia_site_layout_props: Record<string, unknown>
    _inertia_nested_layout_props: Record<string, unknown>
    _inertia_layout_id: string
    _inertia_nested_layout_id: string
    _inertia_app_layout_id: string
    _inertia_content_layout_id: string
    _inertia_page_key: string
    componentEvents: Array<{ eventName: string; data: unknown; timestamp: number }>
    _raw_body_response?: unknown
    inertiaHttpClient: 'default' | 'axios'
    progressTests: unknown[]
    messages: unknown[]
    events: string[]
    data: Array<{ type: string; data: unknown; event: string | null }>
    _http_handler_messages: string[]
    _http_handler_unsubscribers: Array<() => void>
    testing: {
      Inertia: Router
    }
  }
}

export {}
