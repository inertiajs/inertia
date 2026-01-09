<script lang="ts">
  import { useFormContext } from '@inertiajs/svelte'

  const form = useFormContext()

  let getDataResult = ''
  let getFormDataResult = ''

  function testGetData() {
    if ($form) {
      getDataResult = JSON.stringify($form.getData(), null, 2)
    }
  }

  function testGetFormData() {
    if ($form) {
      const formData = $form.getFormData()
      const obj: Record<string, FormDataEntryValue> = {}
      formData.forEach((value, key) => {
        obj[key] = value
      })
      getFormDataResult = JSON.stringify(obj, null, 2)
    }
  }
</script>

{#if $form}
  <span>{$form.isDirty}</span>
  <span>{$form.hasErrors}</span>
  <span>{$form.processing}</span>
  <span>{$form.wasSuccessful}</span>
  <span>{$form.recentlySuccessful}</span>
  {#if $form.hasErrors}<pre>{JSON.stringify($form.errors, null, 2)}</pre>{/if}

  <button type="button" on:click={() => $form.submit()}>submit()</button>
  <button type="button" on:click={() => $form.reset()}>reset()</button>
  <button type="button" on:click={() => $form.reset('name')}>reset('name')</button>
  <button type="button" on:click={() => $form.reset('name', 'email')}>reset('name', 'email')</button>

  <button type="button" on:click={() => $form.clearErrors()}>clearErrors()</button>
  <button type="button" on:click={() => $form.clearErrors('name')}>clearErrors('name')</button>
  <button type="button" on:click={() => $form.setError('name', 'Name is invalid')}>setError('name')</button>
  <button
    type="button"
    on:click={() =>
      $form.setError({ name: 'Name error from child', email: 'Email error from child', bio: 'Bio error from child' })}
    >setError({'{...}'})</button
  >

  <button type="button" on:click={() => $form.resetAndClearErrors()}>resetAndClearErrors()</button>
  <button type="button" on:click={() => $form.resetAndClearErrors('name')}>resetAndClearErrors('name')</button>
  <button type="button" on:click={() => $form.defaults()}>defaults()</button>

  <button type="button" on:click={testGetData}>getData()</button>
  <button type="button" on:click={testGetFormData}>getFormData()</button>

  {#if getDataResult}
    <div><pre>{getDataResult}</pre></div>
  {/if}
  {#if getFormDataResult}
    <div><pre>{getFormDataResult}</pre></div>
  {/if}
{:else}
  <div>No form context available</div>
{/if}
