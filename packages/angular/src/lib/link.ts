import {
  Directive,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  isDevMode,
  output,
  signal,
  type OnInit,
} from '@angular/core'
import {
  isUrlMethodPair,
  mergeDataIntoQueryString,
  resolveUrlMethodPairComponent,
  router,
  shouldIntercept,
  shouldNavigate,
  type ActiveVisit,
  type CacheForOption,
  type CancelToken,
  type Errors,
  type LinkComponentBaseProps,
  type LinkPrefetchOption,
  type Method,
  type Page,
  type PendingVisit,
  type Progress,
  type RequestPayload,
  type UrlMethodPair,
  type VisitCallbacks,
  type VisitOptions,
} from '@inertiajs/core'
import { config } from './config'

export interface InertiaLinkProps extends LinkComponentBaseProps {
  href: string | UrlMethodPair
}

@Directive({
  selector: '[inertiaLink]',
  exportAs: 'inertiaLink',
  host: {
    '[attr.data-loading]': 'loading() ? "" : null',
    '[attr.href]': 'anchorHref()',
    '[attr.type]': 'buttonType()',
    '(click)': 'handleClick($event)',
    '(keydown)': 'handleKeyDown($event)',
    '(keyup)': 'handleKeyUp($event)',
    '(mousedown)': 'handleMouseDown($event)',
    '(mouseenter)': 'handleMouseEnter()',
    '(mouseleave)': 'handleMouseLeave()',
    '(mouseup)': 'handleMouseUp($event)',
  },
})
export class Link implements OnInit {
  readonly #element = inject<ElementRef<HTMLElement>>(ElementRef)
  readonly #destroyRef = inject(DestroyRef)
  readonly #inFlight = signal(0)
  #hoverTimeout: ReturnType<typeof setTimeout> | undefined

  readonly href = input<string | UrlMethodPair>('', { alias: 'href' })
  readonly method = input<Method | Uppercase<Method>>('get')
  readonly data = input<RequestPayload>({})
  readonly preserveScroll = input<NonNullable<VisitOptions['preserveScroll']>>(false)
  readonly preserveState = input<VisitOptions['preserveState'] | null>(null)
  readonly preserveUrl = input(false)
  readonly replace = input(false)
  readonly only = input<string[]>([])
  readonly except = input<string[]>([])
  readonly headers = input<Record<string, string>>({})
  readonly queryStringArrayFormat = input<NonNullable<VisitOptions['queryStringArrayFormat']>>('brackets')
  readonly async = input(false)
  readonly viewTransition = input<NonNullable<VisitOptions['viewTransition']>>(false)
  readonly component = input<string | null>(null)
  readonly instant = input(false)
  readonly pageProps = input<Exclude<InertiaLinkProps['pageProps'], undefined>>(null)
  readonly prefetch = input<boolean | LinkPrefetchOption | LinkPrefetchOption[]>(false)
  readonly cacheFor = input<CacheForOption | CacheForOption[]>()
  readonly cacheTags = input<string | string[]>([])

  readonly onCancelToken = input<VisitCallbacks['onCancelToken'] | null>(null)
  readonly onBefore = input<VisitCallbacks['onBefore'] | null>(null)
  readonly onStart = input<VisitCallbacks['onStart'] | null>(null)
  readonly onProgress = input<VisitCallbacks['onProgress'] | null>(null)
  readonly onFinish = input<VisitCallbacks['onFinish'] | null>(null)
  readonly onCancel = input<VisitCallbacks['onCancel'] | null>(null)
  readonly onSuccess = input<VisitCallbacks['onSuccess'] | null>(null)
  readonly onError = input<VisitCallbacks['onError'] | null>(null)
  readonly onPrefetching = input<VisitCallbacks['onPrefetching'] | null>(null)
  readonly onPrefetched = input<VisitCallbacks['onPrefetched'] | null>(null)

  readonly cancelToken = output<CancelToken>()
  readonly before = output<PendingVisit>()
  readonly start = output<PendingVisit>()
  readonly progress = output<Progress | undefined>()
  readonly finish = output<ActiveVisit>()
  readonly cancel = output<void>()
  readonly success = output<Page>()
  readonly error = output<Errors>()
  readonly prefetching = output<PendingVisit>()
  readonly prefetched = output<{ response: unknown; visit: PendingVisit }>()

  readonly loading = computed(() => this.#inFlight() > 0)
  readonly #resolvedMethod = computed<Method>(() => {
    const href = this.href()
    return isUrlMethodPair(href) ? href.method : (this.method().toLowerCase() as Method)
  })
  readonly #urlAndData = computed(() => {
    const href = this.href()
    return mergeDataIntoQueryString(
      this.#resolvedMethod(),
      isUrlMethodPair(href) ? href.url : href,
      this.data(),
      this.queryStringArrayFormat(),
    )
  })
  readonly anchorHref = computed(() => (this.#element.nativeElement.tagName === 'A' ? this.#urlAndData()[0] : null))
  readonly buttonType = computed(() => (this.#element.nativeElement.tagName === 'BUTTON' ? 'button' : null))
  readonly #prefetchModes = computed<LinkPrefetchOption[]>(() => {
    const prefetch = this.prefetch()
    if (prefetch === true) return ['hover']
    if (prefetch === false) return []
    return Array.isArray(prefetch) ? prefetch : [prefetch]
  })

  constructor() {
    effect(() => {
      if (this.#prefetchModes().includes('mount')) {
        queueMicrotask(() => this.#doPrefetch())
      }
    })
    this.#destroyRef.onDestroy(() => clearTimeout(this.#hoverTimeout))
  }

  ngOnInit(): void {
    if (isDevMode() && this.#element.nativeElement.tagName === 'A' && this.#resolvedMethod() !== 'get') {
      console.warn('[Inertia] Non-GET links should use a <button inertiaLink> element.')
    }
  }

  handleClick(event: MouseEvent): void {
    if (!shouldIntercept(event)) return
    event.preventDefault()
    if (!this.#prefetchModes().includes('click')) this.#visit()
  }

  handleMouseEnter(): void {
    if (!this.#prefetchModes().includes('hover')) return
    this.#hoverTimeout = setTimeout(() => this.#doPrefetch(), config.get('prefetch.hoverDelay'))
  }

  handleMouseLeave(): void {
    clearTimeout(this.#hoverTimeout)
  }

  handleMouseDown(event: MouseEvent): void {
    if (this.#prefetchModes().includes('click') && shouldIntercept(event)) {
      event.preventDefault()
      this.#doPrefetch()
    }
  }

  handleMouseUp(event: MouseEvent): void {
    if (this.#prefetchModes().includes('click') && shouldIntercept(event)) {
      event.preventDefault()
      this.#visit()
    }
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (this.#prefetchModes().includes('click') && shouldNavigate(event)) {
      event.preventDefault()
      this.#doPrefetch()
    }
  }

  handleKeyUp(event: KeyboardEvent): void {
    if (this.#prefetchModes().includes('click') && shouldNavigate(event)) {
      event.preventDefault()
      this.#visit()
    }
  }

  #baseParams(): VisitOptions {
    const href = this.href()
    const component =
      this.component() ?? (this.instant() && isUrlMethodPair(href) ? resolveUrlMethodPairComponent(href) : null)

    return {
      data: this.#urlAndData()[1],
      method: this.#resolvedMethod(),
      preserveScroll: this.preserveScroll(),
      preserveState: this.preserveState() ?? this.#resolvedMethod() !== 'get',
      preserveUrl: this.preserveUrl(),
      replace: this.replace(),
      only: this.only(),
      except: this.except(),
      headers: this.headers(),
      queryStringArrayFormat: this.queryStringArrayFormat(),
      async: this.async(),
      component,
      pageProps: this.pageProps(),
    }
  }

  #visit(): void {
    router.visit(this.#urlAndData()[0], {
      ...this.#baseParams(),
      viewTransition: this.viewTransition(),
      onCancelToken: (token) => {
        this.onCancelToken()?.(token)
        this.cancelToken.emit(token)
      },
      onBefore: (visit) => {
        const result = this.onBefore()?.(visit)
        this.before.emit(visit)
        return result
      },
      onStart: (visit) => {
        this.#inFlight.update((count) => count + 1)
        this.onStart()?.(visit)
        this.start.emit(visit)
      },
      onProgress: (progress) => {
        this.onProgress()?.(progress)
        this.progress.emit(progress)
      },
      onFinish: (visit) => {
        this.#inFlight.update((count) => Math.max(0, count - 1))
        this.onFinish()?.(visit)
        this.finish.emit(visit)
      },
      onCancel: () => {
        this.onCancel()?.()
        this.cancel.emit()
      },
      onSuccess: (page) => {
        const result = this.onSuccess()?.(page)
        this.success.emit(page)
        return result
      },
      onError: (errors) => {
        const result = this.onError()?.(errors)
        this.error.emit(errors)
        return result
      },
    })
  }

  #doPrefetch(): void {
    const modes = this.#prefetchModes()
    const cacheFor =
      this.cacheFor() ?? (modes.length === 1 && modes[0] === 'click' ? 0 : config.get('prefetch.cacheFor'))
    const configuredTags = this.cacheTags()
    const cacheTags = typeof configuredTags === 'string' ? [configuredTags] : configuredTags

    router.prefetch(
      this.#urlAndData()[0],
      {
        ...this.#baseParams(),
        onPrefetching: (visit) => {
          this.onPrefetching()?.(visit)
          this.prefetching.emit(visit)
        },
        onPrefetched: (response, visit) => {
          this.onPrefetched()?.(response, visit)
          this.prefetched.emit({ response, visit })
        },
      },
      { cacheFor, cacheTags },
    )
  }
}
