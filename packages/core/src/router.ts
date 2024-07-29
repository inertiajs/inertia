import { hideProgress, revealProgress } from '.'
import { eventHandler } from './eventHandler'
import { fireBeforeEvent } from './events'
import { History } from './history'
import { InitialVisit } from './initialVisit'
import { page as currentPage } from './page'
import { polls } from './polls'
import { prefetchedRequests } from './prefetched'
import { Request } from './request'
import { RequestStream } from './requestStream'
import { Response } from './response'
import { Scroll } from './scroll'
import {
  GlobalEvent,
  GlobalEventNames,
  GlobalEventResult,
  PendingVisit,
  PollOptions,
  ReloadOptions,
  RequestPayload,
  RouterInitParams,
  VisitHelperOptions,
  VisitOptions,
} from './types'
import { transformUrlAndData } from './url'

export class Router {
  protected syncRequestStream = new RequestStream({
    maxConcurrent: 1,
    interruptible: true,
  })

  protected asyncRequestStream = new RequestStream({
    maxConcurrent: Infinity,
    interruptible: false,
  })

  public init({ initialPage, resolveComponent, swapComponent }: RouterInitParams): void {
    currentPage.init({
      initialPage,
      resolveComponent,
      swapComponent,
    })

    currentPage.on('firstLoad', () => {
      this.loadDeferredProps()
    })

    currentPage.on('newComponent', () => {
      polls.clear()
      this.loadDeferredProps()
    })

    InitialVisit.handle()

    eventHandler.init()
    eventHandler.on('missingHistoryItem', () => {
      this.visit(window.location.href, { preserveState: true, preserveScroll: true, replace: true })
    })
  }

  public get(url: URL | string, data: RequestPayload = {}, options: VisitHelperOptions = {}): void {
    return this.visit(url, { ...options, method: 'get', data })
  }

  public post(url: URL | string, data: RequestPayload = {}, options: VisitHelperOptions = {}): void {
    return this.visit(url, { preserveState: true, ...options, method: 'post', data })
  }

  public put(url: URL | string, data: RequestPayload = {}, options: VisitHelperOptions = {}): void {
    return this.visit(url, { preserveState: true, ...options, method: 'put', data })
  }

  public patch(url: URL | string, data: RequestPayload = {}, options: VisitHelperOptions = {}): void {
    return this.visit(url, { preserveState: true, ...options, method: 'patch', data })
  }

  public delete(url: URL | string, options: Omit<VisitOptions, 'method'> = {}): void {
    return this.visit(url, { preserveState: true, ...options, method: 'delete' })
  }

  public reload(options: ReloadOptions = {}): void {
    return this.visit(window.location.href, {
      ...options,
      preserveScroll: true,
      preserveState: true,
      async: true,
      headers: {
        ...(options.headers || {}),
        'Cache-Control': 'no-cache',
      },
    })
  }

  public remember(data: unknown, key = 'default'): void {
    History.remember(data, key)
  }

  public restore(key = 'default'): unknown {
    return History.restore(key)
  }

  public on<TEventName extends GlobalEventNames>(
    type: TEventName,
    callback: (event: GlobalEvent<TEventName>) => GlobalEventResult<TEventName>,
  ): VoidFunction {
    return eventHandler.onGlobalEvent(type, callback)
  }

  public cancel(): void {
    this.syncRequestStream.cancelInFlight()
  }

  public cancelAll(): void {
    this.asyncRequestStream.cancelInFlight()
    this.syncRequestStream.cancelInFlight()
  }

  public poll(interval: number, requestOptions: ReloadOptions = {}, options: PollOptions = {}) {
    return polls.add(interval, () => this.reload(requestOptions), { keepAlive: options.keepAlive || false })
  }

  public visit(
    href: string | URL,
    {
      method = 'get',
      data = {},
      replace = false,
      preserveScroll = false,
      preserveState = false,
      only = [],
      except = [],
      headers = {},
      errorBag = '',
      forceFormData = false,
      onCancelToken = () => {},
      onBefore = () => {},
      onStart = () => {},
      onProgress = () => {},
      onFinish = () => {},
      onCancel = () => {},
      onSuccess = () => {},
      onError = () => {},
      onPrefetched = () => {},
      queryStringArrayFormat = 'brackets',
      async = false,
      showProgress,
    }: VisitOptions = {},
  ): void {
    const [url, _data] = transformUrlAndData(href, data, method, forceFormData, queryStringArrayFormat)

    const visit: PendingVisit = {
      url,
      method,
      data: _data,
      replace,
      preserveScroll,
      preserveState,
      only,
      except,
      headers,
      errorBag,
      forceFormData,
      queryStringArrayFormat,
      cancelled: false,
      completed: false,
      interrupted: false,
      async,
      showProgress: showProgress ?? !async,
      prefetch: false,
    }

    // If either of these return false, we don't want to continue
    if (onBefore(visit) === false || !fireBeforeEvent(visit)) {
      return
    }

    revealProgress(true)

    const requestStream = async ? this.asyncRequestStream : this.syncRequestStream

    requestStream.interruptInFlight()

    if (!currentPage.isCleared()) {
      // Save scroll regions for the current page
      Scroll.save(currentPage.get())
    }

    const requestParams = {
      ...visit,
      onCancelToken,
      onBefore,
      onStart,
      onProgress,
      onFinish,
      onCancel,
      onSuccess,
      onError,
      onPrefetched,
      queryStringArrayFormat,
    }

    prefetchedRequests.get(requestParams).then((response) => {
      if (response) {
        prefetchedRequests.use(response, requestParams)
      } else {
        requestStream.send(Request.create(requestParams, currentPage.get()))
      }
    })
  }

  public prefetch(
    href: string | URL,
    {
      method = 'get',
      data = {},
      replace = false,
      preserveScroll = false,
      preserveState = false,
      only = [],
      except = [],
      headers = {},
      errorBag = '',
      forceFormData = false,
      onCancelToken = () => {},
      onBefore = () => {},
      onStart = () => {},
      onProgress = () => {},
      onFinish = () => {},
      onCancel = () => {},
      onSuccess = () => {},
      onError = () => {},
      onPrefetched = () => {},
      queryStringArrayFormat = 'brackets',
      async = false,
    }: VisitOptions = {},
    {
      staleAfter,
    }: {
      staleAfter: number | string
    },
  ) {
    if (method !== 'get') {
      throw new Error('Prefetch requests must use the GET method')
    }

    const [url, _data] = transformUrlAndData(href, data, method, forceFormData, queryStringArrayFormat)

    const visit: PendingVisit = {
      url,
      method,
      data: _data,
      replace,
      preserveScroll,
      preserveState,
      only,
      except,
      headers,
      errorBag,
      forceFormData,
      queryStringArrayFormat,
      cancelled: false,
      completed: false,
      interrupted: false,
      async,
      showProgress: true,
      prefetch: true,
    }

    // If either of these return false, we don't want to continue
    if (onBefore(visit) === false || !fireBeforeEvent(visit)) {
      return
    }

    hideProgress()

    const requestStream = this.asyncRequestStream

    requestStream.interruptInFlight()

    const requestParams = {
      ...visit,
      onCancelToken,
      onBefore,
      onStart,
      onProgress,
      onFinish,
      onCancel,
      onSuccess,
      onError,
      onPrefetched,
      queryStringArrayFormat,
    }

    return prefetchedRequests.add(
      requestParams,
      (params) => {
        requestStream.send(Request.create(params, currentPage.get()))
      },
      { staleAfter },
    )
  }

  public loadFromPrefetch(response: Response): void {
    response.handle()
  }

  public replace(url: URL | string, options: Omit<VisitOptions, 'replace'> = {}): void {
    console.warn(
      `Inertia.replace() has been deprecated and will be removed in a future release. Please use Inertia.${
        options.method ?? 'get'
      }() instead.`,
    )

    return this.visit(url, { preserveState: true, ...options, replace: true })
  }

  public clearHistory(): void {
    History.clear()
  }

  protected loadDeferredProps(): void {
    const deferred = currentPage.get().meta?.deferredProps

    if (deferred) {
      Object.entries(deferred).forEach(([_, group]) => {
        this.reload({ only: group })
      })
    }
  }
}
