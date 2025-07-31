# Form Component

## Basic Usage

At its simplest, the `<Form>` component behaves much like a classic HTML form:

```vue
<script setup>
import { Form } from '@inertiajs/vue3'
</script>

<template>
  <Form action="/users" method="post">
    <input type="text" name="name" />
    <input type="email" name="email" />
    <button type="submit">Create User</button>
  </Form>
</template>
```

It also supports more advanced use cases, including nested data structures and file uploads:

```vue
<template>
  <Form action="/reports" method="post">
    <input type="text" name="name" />
    <textarea name="report[description]"></textarea>
    <input type="text" name="report[tags][]" />
    <input type="text" name="report[tags][]" />
    <input type="text" name="report[tags][]" />
    <input type="file" name="documents" multiple />
    <button type="submit">Create Report</button>
  </Form>
</template>
```

Form data is gathered using a `FormData` instance and then converted to a plain JavaScript object. This lets the form track its *dirty* state and, when submitting a `GET` request, merge the data into the query string automatically.

You can also pass a `transform` prop to modify the form data before submission. This is great for injecting extra fields, although hidden inputs work too:

```vue
<template>
  <Form
    action="/posts"
    method="post"
    :transform="data => ({
      ...data,
      user_id: props.user.id,
    })"
  >
    <input type="text" name="title" />
    <textarea name="content"></textarea>
    <button type="submit">Create Post</button>
  </Form>
</template>
```

## Slot Props

Just like the `useForm()` helper, the `<Form>` component exposes reactive state and helpers through its default slot:

```vue
<template>
  <Form
    action="/posts"
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
      isDirty,
      reset,
      submit,
    }"
    class="mt-6 max-w-2xl space-y-6"
  >
    <input type="text" name="name" />
    <div v-if="errors.name">{{ errors.name }}</div>

    <input type="email" name="email" />
    <div v-if="errors.email">{{ errors.email }}</div>

    <button type="submit" :disabled="processing">
      {{ processing ? 'Creating...' : 'Create User' }}
    </button>

    <div v-if="wasSuccessful">User created successfully!</div>
  </Form>
</template>
```

## Options

In addition to `action` and `method`, the `<Form>` component accepts several props. Many of them are identical to the ones available in Inertia's `VisitOptions`:

```vue
<template>
  <Form
    action="/profile"
    method="put"
    error-bag="profile"
    query-string-array-format="indices"
    :headers="{ 'X-Custom-Header': 'Demo-Value' }"
    :show-progress="false"
    :visit-options="{
      preserveScroll: true,
      preserveState: true,
      preserveUrl: true,
      replace: true,
      only: ['users', 'flash'],
      except: ['secret'],
      reset: ['page'],
    }"
  />
</template>
```

Some props are intentionally grouped under `visit-options` instead of being top-level, to avoid confusion. For example, `only`, `except`, and `reset` relate to *partial reloads*, not *partial submissions*. The general rule: top-level props are for the form submission itself, while `visit-options` control how Inertia handles the next visit.

## Events

The `<Form>` component emits the same events as `useForm()`, except the ones related to prefetching:

```vue
<template>
  <Form
    action="/users"
    method="post"
    @cancelToken="handleCancelToken"
    @before="handleBefore"
    @start="handleStart"
    @progress="handleProgress"
    @cancel="handleCancel"
    @success="handleSuccess"
    @error="handleError"
    @finish="handleFinish"
  />
</template>
```