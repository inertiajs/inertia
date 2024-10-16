import { eventHandler } from './eventHandler'
import { fireNavigateEvent } from './events'
import { history } from './history'
import { Scroll } from './scroll'
import { Router } from './router'
import {
  Frame,
  Component,
  Page,
  PageEvent,
  FrameHandler,
  PreserveStateOption,
  RouterInitParams,
  VisitOptions,
} from './types'
import { hrefToUrl, isSameUrlWithoutHash } from './url'
import deepmerge from 'deepmerge'

class CurrentPage {
  protected page: Page = {
    frames: {},
    version: null,
    scrollRegions: []
  }
  
  protected swappers: {
    [frame: string]: FrameHandler,
  } = {}
  protected componentId = {}
  protected listeners: {
    event: PageEvent
    callback: VoidFunction
  }[] = []
  protected isFirstPageLoad = true
  protected cleared = false

  public initFrame({ frame, initialState, swapComponent }: RouterInitParams) {  
    this.page.version ||= initialState?.version
    const historyFrame = this.page.frames?.[frame]
    // if (initialState?.component) {
      this.merge({
        frames: {
          [frame]: initialState,
          ...this.page.frames
        }
      })
    // }
    
    this.swappers[frame] = swapComponent
  
    return historyFrame
  }

  public async set(
    page: Page,
    {
      replace,
      useHistory,
      preserveScroll = false,
      preserveState = false,
      frame
    }: Partial<VisitOptions> = {},
  ): Promise<void> {
    this.componentId = {}

    const componentId = this.componentId


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
      
      if (useHistory) {
        replace ? history.replaceState(page) : history.pushState(page)
      }

      // const isNewComponent = !this.isTheSame(page)

      this.page = page
      this.cleared = false

      // if (isNewComponent) {
      //   this.fireEventsFor('newComponent')
      // }

      if (this.isFirstPageLoad) {
        this.fireEventsFor('firstLoad')
      }

      this.isFirstPageLoad = false

      return this.swap({ components, page, preserveState, frame }).then(() => {
        // TODO: save scroll positions within frames.
        if (!preserveScroll && frame == '_top') {
          Scroll.reset(page)
        }
        
        eventHandler.fireInternalEvent('loadDeferredProps')

        if (!replace) {
          fireNavigateEvent(page)
        }
      })
        
    })
  }
  
  public destroy(frame: string) {
    delete this.page.frames[frame]
    history.replaceState(this.page)
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
    return this.set(deepmerge(this.page, {
      frames: {
        [name]: frame,
      }
    }, { arrayMerge: (_, s) => s }) as Page,
    { frame: name, ...options })
  }
    
  
  public clear(): void {
    this.cleared = true
  }

  public isCleared(): boolean {
    return this.cleared
  }
  
  public frame(name: string): Frame {
    return this.page.frames[name] || {}
  }
  
  public get(): Page {
    return this.page
  }

  public merge(data: Partial<Page>): void {
    this.page = deepmerge(this.page, data, {arrayMerge: (_, source) => source})
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
    frame
  }: {
    components: { [name: string]: Component }
    page: Page,
    preserveState: PreserveStateOption,
    frame?: string
  }): Promise<unknown> {

    return Promise.all(Object.entries(components).map(([name, component]) => {
      if (frame && frame !== name) return Promise.resolve()
      
      // a swapper can be undefined if we refresh the page, and have history in frames
      // that we havent initialized in the new page
      if (!this.swappers[name]) return;
      
      return this.swappers[name]({ component, frame: page.frames[name], preserveState })
    }))
  }

  public async resolve(frames: { [name: string]: Frame }): Promise<{ [name: string]: Component }> {
    const result: { [name: string]: Component } = {}
    await Promise.all(Object.keys(frames).map(async (name) => {
      const frame = frames[name]
      result[name] = await Router.resolveComponent(frame.component)
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
