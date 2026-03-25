<script module lang="ts">
  import AppLayout from '@/Layouts/AppLayout.svelte'
  import ContentLayout from '@/Layouts/ContentLayout.svelte'

  export const layout = {
    app: [AppLayout, { title: 'Named Dynamic Page' }],
    content: [ContentLayout, { padding: 'md' }],
  }
</script>

<script lang="ts">
  import { setLayoutProps } from '@inertiajs/svelte'
</script>

<div>
  <h2>Named Dynamic Layout Page</h2>

  <button type="button" onclick={() => setLayoutProps('app', { title: 'Updated App Title' })}>Update App Title</button>
  <button type="button" onclick={() => setLayoutProps('content', { padding: 'xl' })}>Update Content Padding</button>
</div>
