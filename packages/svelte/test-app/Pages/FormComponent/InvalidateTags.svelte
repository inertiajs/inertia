<script lang="ts">
  import { Link, Form } from '@inertiajs/svelte'

  let { lastLoaded, propType } = $props()
</script>

<div>
  <div id="links">
    <Link href="/prefetch/tags/1" prefetch="hover" cacheTags={propType === 'string' ? 'user' : ['user']}>
      User Tagged Page
    </Link>
    <Link href="/prefetch/tags/2" prefetch="hover" cacheTags={propType === 'string' ? 'product' : ['product']}>
      Product Tagged Page
    </Link>
  </div>

  <div id="form-section">
    <h3>Form Component with invalidateCacheTags</h3>
    <Form action="/dump/post" method="post" invalidateCacheTags={propType === 'string' ? 'user' : ['user']}>
      <input id="form-name" name="name" type="text" placeholder="Enter name" />
      <button id="submit-invalidate-user" type="submit"> Submit (Invalidate User Tags) </button>
    </Form>
  </div>

  <div>
    <div>Form Component Invalidate Tags Test Page</div>
    <div>
      Last loaded at <span id="last-loaded">{lastLoaded}</span>
    </div>
  </div>
</div>
