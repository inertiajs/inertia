<script lang="ts">
  import { inertia, useHttp } from '@inertiajs/svelte'

  const upload = useHttp({})
</script>

<div>
  <button use:inertia={{ method: 'post', href: '/dump/post' }}>Same-origin Link</button>
  <button use:inertia={{ method: 'post', href: 'https://external.example/upload' }}>Cross-origin Link</button>
  <button onclick={() => upload.put('https://external.example/upload')}>Cross-origin HTTP</button>
</div>
