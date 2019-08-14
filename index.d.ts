declare namespace Inertia {
  interface PagePropsBeforeTransform {}

  interface PageProps {}

  interface Page<CustomPageProps extends PageProps = PageProps> {
    component: string;
    props: CustomPageProps;
    url: string;
    version: string | null;
  }

  type VisitOptions = {
    method?: string;
    preserveScroll?: boolean;
    preserveState?: boolean;
    replace?: boolean;
    only?: Array<string>;
  };

  interface Inertia {
    init: <
      Component,
      CustomPageProps extends PagePropsBeforeTransform = PagePropsBeforeTransform
    >(arguments: {
      initialPage: Page<CustomPageProps>;
      resolveComponent: (name: string) => Component | Promise<Component>;
      updatePage: (
        component: Component,
        props: CustomPageProps,
        options: {
          preserveState: boolean;
        }
      ) => void;
    }) => void;

    visit: (
      url: string,
      options?: VisitOptions & { data?: object }
    ) => Promise<void>;

    patch: (
      url: string,
      data?: object,
      options?: VisitOptions
    ) => Promise<void>;

    post: (url: string, data?: object, options?: VisitOptions) => Promise<void>;

    put: (url: string, data?: object, options?: VisitOptions) => Promise<void>;

    delete: (
      url: string,
      data?: object,
      options?: VisitOptions
    ) => Promise<void>;

    reload: (options?: VisitOptions) => Promise<void>;

    replace: (url: string, options?: VisitOptions) => Promise<void>;

    remember: (data: object, key?: string) => void;

    restore: (key?: string) => object;
  }

  type shouldIntercept = (event: MouseEvent | KeyboardEvent) => boolean;
}

declare module "@inertiajs/inertia" {
  export const Inertia: Inertia.Inertia;

  export const shouldIntercept: Inertia.shouldIntercept;
}
