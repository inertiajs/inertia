<script lang="ts">
  import { router } from '@inertiajs/svelte'

  let { safe, big, negative, nested, huge, collision } = $props()

  const loadReloadData = () => router.get('/bigint/reload')
  const loadCollisionData = () => router.get('/bigint/collision')
  const submitEcho = () => router.post('/bigint/echo', { value: 111222333444555666n })
</script>

<div>
  <p>safe: <span id="safe">{safe}</span> (<span id="safe-type">{typeof safe}</span>)</p>
  <p>big: <span id="big">{big}</span> (<span id="big-type">{typeof big}</span>)</p>
  <p>negative: <span id="negative">{negative}</span></p>
  <p>huge: <span id="huge">{huge}</span></p>
  <p>nested: <span id="nested">{nested.deep.join(',')}</span></p>
  {#if collision}
    <p>
      collision: <span id="collision">{typeof collision === 'object' ? collision.$bigint : collision}</span> (<span
        id="collision-type">{typeof collision}</span
      >)
    </p>
  {/if}

  <button onclick={loadReloadData}>Load reload data</button>
  <button onclick={loadCollisionData}>Load collision data</button>
  <button onclick={submitEcho}>Submit echo</button>
</div>
