# Inertia + Angular

Inertia owns navigation, history, scroll restoration, caching, and visits. Do not add Angular Router to an Inertia application.

Page and layout props used as direct bindings must be declared as Angular inputs. The complete page object is always available through `usePage()`.

Use standalone, zoneless Angular components. A persistent layout imports `LayoutOutlet` and renders `<inertia-layout-outlet />` where its child layout or page belongs.

Use `Link`, `Form`, and `InfiniteScroll` on semantic native elements. Use `useForm()` or `useHttp()` for signal-based form state; do not introduce Angular `HttpClient` as a second Inertia transport.
