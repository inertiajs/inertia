import { Component, provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { router, type VisitOptions } from '@inertiajs/core'
import { useForm } from './use-form'

@Component({ template: '' })
class UseFormHost {
  readonly form = useForm({ name: 'Ada', profile: { city: 'London' } })
}

@Component({ template: '' })
class RememberedFormHost {
  readonly form = useForm('credentials', { username: '', password: '' }).dontRemember('password')
}

describe('useForm', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [UseFormHost, RememberedFormHost],
      providers: [provideZonelessChangeDetection()],
    })
  })

  it('tracks nested changes, defaults, resets, and errors with signals', () => {
    const fixture = TestBed.createComponent(UseFormHost)
    const form = fixture.componentInstance.form

    form.setData('profile.city', 'Paris')
    expect(form.data().profile.city).toBe('Paris')
    expect(form.isDirty()).toBe(true)

    form.setDefaults('profile.city', 'Paris')
    expect(form.isDirty()).toBe(false)
    form.setData('profile.city', 'Madrid')
    form.setError('profile.city', 'Invalid city')
    form.resetAndClearErrors('profile.city')

    expect(form.data().profile.city).toBe('Paris')
    expect(form.errors()).toEqual({})
  })

  it('only remembers state that actually changed', async () => {
    const stored = { data: { username: '' }, errors: {} }
    const restore = vi.spyOn(router, 'restore').mockImplementation(() => stored)
    const remember = vi.spyOn(router, 'remember').mockImplementation(() => undefined)

    const fixture = TestBed.createComponent(RememberedFormHost)
    await fixture.whenStable()

    // Every write rewrites history.state, so an unchanged value must not produce one.
    expect(remember).not.toHaveBeenCalled()

    fixture.componentInstance.form.setData('username', 'ada')
    await fixture.whenStable()
    expect(remember).toHaveBeenCalledTimes(1)

    restore.mockRestore()
    remember.mockRestore()
  })

  it('delegates submissions to core and updates lifecycle state', async () => {
    const post = vi.spyOn(router, 'post').mockImplementation(() => undefined)
    const fixture = TestBed.createComponent(UseFormHost)
    const form = fixture.componentInstance.form

    form.post('/users')
    const options = post.mock.calls[0]?.[2] as VisitOptions
    options.onStart?.({} as Parameters<NonNullable<VisitOptions['onStart']>>[0])
    expect(form.processing()).toBe(true)

    await options.onSuccess?.({ props: { errors: {} } } as Parameters<NonNullable<VisitOptions['onSuccess']>>[0])
    options.onFinish?.({} as Parameters<NonNullable<VisitOptions['onFinish']>>[0])

    expect(post).toHaveBeenCalledWith('/users', { name: 'Ada', profile: { city: 'London' } }, options)
    expect(form.processing()).toBe(false)
    expect(form.wasSuccessful()).toBe(true)
    expect(form.isDirty()).toBe(false)
  })

  it('fills excluded fields from initial defaults when restoring partial remembered data', () => {
    vi.spyOn(router, 'restore').mockReturnValue({ data: { username: 'Ada' }, errors: {} })
    const fixture = TestBed.createComponent(RememberedFormHost)

    expect(fixture.componentInstance.form.data()).toEqual({ username: 'Ada', password: '' })
  })
})
