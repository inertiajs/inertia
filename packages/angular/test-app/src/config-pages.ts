import { Component } from '@angular/core'
import { Link, config, useForm, usePage, type ResolvedComponent } from '@inertiajs/angular'
import type { VisitOptions } from '@inertiajs/core'

@Component({
  selector: 'test-custom-config',
  imports: [Link],
  template: `
    <a inertiaLink [prefetch]="true" href="/dump/get">Prefetch Link</a>
    <button inertiaLink method="post" [headers]="{ 'X-From-Link': 'foo' }" href="/dump/post">Post Dump</button>
    <button type="button" (click)="submit()">Submit Form</button>
    @if (form.recentlySuccessful()) {
      <p>Form was recently successful!</p>
    }
  `,
})
class CustomConfig {
  readonly page = usePage()
  readonly form = useForm({})

  constructor() {
    config.set({
      'form.recentlySuccessfulDuration': 1000,
      'prefetch.cacheFor': '2s',
    })
    config.set('visitOptions', (href: string, options: VisitOptions) =>
      href === '/dump/post' ? { headers: { ...options.headers, 'X-From-Callback': 'bar' } } : {},
    )
  }

  submit(): void {
    this.form.post(this.page().url)
  }
}

export const configPages: Record<string, ResolvedComponent> = {
  CustomConfig,
}
