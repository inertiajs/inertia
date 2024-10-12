import { fireNavigateEvent } from './events'
import { history } from './history'
import { Scroll } from './scroll'
import {
  Frame,
  Component,
  Page,
  PageEvent,
  FrameHandler,
  PageResolver,
  PreserveStateOption,
  RouterInitParams,
  VisitOptions,
} from './types'
import { hrefToUrl, isSameUrlWithoutHash } from './url'

class CurrentPage {
  protected page!: Page
  protected resolvers!: {
    [frame: string]: PageResolver,
  }
  protected swappers!: {
    [frame: string]: FrameHandler,
  }
  protected componentId = {}
  protected listeners: {
    event: PageEvent
    callback: VoidFunction
  }[] = []
  protected isFirstPageLoad = true
  protected cleared = false

  public init({ frame, initialFrame, swapComponent, resolveComponent }: RouterInitParams) {
    this.page.frames[frame] = initialFrame
    this.swappers[frame] = swapComponent
    this.resolvers[frame] = resolveComponent
  
    return this
  }

  public async set(
    page: Page,
    {
      replace = false,
      preserveScroll = false,
      preserveState = false,
    }: Partial<Pick<VisitOptions, 'replace' | 'preserveScroll' | 'preserveState'>> = {},
  ): Promise<void> {
    this.componentId = {}

    const componentId = this.componentId

    if (page.clearHistory) {
      history.clear()
    }

    return this.resolve(page.frames).then((components) => {
      if (componentId !== this.componentId) {
        // Component has changed since we started resolving this component, bail
        return
      }

      page.scrollRegions ??= []
      //page.rememberedState ??= {}
      
      // If we changed the _top frame, update the URL
      if (page.frames['_top']?.url === undefined) {
        const location = typeof window !== 'undefined' ? window.location : new URL(page.frames['_top'].url)
        replace = replace || isSameUrlWithoutHash(hrefToUrl(page.frames['_top']?.url), location)
      }

      replace ? history.replaceState(page) : history.pushState(page)

      // const isNewComponent = !this.isTheSame(page)

      this.page = page
      this.cleared = false

      // if (isNewComponent) {
        // this.fireEventsFor('newComponent')
      // }

      if (this.isFirstPageLoad) {
        this.fireEventsFor('firstLoad')
      }

      this.isFirstPageLoad = false

      return this.swap({ components, page, preserveState }).then(() => {
        if (!preserveScroll) {
          Scroll.reset(page)
        }

        if (!replace) {
          fireNavigateEvent(page)
        }
      })
    })
  }

  public async setQuietly(
    page: Page,
    {
      preserveState = false,
    }: {
      preserveState?: PreserveStateOption
    } = {},
  ) {
    return this.resolve(page.frames).then((components) => {
      this.page = page
      this.cleared = false
      return this.swap({ components, page, preserveState })
    })
  }

  public async setFrame(
    name: string,
    frame: Frame,
    options: Partial<VisitOptions> = {}
  ): Promise<void> {
    return this.set({
      ...this.page,
      frames: {
        ...this.page.frames,
        [name]: frame,
      }
    }, options)
  }
    
  
  public clear(): void {
    this.cleared = true
  }

  public isCleared(): boolean {
    return this.cleared
  }
  
  public frame(name: string): Frame {
    return this.page.frames[name]
  }
  
  public get(): Page {
    return this.page
  }

  public merge(data: Partial<Page>): void {
    this.page = { 
      ...this.page,
      ...data,
      frames: {
        ...this.page.frames,
        ...data.frames,
      },
    }
  }

  public setUrlHash(hash: string): void {
    this.page.frames["_top"].url += hash
  }

  public remember(frame: string, data: Frame['rememberedState']): void {
    this.page.frames[frame].rememberedState = data
  }

  public scrollRegions(regions: Page['scrollRegions']): void {
    this.page.scrollRegions = regions
  }

  public swap({
    components,
    page,
    preserveState,
  }: {
    components: { [name: string]: Component }
    page: Page,
    preserveState: PreserveStateOption
  }): Promise<unknown> {
    return Promise.all(Object.entries(components).map(([name, component]) => {
      return this.swappers[name]({ component, frame: page.frames[name], preserveState })
    }))
  }

  public async resolve(frames: { [name: string]: Frame }): Promise<{ [name: string]: Component }> {
    const result: { [name: string]: Component } = {}
    await Promise.all(Object.keys(frames).map(async (name) => {
      const frame = frames[name]
      result[name] = await this.resolvers[name](frame.component)
    }))
    return result
  }

  public isTheSame(name: string, frame: Frame): boolean {
    return this.page.frames[name].component === frame.component
  }

  public on(event: PageEvent, callback: VoidFunction): VoidFunction {
    this.listeners.push({ event, callback })

    return () => {
      this.listeners = this.listeners.filter((listener) => listener.event !== event && listener.callback !== callback)
    }
  }

  public fireEventsFor(event: PageEvent): void {
    this.listeners.filter((listener) => listener.event === event).forEach((listener) => listener.callback())
  }
}

export const page = new CurrentPage()
