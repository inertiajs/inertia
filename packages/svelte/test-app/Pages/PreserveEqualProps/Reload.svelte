<script module lang="ts">
  import PreserveEqualPropsLayout from '@/Layouts/PreserveEqualPropsLayout.svelte'

  export const layout = PreserveEqualPropsLayout
</script>

<script lang="ts">
  import { page, router } from '@inertiajs/svelte'
  import { untrack } from 'svelte'

  interface Props {
    file: { url: string; pages: number }
    tick: number
  }

  let { file, tick }: Props = $props()

  let effectCount = $state(0)
  let storeEffectCount = $state(0)

  $effect(() => {
    void file

    untrack(() => {
      effectCount++
    })
  })

  $effect(() => {
    void page.props.file

    untrack(() => {
      storeEffectCount++
    })
  })
</script>

<div>
  <p id="file">File: {file.url}</p>
  <p id="tick">Tick: {tick}</p>
  <p id="flash">Flash: {JSON.stringify(page.flash)}</p>
  <p id="effect-count">Effect count: {effectCount}</p>
  <p id="store-effect-count">Store effect count: {storeEffectCount}</p>

  <button onclick={() => router.reload({ only: ['tick'], data: { tick: tick + 1 } })}>Reload tick only</button>
  <button onclick={() => router.reload({ data: { tick: tick + 1 } })}>Reload all props</button>
  <button onclick={() => router.flash({ message: 'Saved' })}>Set flash</button>
  <button onclick={() => router.reload({ data: { tick: tick + 1, file: 'other' } })}>Change file</button>
  <button onclick={() => (page.props.file.url = '/files/edited.pdf')}>Edit file locally</button>
</div>
