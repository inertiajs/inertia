import { Component, input, signal } from '@angular/core'
import { Link, router, type ResolvedComponent } from '@inertiajs/angular'

@Component({
  selector: 'test-history-page',
  imports: [Link],
  template: `
    @for (number of numbers; track number) {
      <a inertiaLink [href]="'/history/' + number">Page {{ number }}</a>
    }
    <button type="button" (click)="router.clearHistory()">Clear History</button>
    <div>This is page {{ pageNumber() }}.</div>
    <div>Multi byte character: {{ multiByte() }}</div>
    <div style="height: 5000px"></div>
  `,
})
class HistoryPage {
  readonly pageNumber = input('')
  readonly multiByte = input('')
  readonly numbers = [1, 2, 3, 4, 5]
  readonly router = router
}

@Component({
  selector: 'test-history-version',
  imports: [Link],
  template: '<a inertiaLink href="/history/version/1">Page 1</a><a inertiaLink href="/history/version/2">Page 2</a>',
})
class HistoryVersion {}

@Component({
  selector: 'test-history-throttle',
  imports: [Link],
  template:
    '<h1>History Throttle Test</h1><p id="call-count">State updates: {{ callCount() }}</p><button id="trigger" type="button" (click)="trigger()">Trigger Rapid State Updates</button><a inertiaLink id="home-link" href="/">Go Home</a>',
})
class HistoryThrottle {
  readonly callCount = signal(0)
  trigger(): void {
    for (let index = 0; index < 120; index++) {
      this.callCount.set(index + 1)
      router.remember({ value: index }, `key-${index}`)
    }
  }
}

@Component({
  selector: 'test-history-quota',
  imports: [Link],
  template: `
    <h1>History Quota Test - Page {{ pageNumber() }}</h1>
    <p>Data size: {{ formattedSize() }} bytes</p>
    <div style="margin-top: 20px">
      @for (number of numbers; track number) {
        <a inertiaLink [href]="'/history-quota/' + number" style="margin-right: 10px">Page {{ number }}</a>
      }
    </div>
    <div style="height: 5000px"></div>
  `,
})
class HistoryQuota {
  readonly pageNumber = input.required<number>()
  readonly largeData = input('')
  readonly numbers = Array.from({ length: 20 }, (_, index) => index + 1)
  formattedSize(): string {
    return this.largeData().length.toLocaleString()
  }
}

export const historyPages: Record<string, ResolvedComponent> = {
  'History/Page': HistoryPage,
  'History/Version': HistoryVersion,
  HistoryThrottle,
  'HistoryQuota/Page': HistoryQuota,
}
