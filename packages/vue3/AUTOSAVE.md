# Auto-Save Functionality for Vue3

This package now includes auto-save functionality for Inertia.js forms, allowing forms to automatically save data as users type.

## Installation

The auto-save functionality requires the optional dependency `@provydon/vue-auto-save`:

```bash
npm install @provydon/vue-auto-save
```

## Usage

### Basic Auto-Save with Form Properties

You can enable auto-save by setting the `autosave` property to `true` and configuring `autosaveOptions`:

```javascript
import { useForm } from '@inertiajs/vue3'

const form = useForm({
  title: '',
  content: '',
  published: false,
})

// Enable auto-save
form.autosave = true
form.autosaveOptions = {
  url: '/posts/autosave',
  method: 'post',
  debounce: 2000,
  onSaveSuccess: (page) => {
    console.log('Auto-saved successfully', page)
  },
  onSaveError: (errors) => {
    console.error('Auto-save failed', errors)
  }
}
```

### Using enableAutoSave Method

You can also use the `enableAutoSave()` method for programmatic control:

```javascript
import { useForm } from '@inertiajs/vue3'

const form = useForm({
  title: '',
  content: '',
  published: false,
})

// Enable auto-save with method
form.enableAutoSave({
  url: '/posts/autosave',
  method: 'post',
  debounce: 1000,
  onSaveSuccess: (page) => {
    console.log('Auto-saved successfully', page)
  },
  onSaveError: (errors) => {
    console.error('Auto-save failed', errors)
  }
})
```

### Runtime Control

You can enable or disable auto-save functionality at runtime:

```javascript
// Enable auto-save using properties
form.autosave = true
form.autosaveOptions = {
  url: '/posts/autosave',
  method: 'post',
  debounce: 2000,
}

// Disable auto-save using property
form.autosave = false

// Or use methods
form.enableAutoSave({ url: '/posts/autosave' })
form.disableAutoSave()
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `url` | `string` | - | URL to send auto-save requests to |
| `method` | `string` | `'post'` | HTTP method for auto-save requests |
| `debounce` | `number` | `2000` | Debounce time in milliseconds |
| `skipInertiaFields` | `boolean` | `false` | Skip Inertia-specific fields like `processing`, `errors` |
| `onSave` | `function` | - | Custom save function (overrides url/method) |
| `onSaveSuccess` | `function` | - | Called when auto-save succeeds |
| `onSaveError` | `function` | - | Called when auto-save fails |

## Examples

### Basic Auto-Save Form

```vue
<template>
  <form @submit.prevent="submit">
    <input v-model="form.title" placeholder="Title" />
    <textarea v-model="form.content" placeholder="Content"></textarea>
    <button type="submit" :disabled="form.processing">Submit</button>
    <p>Auto-save is {{ form.autosave ? 'enabled' : 'disabled' }}</p>
  </form>
</template>

<script setup>
import { useForm } from '@inertiajs/vue3'

const form = useForm({
  title: '',
  content: '',
})

// Enable auto-save
form.autosave = true
form.autosaveOptions = {
  url: '/posts/autosave',
  debounce: 1500,
}

const submit = () => {
  form.post('/posts')
}
</script>
```

### Advanced Auto-Save with Toggle

```vue
<template>
  <form @submit.prevent="submit">
    <input v-model="form.title" placeholder="Title" />
    <textarea v-model="form.content" placeholder="Content"></textarea>
    <button type="submit" :disabled="form.processing">Submit</button>
    <button type="button" @click="toggleAutoSave">
      {{ form.autosave ? 'Disable' : 'Enable' }} Auto-Save
    </button>
    <p>Auto-save is {{ form.autosave ? 'enabled' : 'disabled' }}</p>
  </form>
</template>

<script setup>
import { useForm } from '@inertiajs/vue3'

const form = useForm({
  title: '',
  content: '',
})

// Enable auto-save initially
form.autosave = true
form.autosaveOptions = {
  url: '/posts/autosave',
  method: 'post',
  debounce: 1000,
  onSaveSuccess: () => console.log('Auto-saved!'),
  onSaveError: (errors) => console.error('Auto-save failed:', errors)
}

const submit = () => {
  form.post('/posts')
}

const toggleAutoSave = () => {
  if (form.autosave) {
    form.autosave = false
  } else {
    form.autosave = true
    form.autosaveOptions = {
      url: '/posts/autosave',
      method: 'post',
      debounce: 1000,
    }
  }
}
</script>
```

## Server-Side Implementation

Your server should handle auto-save requests differently from regular form submissions. Here's a Laravel example:

```php
public function autosave(Request $request)
{
    $validated = $request->validate([
        'title' => 'string|max:255',
        'content' => 'string',
        'published' => 'boolean',
    ]);

    // Save as draft or update existing record
    $post = Post::updateOrCreate(
        ['id' => $request->input('id')],
        array_merge($validated, ['is_draft' => true])
    );

    return response()->json([
        'message' => 'Auto-saved successfully',
        'id' => $post->id,
    ]);
}
```

## Notes

- Auto-save only triggers when the form is dirty (has changes)
- Auto-save is automatically disabled when the form is processing (submitting)
- The `@provydon/vue-auto-save` package is optional but provides enhanced functionality
- Auto-save requests use `preserveState: true` by default to avoid disrupting the user experience
- Consider implementing conflict resolution if multiple users might edit the same data simultaneously
