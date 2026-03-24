---
name: inertia-vue-development
description: "Develops Inertia.js v3 Vue client-side applications. Activates when creating Vue pages, forms, or navigation; using <Link>, <Form>, useForm, useHttp, setLayoutProps, or router; working with deferred props, prefetching, optimistic updates, instant visits, or polling; or when user mentions Vue with Inertia, Vue pages, Vue forms, or Vue navigation."
license: MIT
metadata:
  author: laravel
---
@php
/** @var \Laravel\Boost\Install\GuidelineAssist $assist */
@endphp
# Inertia Vue Development

## When to Apply

Activate this skill when:

- Creating or modifying Vue page components for Inertia
- Working with forms in Vue (using `<Form>`, `useForm`, or `useHttp`)
- Implementing client-side navigation with `<Link>` or `router`
- Using v3 features: deferred props, prefetching, optimistic updates, instant visits, layout props, HTTP requests, WhenVisible, InfiniteScroll, once props, flash data, or polling
- Building Vue-specific features with the Inertia protocol

## Documentation

Use `search-docs` for detailed Inertia v3 Vue patterns and documentation.

## Basic Usage

### Page Components Location

Vue page components should be placed in the `{{ $assist->inertia()->pagesDirectory() }}` directory.

### Page Component Structure

@verbatim
@boostsnippet("Basic Vue Page Component", "vue")
<script setup>
defineProps({
    users: Array
})
</script>

<template>
    <div>
        <h1>Users</h1>
        <ul>
            <li v-for="user in users" :key="user.id">
                {{ user.name }}
            </li>
        </ul>
    </div>
</template>
@endboostsnippet
@endverbatim

## Client-Side Navigation

### Basic Link Component

Use `<Link>` for client-side navigation instead of traditional `<a>` tags:

@boostsnippet("Inertia Vue Navigation", "vue")
<script setup>
import { Link } from '@inertiajs/vue3'
</script>

<template>
    <div>
        <Link href="/">Home</Link>
        <Link href="/users">Users</Link>
        <Link :href="`/users/${user.id}`">View User</Link>
    </div>
</template>
@endboostsnippet

### Link with Method

@boostsnippet("Link with POST Method", "vue")
<script setup>
import { Link } from '@inertiajs/vue3'
</script>

<template>
    <Link href="/logout" method="post" as="button">
        Logout
    </Link>
</template>
@endboostsnippet

### Prefetching

Prefetch pages to improve perceived performance:

@boostsnippet("Prefetch on Hover", "vue")
<script setup>
import { Link } from '@inertiajs/vue3'
</script>

<template>
    <Link href="/users" prefetch>
        Users
    </Link>
</template>
@endboostsnippet

### Programmatic Navigation

@boostsnippet("Router Visit", "vue")
<script setup>
import { router } from '@inertiajs/vue3'

function handleClick() {
    router.visit('/users')
}

// Or with options
function createUser() {
    router.visit('/users', {
        method: 'post',
        data: { name: 'John' },
        onSuccess: () => console.log('Done'),
    })
}
</script>

<template>
    <Link href="/users">Users</Link>
    <Link href="/logout" method="post" as="button">Logout</Link>
</template>
@endboostsnippet

## Form Handling

@if($assist->inertia()->hasFormComponent())
### Form Component (Recommended)

The recommended way to build forms is with the `<Form>` component:

@verbatim
@boostsnippet("Form Component Example", "vue")
<script setup>
import { Form } from '@inertiajs/vue3'
</script>

<template>
    <Form action="/users" method="post" #default="{ errors, processing, wasSuccessful }">
        <input type="text" name="name" />
        <div v-if="errors.name">{{ errors.name }}</div>

        <input type="email" name="email" />
        <div v-if="errors.email">{{ errors.email }}</div>

        <button type="submit" :disabled="processing">
            {{ processing ? 'Creating...' : 'Create User' }}
        </button>

        <div v-if="wasSuccessful">User created!</div>
    </Form>
</template>
@endboostsnippet
@endverbatim

### Form Component With All Props

@verbatim
@boostsnippet("Form Component Full Example", "vue")
<script setup>
import { Form } from '@inertiajs/vue3'
</script>

<template>
    <Form
        action="/users"
        method="post"
        #default="{
            errors,
            hasErrors,
            processing,
            progress,
            wasSuccessful,
            recentlySuccessful,
            setError,
            clearErrors,
            resetAndClearErrors,
            defaults,
            isDirty,
            reset,
            submit
        }"
    >
        <input type="text" name="name" :value="defaults.name" />
        <div v-if="errors.name">{{ errors.name }}</div>

        <button type="submit" :disabled="processing">
            {{ processing ? 'Saving...' : 'Save' }}
        </button>

        <progress v-if="progress" :value="progress.percentage" max="100">
            {{ progress.percentage }}%
        </progress>

        <div v-if="wasSuccessful">Saved!</div>
    </Form>
</template>
@endboostsnippet
@endverbatim

@if($assist->inertia()->hasFormComponentResets())
### Form Component Reset Props

The `<Form>` component supports automatic resetting:

- `resetOnError` - Reset form data when the request fails
- `resetOnSuccess` - Reset form data when the request succeeds
- `setDefaultsOnSuccess` - Update default values on success

Use the `search-docs` tool with a query of `form component resetting` for detailed guidance.

@verbatim
@boostsnippet("Form with Reset Props", "vue")
<script setup>
import { Form } from '@inertiajs/vue3'
</script>

<template>
    <Form
        action="/users"
        method="post"
        reset-on-success
        set-defaults-on-success
        #default="{ errors, processing, wasSuccessful }"
    >
        <input type="text" name="name" />
        <div v-if="errors.name">{{ errors.name }}</div>

        <button type="submit" :disabled="processing">
            Submit
        </button>
    </Form>
</template>
@endboostsnippet
@endverbatim
@else
Note: This version of Inertia does not support `resetOnError`, `resetOnSuccess`, or `setDefaultsOnSuccess` on the `<Form>` component. Using these props will cause errors. Upgrade to Inertia v2.2.0+ to use these features.
@endif

Forms can also be built using the `useForm` composable for more programmatic control. Use the `search-docs` tool with a query of `useForm helper` for guidance.

@endif

### `useForm` Composable

@if($assist->inertia()->hasFormComponent() === false)
For Inertia v2.0.x: Build forms using the `useForm` composable as the `<Form>` component is not available until v2.1.0+.
@else
For more programmatic control or to follow existing conventions, use the `useForm` composable:
@endif

@verbatim
@boostsnippet("useForm Composable Example", "vue")
<script setup>
import { useForm } from '@inertiajs/vue3'

const form = useForm({
    name: '',
    email: '',
    password: '',
})

function submit() {
    form.post('/users', {
        onSuccess: () => form.reset('password'),
    })
}
</script>

<template>
    <form @submit.prevent="submit">
        <input type="text" v-model="form.name" />
        <div v-if="form.errors.name">{{ form.errors.name }}</div>

        <input type="email" v-model="form.email" />
        <div v-if="form.errors.email">{{ form.errors.email }}</div>

        <input type="password" v-model="form.password" />
        <div v-if="form.errors.password">{{ form.errors.password }}</div>

        <button type="submit" :disabled="form.processing">
            Create User
        </button>
    </form>
</template>
@endboostsnippet
@endverbatim

## Inertia v3 Features

### HTTP Requests

Use the `useHttp` hook for standalone HTTP requests that do not trigger Inertia page visits. It provides the same developer experience as `useForm`, but for plain JSON endpoints.

@boostsnippet("useHttp Example", "vue")
<script setup>
import { useHttp } from '@inertiajs/vue3'

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

<template>
    <input v-model="http.query" @input="search" />
    <div v-if="http.processing">Searching...</div>
</template>
@endboostsnippet

### Optimistic Updates

Apply data changes instantly before the server responds, with automatic rollback on failure:

@boostsnippet("Optimistic Update with Router", "vue")
<script setup>
import { router } from '@inertiajs/vue3'

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

@verbatim
@boostsnippet("Optimistic Update with Form Component", "vue")
<template>
    <Form
        action="/todos"
        method="post"
        :optimistic="(props, data) => ({
            todos: [...props.todos, { id: Date.now(), name: data.name, done: false }],
        })"
    >
        <input type="text" name="name" />
        <button type="submit">Add Todo</button>
    </Form>
</template>
@endboostsnippet
@endverbatim

### Instant Visits

Navigate to a new page immediately without waiting for the server response. The target component renders right away with shared props, while page-specific props load in the background.

@boostsnippet("Instant Visit with Link", "vue")
<script setup>
import { Link } from '@inertiajs/vue3'
</script>

<template>
    <Link href="/dashboard" component="Dashboard">Dashboard</Link>

    <Link
        href="/posts/1"
        component="Posts/Show"
        :page-props="{ post: { id: 1, title: 'My Post' } }"
    >
        View Post
    </Link>
</template>
@endboostsnippet

### Layout Props

Share dynamic data between pages and persistent layouts:

@verbatim
@boostsnippet("Layout Props in Layout", "vue")
<script setup>
withDefaults(defineProps({
    title: String,
    showSidebar: Boolean,
}), {
    title: 'My App',
    showSidebar: true,
})
</script>

<template>
    <header>{{ title }}</header>
    <aside v-if="showSidebar">Sidebar</aside>
    <main>
        <slot />
    </main>
</template>
@endboostsnippet
@endverbatim

@boostsnippet("Setting Layout Props from Page", "vue")
<script setup>
import { setLayoutProps } from '@inertiajs/vue3'

setLayoutProps({
    title: 'Dashboard',
    showSidebar: false,
})
</script>

<template>
    <h1>Dashboard</h1>
</template>
@endboostsnippet

### Deferred Props

Use deferred props to load data after initial page render:

@verbatim
@boostsnippet("Deferred Props with Empty State", "vue")
<script setup>
defineProps({
    users: Array
})
</script>

<template>
    <div>
        <h1>Users</h1>
        <div v-if="!users" class="animate-pulse">
            <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <ul v-else>
            <li v-for="user in users" :key="user.id">
                {{ user.name }}
            </li>
        </ul>
    </div>
</template>
@endboostsnippet
@endverbatim

### Polling

Use the `usePoll` composable to automatically refresh data at intervals. It handles cleanup on unmount and throttles polling when the tab is inactive.

@verbatim
@boostsnippet("Basic Polling", "vue")
<script setup>
import { usePoll } from '@inertiajs/vue3'

defineProps({
    stats: Object
})

usePoll(5000)
</script>

<template>
    <div>
        <h1>Dashboard</h1>
        <div>Active Users: {{ stats.activeUsers }}</div>
    </div>
</template>
@endboostsnippet
@endverbatim

@verbatim
@boostsnippet("Polling With Request Options and Manual Control", "vue")
<script setup>
import { usePoll } from '@inertiajs/vue3'

defineProps({
    stats: Object
})

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

<template>
    <div>
        <h1>Dashboard</h1>
        <div>Active Users: {{ stats.activeUsers }}</div>
        <button @click="start">Start Polling</button>
        <button @click="stop">Stop Polling</button>
    </div>
</template>
@endboostsnippet
@endverbatim

- `autoStart` (default `true`) - set to `false` to start polling manually via the returned `start()` function
- `keepAlive` (default `false`) - set to `true` to prevent throttling when the browser tab is inactive

### WhenVisible

Lazy-load a prop when an element scrolls into view. Useful for deferring expensive data that sits below the fold:

@verbatim
@boostsnippet("WhenVisible Example", "vue")
<script setup>
import { WhenVisible } from '@inertiajs/vue3'

defineProps({
    stats: Object
})
</script>

<template>
    <div>
        <h1>Dashboard</h1>

        <WhenVisible data="stats" :buffer="200">
            <template #fallback>
                <div class="animate-pulse">Loading stats...</div>
            </template>

            <template #default="{ fetching }">
                <div>
                    <p>Total Users: {{ stats.total_users }}</p>
                    <p>Revenue: {{ stats.revenue }}</p>
                    <span v-if="fetching">Refreshing...</span>
                </div>
            </template>
        </WhenVisible>
    </div>
</template>
@endboostsnippet
@endverbatim

### InfiniteScroll

Automatically load additional pages of paginated data as users scroll:

@verbatim
@boostsnippet("InfiniteScroll Example", "vue")
<script setup>
import { InfiniteScroll } from '@inertiajs/vue3'

defineProps({
    users: Object
})
</script>

<template>
    <InfiniteScroll data="users">
        <div v-for="user in users.data" :key="user.id">
            {{ user.name }}
        </div>
    </InfiniteScroll>
</template>
@endboostsnippet
@endverbatim

The server must use `Inertia::scroll()` to configure the paginated data. Use the `search-docs` tool with a query of `infinite scroll` for detailed guidance on buffers, manual loading, reverse mode, and custom trigger elements.

## Server-Side Patterns

Server-side patterns (Inertia::render, props, middleware) are covered in inertia-laravel guidelines.

## Common Pitfalls

- Using traditional `<a>` links instead of Inertia's `<Link>` component (breaks SPA behavior)
- Forgetting that Vue components must have a single root element
- Forgetting to add loading states (skeleton screens) when using deferred props
- Not handling the `undefined` state of deferred props before data loads
- Using `<form>` without preventing default submission (use `<Form>` component or `@submit.prevent`)
- Forgetting to check if `<Form>` component is available in your Inertia version
- Using `router.cancel()` instead of `router.cancelAll()` (v3 breaking change)
- Using `router.on('invalid', ...)` or `router.on('exception', ...)` instead of the renamed `httpException` and `networkError` events
