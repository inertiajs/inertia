import { Component, provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { Head } from './head'
import { InertiaRuntime } from './runtime'

@Component({
  imports: [Head],
  template: `
    <ng-template inertiaHead title="Users & <friends>">
      <meta head-key="description" name="description" content="People" />
    </ng-template>
  `,
})
class HeadHost {}

describe('Head', () => {
  it('serializes keyed elements and escapes a generated title', async () => {
    const updates: string[][] = []
    const provider = { update: (elements: string[]) => updates.push(elements), reconnect: vi.fn(), disconnect: vi.fn() }
    TestBed.configureTestingModule({
      imports: [HeadHost],
      providers: [
        provideZonelessChangeDetection(),
        { provide: InertiaRuntime, useValue: { headManager: { createProvider: () => provider } } },
      ],
    })

    const fixture = TestBed.createComponent(HeadHost)
    await fixture.whenStable()
    const latest = updates.at(-1) ?? []

    expect(latest).toContain('<meta name="description" content="People" data-inertia="description">')
    expect(latest).toContain('<title data-inertia="">Users &amp; &lt;friends&gt;</title>')
    fixture.destroy()
    expect(provider.disconnect).toHaveBeenCalledOnce()
  })
})
