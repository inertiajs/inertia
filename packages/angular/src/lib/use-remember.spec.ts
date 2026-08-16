import { Component, provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { router } from '@inertiajs/core'
import { useRemember } from './use-remember'

@Component({ template: '' })
class RememberHost {
  readonly state = useRemember({ name: 'Ada', transient: 'draft' }, 'profile', ['transient'])
}

describe('useRemember', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RememberHost],
      providers: [provideZonelessChangeDetection()],
    })
  })

  it('only remembers the filtered state when it changes', async () => {
    const restore = vi.spyOn(router, 'restore').mockReturnValue({ name: 'Ada' })
    const remember = vi.spyOn(router, 'remember').mockImplementation(() => undefined)
    const fixture = TestBed.createComponent(RememberHost)

    await fixture.whenStable()
    expect(remember).not.toHaveBeenCalled()

    fixture.componentInstance.state.set({ name: 'Grace', transient: 'draft' })
    await fixture.whenStable()

    expect(remember).toHaveBeenCalledOnce()
    expect(remember).toHaveBeenCalledWith({ name: 'Grace' }, 'profile')

    restore.mockRestore()
    remember.mockRestore()
  })
})
