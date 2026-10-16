import { history } from '../history'
import { interceptors } from '../interceptors'
import {
  closeLayer,
  entriesToUnwind,
  isBlankBase,
  layerAt,
  layersOf,
  markClosing,
  withTier,
  withoutClosingMarks,
} from '../layers'
import { page as currentPage } from '../page'
import { LayerState, Page, Tier } from '../types'
import { registryClose } from './handles'

const layerDismissedByRestore = (page: Page, restored: Page): LayerState | undefined => {
  const open = layersOf(page)
  const top = open.at(-1)
  const beneath = layersOf(restored)

  if (!top || top.entries !== 1 || beneath.length !== open.length - 1) {
    return undefined
  }

  const stands = (tier: Tier, was: Tier) => tier.component === was.component && tier.url === was.url

  return stands(restored, page) &&
    beneath.every((layer, index) => layer.id === open[index].id && stands(layer, open[index]))
    ? top
    : undefined
}

const standsOnSameStack = (page: Page, restored: Page): boolean =>
  page.component === restored.component &&
  layersOf(page).length === layersOf(restored).length &&
  layersOf(page).every((layer, index) => layer.id === layersOf(restored)[index].id)

const restoreKeepsBase = (page: Page, restored: Page): boolean =>
  layersOf(restored).length > 0 && restored.component === page.component && restored.url === page.url

const unwindTimeout = 1000

type Deferred = { settled: Promise<void>; settle: () => void }

const deferred = (): Deferred => {
  let settle!: () => void

  return { settled: new Promise<void>((resolve) => (settle = resolve)), settle }
}

type Refresh = (address: string, layerId?: string) => Promise<void>

interface CloseOptions {
  refresh?: Refresh
  dismissed?: boolean
}

interface Restoring {
  landsItself: boolean
  sameStack: boolean
  install: () => Promise<void>
}

const absorbLayersAbove = (page: Page, id: string): Page => {
  const entries = entriesToUnwind(page, id)
  const closed = closeLayer(page, id)
  const beneath = layersOf(closed).at(-1)

  return beneath ? withTier(closed, beneath.id, { entries: beneath.entries + entries }) : closed
}

// Marked on the page, the shell reports its exit, then it leaves the stack by stepping back over its entries.
class LayerClosing {
  protected reported = new Set<string>()
  protected options: CloseOptions | undefined
  protected unwinding: { landsItself: boolean; settled: Promise<unknown>; answered: () => void } | null = null
  protected closing: Deferred | null = null
  protected removing: string[] = []
  protected observing: (() => void) | undefined

  constructor() {
    interceptors.onLayerEvent((event) => {
      if (event.type === 'closed' && !this.removing.includes(event.layer.id)) {
        registryClose(event.layer.id)
      }
    })
  }

  public close(id: string, { refresh }: { refresh?: Refresh } = {}): Promise<void> {
    return this.mark(id, { refresh })
  }

  public dismiss(id: string): Promise<void> {
    return this.mark(id, { dismissed: true })
  }

  protected mark(id: string, options: CloseOptions): Promise<void> {
    if (this.unwinding) {
      // Asked for inside the window: marks once the browser has answered the step back.
      return this.unwinding.settled.then(() => this.mark(id, options))
    }

    const page = currentPage.get()

    if (!layerAt(page, id)) {
      return Promise.resolve()
    }

    if (this.isClosing(id)) {
      return this.closing?.settled ?? Promise.resolve()
    }

    currentPage.merge(markClosing(page, id))
    this.options = options
    this.observing ??= currentPage.on('commit', () => this.abandonedIfUnmarked())

    const closing = (this.closing ??= deferred())

    return currentPage.rerender().then(() => closing.settled)
  }

  public closed(id: string): Promise<void> {
    if (!this.isClosing(id)) {
      return Promise.resolve()
    }

    this.reported.add(id)

    const marked = this.marked()

    if (!marked.every((layer) => this.reported.has(layer))) {
      return Promise.resolve()
    }

    const options = this.options ?? {}
    const closing = this.closing
    this.reported.clear()
    this.options = undefined
    // Handed to the removal, so a close marked while this one refreshes waits on one of its own.
    this.closing = null
    currentPage.merge(withoutClosingMarks(currentPage.get()))

    return this.remove(marked, options, closing).finally(() => closing?.settle())
  }

  protected remove(closed: string[], options: CloseOptions, closing: Deferred | null): Promise<void> {
    const layer = layerAt(currentPage.get(), closed[0])

    if (!layer) {
      return Promise.resolve()
    }

    if (options.dismissed) {
      this.absorb(closed)

      return Promise.resolve()
    }

    this.removing = closed

    const entries = entriesToUnwind(currentPage.get(), layer.id)
    const writesTheEntry = layer.standalone || entries === 0

    const land = () =>
      currentPage.set(closeLayer(currentPage.get(), layer.id), {
        replace: entries === 0 && !layer.standalone,
        preserveScroll: true,
        preserveState: true,
        preservesBase: true,
      })

    return this.takeOffTheStack(layer.id, land, entries, writesTheEntry).then(() =>
      this.afterRemoval(closed, options.refresh, writesTheEntry, closing),
    )
  }

  protected absorb(closed: string[]): void {
    currentPage.merge(absorbLayersAbove(currentPage.get(), closed[0]))
    this.forget(closed)
  }

  protected forget(closed: string[]): void {
    closed.forEach(registryClose)
  }

  protected takeOffTheStack(
    id: string,
    land: () => Promise<void>,
    entries: number,
    writesTheEntry: boolean,
  ): Promise<void> {
    if (entries === 0) {
      return land()
    }

    return this.stepBack(entries, writesTheEntry).then(async (answer) => {
      if (answer === 'refused' || (writesTheEntry && layerAt(currentPage.get(), id))) {
        await land()
      }
    })
  }

  protected async afterRemoval(
    closed: string[],
    refresh: Refresh | undefined,
    writesTheEntry: boolean,
    closing: Deferred | null,
  ): Promise<void> {
    closing?.settle()

    const landedOn = layersOf(currentPage.get()).at(-1)
    const refreshed = landedOn?.url ? landedOn : undefined
    const recovering = refreshed === undefined && isBlankBase(currentPage.get())

    if (refresh && !recovering) {
      await refresh(refreshed?.url ?? currentPage.get().url, refreshed?.id)
    }

    if (writesTheEntry) {
      history.replaceState(currentPage.getWithoutFlashData())
    }

    this.removing = []
    this.forget(closed)
  }

  // Refused rather than answered past the start of the session, so the close lands the page itself.
  protected stepBack(entries: number, landsItself: boolean): Promise<'answered' | 'refused'> {
    let resolve!: (answer: 'answered' | 'refused') => void
    const answer = new Promise<'answered' | 'refused'>((settle) => (resolve = settle))
    const refused = setTimeout(() => {
      this.unwinding = null
      resolve('refused')
    }, unwindTimeout)

    this.unwinding = {
      landsItself,
      settled: answer,
      answered: () => {
        clearTimeout(refused)
        resolve('answered')
      },
    }

    history.back(entries, answer)

    return answer
  }

  public restoring(entry: Page): Restoring {
    const page = currentPage.get()
    const landsItself = this.unwinding?.landsItself ?? false
    const beneath = this.removing[0] ? closeLayer(page, this.removing[0]) : page
    const sameStack = this.unwinding !== null && standsOnSameStack(beneath, entry)
    const dismissed = this.unwinding ? undefined : layerDismissedByRestore(page, entry)
    const keepsPage = sameStack || dismissed !== undefined || restoreKeepsBase(page, entry)

    return {
      landsItself,
      sameStack,
      install: async () => {
        if (dismissed && !this.isClosing(dismissed.id)) {
          await this.dismiss(dismissed.id)
        }

        await currentPage.setQuietly(entry, { preserveState: keepsPage })
      },
    }
  }

  public unwound(): void {
    this.unwinding?.answered()
    this.unwinding = null
  }

  protected isClosing(id: string): boolean {
    return layerAt(currentPage.get(), id)?.closing === true
  }

  protected marked(): string[] {
    return layersOf(currentPage.get())
      .filter((layer) => layer.closing)
      .map((layer) => layer.id)
  }

  protected abandonedIfUnmarked(): void {
    if (!this.closing || this.marked().length > 0) {
      return
    }

    this.reported.clear()
    this.options = undefined
    this.closing.settle()
    this.closing = null
  }
}

export const layerClosing = new LayerClosing()
