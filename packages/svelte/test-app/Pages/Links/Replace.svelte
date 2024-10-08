<script>
  import { inertia } from '@inertiajs/svelte'
</script>

<div>
  <span class="text">This is the links page that demonstrates replace on Links</span>

  <a href="/dump/get" use:inertia={{ replace: true }} class="replace">[State] Replace: true</a>
  <a href="/dump/get" use:inertia={{ replace: false }} class="replace-false">[State] Replace: false</a>
</div>
