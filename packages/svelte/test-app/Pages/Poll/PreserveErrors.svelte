<script lang="ts">
  import { useForm, usePoll, page } from '@inertiajs/svelte'

  interface Props {
    time: number
  }

  let { time }: Props = $props()

  const form = useForm({ name: '' })

  const submit = () => {
    form.post('/poll/preserve-errors')
  }

  usePoll(300, {
    only: ['time'],
  })
</script>

{#if page.props.errors?.name}
  <p id="page-error">{page.props.errors.name}</p>
{/if}
{#if form.errors.name}
  <p id="form-error">{form.errors.name}</p>
{/if}

<button type="button" onclick={submit}>Submit</button>

<p id="time">Time: {time}</p>
