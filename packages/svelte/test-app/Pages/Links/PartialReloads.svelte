<script lang="ts">
  import { inertia } from '@inertiajs/svelte'

  let { foo = 0, bar, baz, headers } = $props()
</script>

<div>
  <span class="text">This is the links page that demonstrates partial reloads</span>
  <span class="foo-text">Foo is now {foo}</span>
  <span class="bar-text">Bar is now {bar}</span>
  <span class="baz-text">Baz is now {baz}</span>
  <pre class="headers" style="white-space: pre-wrap; word-break: keep-all;">{JSON.stringify(headers, null, 2)}</pre>

  <a href="/links/partial-reloads" use:inertia={{ data: { foo } }} class="all">Update All</a>
  <a href="/links/partial-reloads" use:inertia={{ only: ['headers', 'foo', 'bar'], data: { foo } }} class="foo-bar"
    >Only foo + bar</a
  >
  <a href="/links/partial-reloads" use:inertia={{ only: ['headers', 'baz'], data: { foo } }} class="baz">Only baz</a>
  <a href="/links/partial-reloads" use:inertia={{ except: ['foo', 'bar'], data: { foo } }} class="except-foo-bar"
    >Except foo + bar</a
  >
  <a href="/links/partial-reloads" use:inertia={{ except: ['baz'], data: { foo } }} class="except-baz">Except baz</a>
</div>
