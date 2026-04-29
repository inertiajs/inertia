<script lang="ts">
  import { useForm } from '@inertiajs/svelte'

  const form = useForm({ code: 'initial', name: 'initial-name' })

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

  const handlePartialResetAndPost = () => {
    form.code = 'changed-code'
    form.name = 'changed-name'
    form.reset('code')
    form.post('/dump/post')
  }
</script>

<div>
  <span id="current-code">{form.code}</span>
  <span id="current-name">{form.name}</span>
  <button onclick={handleSetAndPost} class="set-and-post">Set and POST</button>
  <button onclick={handleDirty} class="dirty">Dirty</button>
  <button onclick={handleResetAndPost} class="reset-and-post">Reset and POST</button>
  <button onclick={handlePartialResetAndPost} class="partial-reset-and-post">Partial reset and POST</button>
</div>
