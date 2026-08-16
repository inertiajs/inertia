import { Component, input, signal } from '@angular/core'
import { Head, Link, router, usePage, type ResolvedComponent } from '@inertiajs/angular'

@Component({
  selector: 'test-head',
  imports: [Head],
  template: `
    <ng-template inertiaHead title="Test Head Component">
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="description" content='This is an "escape" example' />
      <meta name="undefined" content="undefined" />
      <meta name="number" content="0" />
      <meta name="boolean" content="true" />
      <meta name="false" content="false" />
      <meta name="null" content="null" />
      <meta name="float" content="3.14" />
      <meta name="xss" content="<script>alert('xss')</script>" />
      <meta name="ampersand" content="Laravel & Inertia" />
      <meta name="unicode" content="Hélló! 🎉" />
    </ng-template>
    <h1 style="font-size: 40px">Head Component</h1>
  `,
})
class HeadPage {}

@Component({
  selector: 'test-head-dataset',
  imports: [Head],
  template:
    '<ng-template inertiaHead title="Test Head Component"><meta name="viewport" content="width=device-width, initial-scale=1" /></ng-template><h1 style="font-size:40px">Head Component</h1>',
})
class HeadDataset {}

@Component({
  selector: 'test-head-reactive',
  imports: [Head],
  template: `
    <ng-template inertiaHead [title]="title()">
      <meta name="description" [attr.content]="description()" head-key="description" />
      <meta name="author" content="Test Author" />
    </ng-template>
    <h1>Dynamic Head Updates</h1>
    <button id="update-meta" type="button" (click)="update()">Update Meta</button>
  `,
})
class HeadReactive {
  readonly titleSuffix = input<string>()
  readonly title = signal('Initial Title')
  readonly description = signal('Initial description')

  update(): void {
    this.title.set('Updated Title')
    this.description.set('Updated description')
  }
}

@Component({
  selector: 'test-head-mixed',
  imports: [Head, Link],
  template: `
    <ng-template inertiaHead title="Multiple Elements Test">
      <meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="description" content="Testing multiple head elements" /><meta
        name="keywords"
        content="test, vue, inertia"
      />
      <meta property="og:title" content="Open Graph Title" /><meta
        property="og:description"
        content="Open Graph Description"
      />
      <link rel="icon" href="/favicon.ico" /><link rel="stylesheet" href="/custom.css" />
      <link rel="canonical" href="https://example.com/page" />
    </ng-template>
    <h1>Multiple Head Elements</h1>
    <a inertiaLink id="navigate-away" href="/">Go Home</a
    ><a inertiaLink id="navigate-back" href="/head/mixed">Back to Mixed</a>
  `,
})
class HeadMixed {}

@Component({
  selector: 'test-head-conditional',
  imports: [Head],
  template: `
    <ng-template inertiaHead title="Conditional Rendering">
      @if (showDescription()) {
        <meta name="description" content="This description is conditionally rendered" head-key="description" />
      }
      @if (showKeywords()) {
        <meta name="keywords" content="vue, test, conditional" head-key="keywords" />
      }
      <meta name="always-present" content="This is always here" />
    </ng-template>
    <h1>Conditional Head Rendering</h1>
    <button id="toggle-description" type="button" (click)="showDescription.update((value) => !value)">
      Toggle Description
    </button>
    <button id="toggle-keywords" type="button" (click)="showKeywords.update((value) => !value)">Toggle Keywords</button>
  `,
})
class HeadConditional {
  readonly showDescription = signal(true)
  readonly showKeywords = signal(false)
}

@Component({
  selector: 'test-head-title-callback',
  imports: [Head, Link],
  template: `
    <ng-template inertiaHead title="Callback Page" />
    <h1>Title Callback Page</h1>
    <a inertiaLink href="/head/reactive">Go to reactive</a>
    <button type="button" (click)="router.replaceProp('titleSuffix', 'replaced')">Replace prop</button>
    <p>Current suffix: {{ titleSuffix() ?? 'none' }}</p>
  `,
})
class HeadTitleCallback {
  readonly titleSuffix = input<string>()
  readonly router = router
}

@Component({
  selector: 'test-head-without-title',
  imports: [Head],
  template:
    '<ng-template inertiaHead><meta name="test" content="no title provided" /></ng-template><h1>Head without Title Prop</h1>',
})
class HeadWithoutTitle {}

@Component({
  selector: 'test-head-with-title',
  imports: [Head],
  template:
    '<ng-template inertiaHead><title>Title from Children</title><meta name="description" content="Title set via children, not prop" /></ng-template><h1>Title in Children</h1>',
})
class HeadWithTitle {}

@Component({
  selector: 'test-server-head-page',
  imports: [Head, Link],
  template: `
    @if (override()) { <ng-template inertiaHead><meta head-key="description" name="description" content="Page override" /></ng-template> }
    <h1>Server Head</h1><p id="foo">{{ foo() }}</p>
    <button type="button" (click)="router.reload({ only: ['foo'] })">Reload foo</button>
    <button type="button" (click)="replaceHead()">Replace head client-side</button>
    <a inertiaLink [href]="next()">Next server head page</a>
  `,
})
class ServerHeadPage {
  readonly foo = input('')
  readonly next = input('/')
  readonly page = usePage()
  readonly router = router

  override(): boolean {
    return this.page().url.includes('override')
  }

  replaceHead(): void {
    router.replaceProp('head', [
      '<title data-inertia="title">Replaced Head</title>',
      '<meta data-inertia="description" name="description" content="Replaced description">',
    ])
  }
}

export const headPages: Record<string, ResolvedComponent> = {
  Head: HeadPage,
  'Head/Dataset': HeadDataset,
  'Head/Reactive': HeadReactive,
  'Head/Mixed': HeadMixed,
  'Head/Conditional': HeadConditional,
  'Head/TitleCallback': HeadTitleCallback,
  'Head/WithoutTitle': HeadWithoutTitle,
  'Head/WithTitle': HeadWithTitle,
  ServerHead: ServerHeadPage,
}
