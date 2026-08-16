import { Component, viewChild, provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { router } from '@inertiajs/core'
import { Form, useFormContext } from './form'

@Component({ selector: 'test-form-child', template: '' })
class FormChild {
  readonly form = useFormContext()
}

@Component({
  imports: [Form, FormChild],
  template: `
    <form inertiaForm method="post" action="/users" #form="inertiaForm">
      <input name="user.name" value="Ada" />
      <button type="submit" name="intent" value="save">Save</button>
      <test-form-child />
    </form>
  `,
})
class FormHost {
  readonly form = viewChild.required<Form>('form')
  readonly child = viewChild.required(FormChild)
}

describe('Form', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormHost],
      providers: [provideZonelessChangeDetection()],
    })
  })

  it('serializes the native form and exposes the same context to descendants', async () => {
    const fixture = TestBed.createComponent(FormHost)
    await fixture.whenStable()

    expect(fixture.componentInstance.form().getData()).toEqual({ user: { name: 'Ada' } })
    expect(fixture.componentInstance.child().form).toBe(fixture.componentInstance.form())
  })

  it('includes the submitter and delegates a post to core', async () => {
    const post = vi.spyOn(router, 'post').mockImplementation(() => undefined)
    const fixture = TestBed.createComponent(FormHost)
    await fixture.whenStable()
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement

    fixture.componentInstance.form().submit(button)

    expect(post.mock.calls[0]?.[0]).toBe('/users')
    expect(post.mock.calls[0]?.[1]).toEqual({ user: { name: 'Ada' }, intent: 'save' })
  })
})
