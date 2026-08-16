import { Component, ElementRef, afterNextRender, signal, viewChild } from '@angular/core'
import { getScrollableParent } from '@inertiajs/core'

type Scenario = {
  key: string
  parentId?: string
  parentStyle: Partial<CSSStyleDeclaration>
  childStyle?: Partial<CSSStyleDeclaration>
  wrapperContents?: boolean
}

const scenarios: Scenario[] = [
  { key: 'overflow-x-hidden', parentStyle: { overflowX: 'hidden' } },
  { key: 'overflow-y-auto-no-height', parentStyle: { overflowY: 'auto' } },
  { key: 'overflow-auto-no-constraints', parentStyle: { overflow: 'auto' } },
  { key: 'overflow-clip', parentStyle: { overflow: 'clip', height: '100px' }, childStyle: { height: '300px' } },
  { key: 'overflow-y-auto-overflow-x-hidden', parentStyle: { overflowY: 'auto', overflowX: 'hidden' } },
  { key: 'overflow-x-auto-overflow-y-hidden', parentStyle: { overflowX: 'auto', overflowY: 'hidden' } },
  {
    key: 'overflow-x-scroll',
    parentId: 'scroll-container-x',
    parentStyle: { overflowX: 'scroll', width: '300px' },
    childStyle: { width: '600px' },
  },
  {
    key: 'overflow-y-auto',
    parentId: 'scroll-container-y',
    parentStyle: { overflowY: 'auto', height: '100px' },
    childStyle: { height: '300px' },
  },
  {
    key: 'overflow-x-scroll-y-hidden',
    parentId: 'scroll-container-x-y-hidden',
    parentStyle: { overflowX: 'scroll', overflowY: 'hidden', width: '300px' },
    childStyle: { width: '600px' },
  },
  {
    key: 'horizontal-scroll-calc',
    parentId: 'scroll-container-max-width',
    parentStyle: { overflowX: 'scroll', maxWidth: '300px' },
    childStyle: { width: '600px' },
  },
  {
    key: 'vertical-scroll-max-height',
    parentId: 'scroll-container-max-height',
    parentStyle: { overflowY: 'auto', maxHeight: '100px' },
    childStyle: { height: '300px' },
  },
  {
    key: 'nested-scroll',
    parentId: 'inner-scroll',
    parentStyle: { overflowY: 'auto', height: '100px' },
    childStyle: { height: '300px' },
  },
  {
    key: 'flex-horizontal-carousel',
    parentId: 'flex-carousel',
    parentStyle: { overflowX: 'scroll', display: 'flex', width: '300px' },
    childStyle: { minWidth: '600px' },
  },
  {
    key: 'coerced-auto-no-constraint',
    parentId: 'coerced-auto',
    parentStyle: { overflowX: 'scroll', display: 'flex', width: '300px' },
    childStyle: { minWidth: '600px' },
  },
  {
    key: 'display-contents',
    parentId: 'scroll-container-skip-contents',
    parentStyle: { overflowY: 'auto', height: '100px' },
    childStyle: { height: '300px' },
    wrapperContents: true,
  },
  {
    key: 'overflow-overlay',
    parentId: 'scroll-container-overlay',
    parentStyle: { overflow: 'overlay', height: '100px' },
    childStyle: { height: '300px' },
  },
  {
    key: 'inline-width-style',
    parentId: 'inline-width-container',
    parentStyle: { overflowX: 'auto', width: '300px' },
    childStyle: { width: '600px' },
  },
  {
    key: 'both-scroll-directions',
    parentId: 'both-scroll',
    parentStyle: { overflow: 'scroll', width: '300px', height: '100px' },
    childStyle: { width: '600px', height: '300px' },
  },
  {
    key: 'overflow-y-auto-overflow-x-visible',
    parentId: 'overflow-y-auto-x-visible',
    parentStyle: { overflowY: 'auto', overflowX: 'visible', height: '100px' },
    childStyle: { height: '300px' },
  },
  {
    key: 'overflow-y-auto-overflow-x-clip',
    parentId: 'overflow-y-auto-x-clip',
    parentStyle: { overflowY: 'auto', overflowX: 'clip', height: '100px' },
    childStyle: { height: '300px' },
  },
  {
    key: 'overflow-x-auto-overflow-y-visible',
    parentId: 'overflow-x-auto-y-visible',
    parentStyle: { overflowX: 'auto', overflowY: 'visible', width: '300px' },
    childStyle: { width: '600px' },
  },
  {
    key: 'overflow-x-auto-overflow-y-clip',
    parentId: 'overflow-x-auto-y-clip',
    parentStyle: { overflowX: 'auto', overflowY: 'clip', width: '300px' },
    childStyle: { width: '600px' },
  },
]

@Component({
  selector: 'test-scrollable-parent',
  template: `
    <h1>ScrollableParent Tests</h1>
    <div #fixtures style="position: absolute; left: -10000px; top: 0"></div>
    @for (scenario of scenarios; track scenario.key) {
      <p [attr.data-testid]="'result-' + scenario.key">{{ results()[scenario.key] ?? 'null' }}</p>
    }
  `,
})
export class ScrollableParentPage {
  readonly fixtures = viewChild.required<ElementRef<HTMLElement>>('fixtures')
  readonly results = signal<Record<string, string | undefined>>({})
  readonly scenarios = scenarios

  constructor() {
    afterNextRender(() => this.#measure())
  }

  #measure(): void {
    const root = this.fixtures().nativeElement
    const results: Record<string, string> = {}
    for (const scenario of scenarios) {
      const parent = document.createElement('div')
      if (scenario.parentId) parent.dataset['testid'] = scenario.parentId
      Object.assign(parent.style, scenario.parentStyle)
      const child = document.createElement('div')
      Object.assign(child.style, scenario.childStyle)
      child.textContent = 'Content'
      if (scenario.wrapperContents) {
        const wrapper = document.createElement('div')
        wrapper.style.display = 'contents'
        wrapper.append(child)
        parent.append(wrapper)
      } else {
        parent.append(child)
      }
      root.append(parent)
      const scrollable = getScrollableParent(child)
      results[scenario.key] = scrollable?.dataset['testid'] ?? 'null'
    }
    this.results.set(results)
  }
}
