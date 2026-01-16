<script lang="ts">
  import { useFormContext } from '@inertiajs/svelte'

  const form = useFormContext()

  let getDataResult = $state('')
  let getFormDataResult = $state('')

  function testGetData() {
    if (form) {
      getDataResult = JSON.stringify(form.getData(), null, 2)
    }
  }

  function testGetFormData() {
    if (form) {
      const formData = form.getFormData()
      const obj: Record<string, FormDataEntryValue> = {}
      formData.forEach((value, key) => {
        obj[key] = value
      })
      getFormDataResult = JSON.stringify(obj, null, 2)
    }
  }
</script>

{#if form}
  {#if form.processing}<span>Child: processing</span>{/if}
  {#if form.wasSuccessful}<span>Child: was successful</span>{/if}
  {#if form.recentlySuccessful}<span>Child: recently successful</span>{/if}
  {#if form.hasErrors}<pre>{JSON.stringify(form.errors, null, 2)}</pre>{/if}

  <button type="button" onclick={() => form.submit()}>submit()</button>
  <button type="button" onclick={() => form.reset()}>reset()</button>
  <button type="button" onclick={() => form.reset('name')}>reset('name')</button>
  <button type="button" onclick={() => form.reset('name', 'email')}>reset('name', 'email')</button>

  <button type="button" onclick={() => form.clearErrors()}>clearErrors()</button>
  <button type="button" onclick={() => form.clearErrors('name')}>clearErrors('name')</button>
  <button type="button" onclick={() => form.setError('name', 'Name is invalid')}>setError('name')</button>
  <button
    type="button"
    onclick={() =>
      form.setError({ name: 'Name error from child', email: 'Email error from child', bio: 'Bio error from child' })}
    >setError({'{...}'})</button
  >

  <button type="button" onclick={() => form.resetAndClearErrors()}>resetAndClearErrors()</button>
  <button type="button" onclick={() => form.resetAndClearErrors('name')}>resetAndClearErrors('name')</button>

  <button type="button" onclick={testGetData}>getData()</button>
  <button type="button" onclick={testGetFormData}>getFormData()</button>

  {#if getDataResult}<pre id="get-data-result">{getDataResult}</pre>{/if}
  {#if getFormDataResult}<pre id="get-form-data-result">{getFormDataResult}</pre>{/if}
{:else}
  <div>No form context available</div>
{/if}
