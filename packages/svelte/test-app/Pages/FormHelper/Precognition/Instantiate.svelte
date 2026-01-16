<!-- @migration-task Error while migrating Svelte code: Cannot bind to constant
https://svelte.dev/e/constant_binding -->
<script lang="ts">
  import type { Method, UrlMethodPair } from '@inertiajs/core'
  import { useForm } from '@inertiajs/svelte'

  const wayfinderUrl = (): UrlMethodPair => ({
    url: '/precognition/default',
    method: 'post',
  })

  let formName = $state<keyof typeof forms>('default')
  const data = () => ({ name: 'a' })

  const forms = {
    // Forms that use the new withPrecognition() method
    default: useForm(data()).withPrecognition('post', '/precognition/default'),
    dynamic: useForm(data()).withPrecognition(
      () => 'post',
      () => '/precognition/default',
    ),
    wayfinder: useForm(data()).withPrecognition(wayfinderUrl()),
    dynamicWayfinder: useForm(data()).withPrecognition(() => wayfinderUrl()),

    // Forms that use the original useForm() parameters from the 0.x Precognition implementation
    legacy: useForm('post', '/precognition/default', data()),
    legacyDynamic: useForm(
      () => 'post' as Method,
      () => '/precognition/default',
      data(),
    ),
    legacyWayfinder: useForm(wayfinderUrl(), data()),
    legacyDynamicWayfinder: useForm(() => wayfinderUrl(), data()),
  }

  // Get the current form store reactively
  let currentFormStore = $derived(forms[formName])

  const validateForm = (formName: keyof typeof forms) => {
    const form = forms[formName]
    form.touch('name')
    form.validate()
  }

  const submitWithoutArgs = (formName: keyof typeof forms) => {
    const form = forms[formName]
    form.submit()
  }

  const submitWithArgs = (formName: keyof typeof forms) => {
    const form = forms[formName]
    form.submit('patch', '/dump/patch')
  }

  const submitWithMethod = (formName: keyof typeof forms) => {
    const form = forms[formName]
    form.put('/dump/put')
  }

  const submitWithWayfinder = (formName: keyof typeof forms) => {
    const form = forms[formName]
    form.submit({ url: '/dump/post', method: 'post' })
  }
</script>

<select bind:value={formName}>
  <option value="default">withPrecognition()</option>
  <option value="dynamic">withPrecognition() dynamic</option>
  <option value="wayfinder">withPrecognition() Wayfinder</option>
  <option value="dynamicWayfinder">withPrecognition() dynamic Wayfinder</option>
  <option value="legacy">useForm() legacy</option>
  <option value="legacyDynamic">useForm() legacy dynamic</option>
  <option value="legacyWayfinder">useForm() legacy Wayfinder</option>
  <option value="legacyDynamicWayfinder">useForm() legacy dynamic Wayfinder</option>
</select>

<button onclick={() => validateForm(formName)}>Validate</button>
<button onclick={() => submitWithoutArgs(formName)}>Submit without args</button>
<button onclick={() => submitWithArgs(formName)}>Submit with args</button>
<button onclick={() => submitWithMethod(formName)}>Submit with method</button>
<button onclick={() => submitWithWayfinder(formName)}>Submit with Wayfinder</button>

{#if currentFormStore && currentFormStore.validating}<p>Validating...</p>{/if}
{#if currentFormStore && currentFormStore.errors && currentFormStore.errors.name}<p>
    {currentFormStore.errors.name}
  </p>{/if}
