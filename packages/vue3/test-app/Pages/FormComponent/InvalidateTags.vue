<script setup lang="ts">
import { Form, Link } from '@inertiajs/vue3'

defineProps({
  lastLoaded: Number,
  propType: String,
})
</script>

<template>
  <div>
    <div id="links">
      <Link href="/prefetch/tags/1" prefetch="hover" :cache-tags="propType === 'string' ? 'user' : ['user']">
        User Tagged Page
      </Link>
      <Link href="/prefetch/tags/2" prefetch="hover" :cache-tags="propType === 'string' ? 'product' : ['product']">
        Product Tagged Page
      </Link>
    </div>

    <div id="form-section">
      <h3>Form Component with invalidateCacheTags</h3>
      <Form action="/dump/post" method="post" :invalidate-cache-tags="propType === 'string' ? 'user' : ['user']">
        <input id="form-name" name="name" type="text" placeholder="Enter name" />
        <button id="submit-invalidate-user" type="submit">Submit (Invalidate User Tags)</button>
      </Form>
    </div>

    <div>
      <div>Form Component Invalidate Tags Test Page</div>
      <div>
        Last loaded at <span id="last-loaded">{{ lastLoaded }}</span>
      </div>
    </div>
  </div>
</template>
