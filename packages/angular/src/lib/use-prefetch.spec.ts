import { Component, provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { router } from '@inertiajs/core'
import { usePrefetch } from './use-prefetch'

@Component({ template: '' })
class PrefetchHost {
  readonly prefetch = usePrefetch()
}

function firePrefetched(pathname: string): void {
  document.dispatchEvent(
    new CustomEvent('inertia:prefetched', {
      detail: { visit: { url: new URL(pathname, window.location.origin) }, fetchedAt: 1234 },
    }),
  )
}

describe('usePrefetch', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/first')
    TestBed.configureTestingModule({
      imports: [PrefetchHost],
      providers: [provideZonelessChangeDetection()],
    })
  })

  it('follows the pathname the component is currently rendered at', () => {
    const fixture = TestBed.createComponent(PrefetchHost)

    // A preserved page or a persistent layout outlives the visit, so the listener has to
    // track the URL it is rendered at now, not the one it was constructed at.
    window.history.replaceState({}, '', '/second')
    firePrefetched('/second')

    expect(fixture.componentInstance.prefetch.isPrefetched()).toBe(true)
    expect(fixture.componentInstance.prefetch.lastUpdatedAt()).toBe(1234)
  })

  it('ignores prefetch events for another pathname', () => {
    const fixture = TestBed.createComponent(PrefetchHost)

    firePrefetched('/somewhere-else')

    expect(fixture.componentInstance.prefetch.isPrefetched()).toBe(false)
  })

  it('flushes the pathname it is currently rendered at', () => {
    const flush = vi.spyOn(router, 'flush').mockImplementation(() => undefined)
    const fixture = TestBed.createComponent(PrefetchHost)

    window.history.replaceState({}, '', '/second')
    fixture.componentInstance.prefetch.flush()

    expect(flush).toHaveBeenCalledWith('/second', {})
    flush.mockRestore()
  })
})
