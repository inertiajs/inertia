<script>
  import { inertia } from '@inertiajs/svelte'
</script>

<div>
  <span class="text">This is the links page that demonstrates that only one visit can be active at a time</span>
  <a
    href="/sleep"
    use:inertia
    on:cancel={() => console.log('cancelled')}
    on:start={() => console.log('started')}
    class="visit"
  >
    Link
  </a>
</div>
