import type { Method, Page, PageProps, Router } from '@inertiajs/core'

declare global {
  interface Window {
    testing: {
      Inertia: Router
    }
    initialPage: Page
    _inertia_request_dump: {
      headers: Record<string, string>
      method: Method
      form: Record<string, any> | undefined
      files: MulterFile[] | object
      query: Record<string, any>
      $page: Page
    }
    _inertia_page_key: string | undefined
    _inertia_props: PageProps
    _inertia_layout_id: number | string | undefined
    _inertia_site_layout_props: PageProps
    _inertia_nested_layout_id: number | string | undefined
    _inertia_nested_layout_props: PageProps
    _inertia_page_props: PageProps
    _plugin_global_props: object
  }

  interface ImportMeta {
    readonly glob: <T>(pattern: string, options: { eager: true }) => Record<string, T>
  }
}

export type MulterFile = Express.Multer.File
