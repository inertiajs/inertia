---
name: inertia-svelte-development
description: "Develops Inertia.js v3 Svelte 5 client-side applications. Activates when creating Svelte pages, forms, or navigation; using Link, Form, useForm, useHttp, setLayoutProps, or router; working with deferred props, prefetching, optimistic updates, instant visits, or polling; or when user mentions Svelte with Inertia, Svelte pages, Svelte forms, or Svelte navigation."
license: MIT
metadata:
  author: laravel
---
@php
/** @var \Laravel\Boost\Install\GuidelineAssist $assist */
@endphp
# Inertia Svelte Development

## When to Apply

Activate this skill when:

- Creating or modifying Svelte page components for Inertia
- Working with forms in Svelte (using `<Form>`, `useForm`, or `useHttp`)
- Implementing client-side navigation with `<Link>` or `router`
- Using v3 features: deferred props, prefetching, optimistic updates, instant visits, layout props, HTTP requests, WhenVisible, InfiniteScroll, once props, flash data, or polling
- Building Svelte-specific features with the Inertia protocol

## Important: Svelte 5 Required

Inertia v3 requires Svelte 5. All code must use Svelte 5 runes syntax:

- Use `let { prop } = $props()` (not `export let prop`)
- Use `onclick` (not `on:click`)
- Use `$derived()` for reactive values (not `$:`)
- Use `{#snippet}` for named slots (not `slot="name"`)
- Use `{@render children()}` for default slot content

## Documentation

Use `search-docs` for detailed Inertia v3 Svelte patterns and documentation.

## Basic Usage

### Page Components Location

Svelte page components should be placed in the `{{ $assist->inertia()->pagesDirectory() }}` directory.

### Page Component Structure

@boostsnippet("Basic Svelte Page Component", "svelte")
<script>
let { users } = $props()
</script>

<div>
    <h1>Users</h1>
    <ul>
        {#each users as user (user.id)}
            <li>{user.name}</li>
        {/each}
    </ul>
</div>
@endboostsnippet

## Client-Side Navigation

### Basic Link Component

Use `<Link>` for client-side navigation instead of traditional `<a>` tags:

@boostsnippet("Inertia Svelte Navigation", "svelte")
<script>
import { Link } from '@inertiajs/svelte'
</script>

<Link href="/">Home</Link>
<Link href="/users">Users</Link>
<Link href={`/users/${user.id}`}>View User</Link>
@endboostsnippet

### Link With Method

@boostsnippet("Link With POST Method", "svelte")
<script>
import { Link } from '@inertiajs/svelte'
</script>

<Link href="/logout" method="post">Logout</Link>
@endboostsnippet

### Prefetching

Prefetch pages to improve perceived performance:

@boostsnippet("Prefetch on Hover", "svelte")
<script>
import { Link } from '@inertiajs/svelte'
</script>

<Link href="/users" prefetch>Users</Link>
@endboostsnippet

### Programmatic Navigation

@boostsnippet("Router Visit", "svelte")
<script>
import { router } from '@inertiajs/svelte'

function handleClick() {
    router.visit('/users')
}

// Or with options
function createUser() {
    router.visit('/users', {
        method: 'post',
        data: { name: 'John' },
        onSuccess: () => console.log('Success!'),
    })
}
</script>
@endboostsnippet

## Form Handling

@if($assist->inertia()->hasFormComponent())
### Form Component (Recommended)

The recommended way to build forms is with the `<Form>` component. In Svelte 5, use `{#snippet}` for the default slot:

@boostsnippet("Form Component Example", "svelte")
<script>
import { Form } from '@inertiajs/svelte'
</script>

<Form action="/users" method="post">
    {#snippet children({ errors, processing, wasSuccessful })}
        <input type="text" name="name" />
        {#if errors.name}
            <div>{errors.name}</div>
        {/if}

        <input type="email" name="email" />
        {#if errors.email}
            <div>{errors.email}</div>
        {/if}

        <button type="submit" disabled={processing}>
            {processing ? 'Creating...' : 'Create User'}
        </button>

        {#if wasSuccessful}
            <div>User created!</div>
        {/if}
    {/snippet}
</Form>
@endboostsnippet

### Form Component With All Props

@boostsnippet("Form Component Full Example", "svelte")
<script>
import { Form } from '@inertiajs/svelte'
</script>

<Form action="/users" method="post">
    {#snippet children({
        errors,
        hasErrors,
        processing,
        progress,
        wasSuccessful,
        recentlySuccessful,
        clearErrors,
        resetAndClearErrors,
        defaults,
        isDirty,
        reset,
        submit
    })}
        <input type="text" name="name" value={defaults.name} />
        {#if errors.name}
            <div>{errors.name}</div>
        {/if}

        <button type="submit" disabled={processing}>
            {processing ? 'Saving...' : 'Save'}
        </button>

        {#if progress}
            <progress value={progress.percentage} max="100">
                {progress.percentage}%
            </progress>
        {/if}

        {#if wasSuccessful}
            <div>Saved!</div>
        {/if}
    {/snippet}
</Form>
@endboostsnippet

@if($assist->inertia()->hasFormComponentResets())
### Form Component Reset Props

The `<Form>` component supports automatic resetting:

- `resetOnError` - Reset form data when the request fails
- `resetOnSuccess` - Reset form data when the request succeeds
- `setDefaultsOnSuccess` - Update default values on success

Use the `search-docs` tool with a query of `form component resetting` for detailed guidance.

@boostsnippet("Form With Reset Props", "svelte")
<script>
import { Form } from '@inertiajs/svelte'
</script>

<Form action="/users" method="post" resetOnSuccess setDefaultsOnSuccess>
    {#snippet children({ errors, processing, wasSuccessful })}
        <input type="text" name="name" />
        {#if errors.name}
            <div>{errors.name}</div>
        {/if}

        <button type="submit" disabled={processing}>
            Submit
        </button>
    {/snippet}
</Form>
@endboostsnippet
@else
Note: This version of Inertia does not support `resetOnError`, `resetOnSuccess`, or `setDefaultsOnSuccess` on the `<Form>` component. Using these props will cause errors. Upgrade to Inertia v2.2.0+ to use these features.
@endif

Forms can also be built using the `useForm` hook for more programmatic control. Use the `search-docs` tool with a query of `useForm helper` for guidance.

@endif

### `useForm` Hook

@if($assist->inertia()->hasFormComponent() === false)
For Inertia v2.0.x: Build forms using the `useForm` hook as the `<Form>` component is not available until v2.1.0+.
@else
For more programmatic control or to follow existing conventions, use the `useForm` hook:
@endif

@boostsnippet("useForm Example", "svelte")
<script>
import { useForm } from '@inertiajs/svelte'

const form = useForm({
    name: '',
    email: '',
    password: '',
})

function submit(e) {
    e.preventDefault()
    form.post('/users', {
        onSuccess: () => form.reset('password'),
    })
}
</script>

<form onsubmit={submit}>
    <input type="text" bind:value={form.name} />
    {#if form.errors.name}
        <div>{form.errors.name}</div>
    {/if}

    <input type="email" bind:value={form.email} />
    {#if form.errors.email}
        <div>{form.errors.email}</div>
    {/if}

    <input type="password" bind:value={form.password} />
    {#if form.errors.password}
        <div>{form.errors.password}</div>
    {/if}

    <button type="submit" disabled={form.processing}>
        Create User
    </button>
</form>
@endboostsnippet

## Inertia v3 Features

### HTTP Requests

Use the `useHttp` hook for standalone HTTP requests that do not trigger Inertia page visits. It provides the same developer experience as `useForm`, but for plain JSON endpoints.

@boostsnippet("useHttp Example", "svelte")
<script>
import { useHttp } from '@inertiajs/svelte'

const http = useHttp({
    query: '',
})

function search() {
    http.get('/api/search', {
        onSuccess: (response) => {
            console.log(response)
        },
    })
}
</script>

<input bind:value={http.query} oninput={search} />
{#if http.processing}
    <div>Searching...</div>
{/if}
@endboostsnippet

### Optimistic Updates

Apply data changes instantly before the server responds, with automatic rollback on failure:

@boostsnippet("Optimistic Update with Router", "svelte")
<script>
import { router } from '@inertiajs/svelte'

function like(post) {
    router.optimistic((props) => ({
        post: {
            ...props.post,
            likes: props.post.likes + 1,
        },
    })).post(`/posts/${post.id}/like`)
}
</script>
@endboostsnippet

Optimistic updates also work with `useForm` and the `<Form>` component:

@boostsnippet("Optimistic Update with Form Component", "svelte")
<script>
import { Form } from '@inertiajs/svelte'
</script>

<Form
    action="/todos"
    method="post"
    optimistic={(props, data) => ({
        todos: [...props.todos, { id: Date.now(), name: data.name, done: false }],
    })}
>
    {#snippet children({ processing })}
        <input type="text" name="name" />
        <button type="submit" disabled={processing}>Add Todo</button>
    {/snippet}
</Form>
@endboostsnippet

### Instant Visits

Navigate to a new page immediately without waiting for the server response. The target component renders right away with shared props, while page-specific props load in the background.

@verbatim
@boostsnippet("Instant Visit with Link", "svelte")
<script>
import { Link, inertia } from '@inertiajs/svelte'
</script>

<Link href="/dashboard" component="Dashboard">Dashboard</Link>

<a href="/dashboard" use:inertia={{ component: 'Dashboard' }}>Dashboard</a>

<Link
    href="/posts/1"
    component="Posts/Show"
    pageProps={{ post: { id: 1, title: 'My Post' } }}
>
    View Post
</Link>
@endboostsnippet
@endverbatim

### Layout Props

Share dynamic data between pages and persistent layouts:

@boostsnippet("Layout Props in Layout", "svelte")
<script>
let { title = 'My App', showSidebar = true, children } = $props()
</script>

<header>{title}</header>
{#if showSidebar}
    <aside>Sidebar</aside>
{/if}
<main>
    {@render children()}
</main>
@endboostsnippet

@boostsnippet("Setting Layout Props from Page", "svelte")
<script>
import { setLayoutProps } from '@inertiajs/svelte'

setLayoutProps({
    title: 'Dashboard',
    showSidebar: false,
})
</script>

<h1>Dashboard</h1>
@endboostsnippet

### Deferred Props

Use deferred props to load data after initial page render:

@boostsnippet("Deferred Props with Empty State", "svelte")
<script>
let { users } = $props()
</script>

<div>
    <h1>Users</h1>
    {#if !users}
        <div class="animate-pulse">
            <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
    {:else}
        <ul>
            {#each users as user (user.id)}
                <li>{user.name}</li>
            {/each}
        </ul>
    {/if}
</div>
@endboostsnippet

### Polling

Use the `usePoll` hook to automatically refresh data at intervals. It handles cleanup on unmount and throttles polling when the tab is inactive.

@boostsnippet("Basic Polling", "svelte")
<script>
import { usePoll } from '@inertiajs/svelte'

let { stats } = $props()

usePoll(5000)
</script>

<div>
    <h1>Dashboard</h1>
    <div>Active Users: {stats.activeUsers}</div>
</div>
@endboostsnippet

@boostsnippet("Polling With Request Options and Manual Control", "svelte")
<script>
import { usePoll } from '@inertiajs/svelte'

let { stats } = $props()

const { start, stop } = usePoll(5000, {
    only: ['stats'],
    onStart() {
        console.log('Polling request started')
    },
    onFinish() {
        console.log('Polling request finished')
    },
}, {
    autoStart: false,
    keepAlive: true,
})
</script>

<div>
    <h1>Dashboard</h1>
    <div>Active Users: {stats.activeUsers}</div>
    <button onclick={start}>Start Polling</button>
    <button onclick={stop}>Stop Polling</button>
</div>
@endboostsnippet

- `autoStart` (default `true`) - set to `false` to start polling manually via the returned `start()` function
- `keepAlive` (default `false`) - set to `true` to prevent throttling when the browser tab is inactive

### WhenVisible

Lazy-load a prop when an element scrolls into view. Useful for deferring expensive data that sits below the fold:

@boostsnippet("WhenVisible Example", "svelte")
<script>
import { WhenVisible } from '@inertiajs/svelte'

let { stats } = $props()
</script>

<div>
    <h1>Dashboard</h1>

    <WhenVisible data="stats" buffer={200}>
        {#snippet fallback()}
            <div class="animate-pulse">Loading stats...</div>
        {/snippet}

        <div>
            <p>Total Users: {stats.total_users}</p>
            <p>Revenue: {stats.revenue}</p>
        </div>
    </WhenVisible>
</div>
@endboostsnippet

### InfiniteScroll

Automatically load additional pages of paginated data as users scroll:

@boostsnippet("InfiniteScroll Example", "svelte")
<script>
import { InfiniteScroll } from '@inertiajs/svelte'

let { users } = $props()
</script>

<InfiniteScroll data="users">
    {#each users.data as user (user.id)}
        <div>{user.name}</div>
    {/each}
</InfiniteScroll>
@endboostsnippet

The server must use `Inertia::scroll()` to configure the paginated data. Use the `search-docs` tool with a query of `infinite scroll` for detailed guidance on buffers, manual loading, reverse mode, and custom trigger elements.

## Server-Side Patterns

Server-side patterns (Inertia::render, props, middleware) are covered in inertia-laravel guidelines.

## Common Pitfalls

- Using traditional `<a>` links instead of Inertia's `<Link>` component (breaks SPA behavior)
- Using Svelte 4 syntax (`export let`, `on:click`, `$:`, `slot`) instead of Svelte 5 runes (`$props()`, `onclick`, `$derived()`, `{#snippet}`)
- Forgetting to add loading states (skeleton screens) when using deferred props
- Not handling the `undefined` state of deferred props before data loads
- Using `<form>` without preventing default submission (use `<Form>` component or call `e.preventDefault()` in the `onsubmit` handler)
- Forgetting to check if `<Form>` component is available in your Inertia version
- Using `router.cancel()` instead of `router.cancelAll()` (v3 breaking change)
- Using `router.on('invalid', ...)` or `router.on('exception', ...)` instead of the renamed `httpException` and `networkError` events
