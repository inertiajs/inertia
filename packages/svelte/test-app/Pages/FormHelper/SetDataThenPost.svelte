<script lang="ts">
  import { useForm } from '@inertiajs/svelte'

  const form = useForm({ code: 'initial' })

  const handleSetAndPost = () => {
    form.code = '123456'
    form.post('/dump/post')
  }

  const handleDirty = () => {
    form.code = 'dirty'
  }

  const handleResetAndPost = () => {
    form.reset()
    form.post('/dump/post')
  }
</script>

<div>
  <span id="current-code">{form.code}</span>
  <button onclick={handleSetAndPost} class="set-and-post">Set and POST</button>
  <button onclick={handleDirty} class="dirty">Dirty</button>
  <button onclick={handleResetAndPost} class="reset-and-post">Reset and POST</button>
</div>
