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
  <span id="child-is-dirty">{$form.isDirty}</span>
  <span id="child-has-errors">{$form.hasErrors}</span>
  <span id="child-processing">{$form.processing}</span>
  <span id="child-was-successful">{$form.wasSuccessful}</span>
  <span id="child-recently-successful">{$form.recentlySuccessful}</span>
  {#if $form.hasErrors}<pre id="child-errors">{JSON.stringify($form.errors, null, 2)}</pre>{/if}

  <button type="button" id="child-submit" on:click={() => $form.submit()}>submit()</button>
  <button type="button" id="child-reset-all" on:click={() => $form.reset()}>reset()</button>
  <button type="button" id="child-reset-name" on:click={() => $form.reset('name')}>reset('name')</button>
  <button type="button" id="child-reset-multiple" on:click={() => $form.reset('name', 'email')}>reset('name', 'email')</button>

  <button type="button" id="child-clear-all-errors" on:click={() => $form.clearErrors()}>clearErrors()</button>
  <button type="button" id="child-clear-name-error" on:click={() => $form.clearErrors('name')}>clearErrors('name')</button>
  <button type="button" id="child-set-single-error" on:click={() => $form.setError('name', 'Name is invalid')}>setError('name')</button>
  <button type="button" id="child-set-multiple-errors" on:click={() => $form.setError({ name: 'Name error from child', email: 'Email error from child', bio: 'Bio error from child' })}>setError({'{...}'})</button>

  <button type="button" id="child-reset-clear-all" on:click={() => $form.resetAndClearErrors()}>resetAndClearErrors()</button>
  <button type="button" id="child-reset-clear-name" on:click={() => $form.resetAndClearErrors('name')}>resetAndClearErrors('name')</button>
  <button type="button" id="child-set-defaults" on:click={() => $form.defaults()}>defaults()</button>

  <button type="button" id="child-get-data" on:click={testGetData}>getData()</button>
  <button type="button" id="child-get-form-data" on:click={testGetFormData}>getFormData()</button>

  {#if getDataResult}
    <div id="get-data-result"><pre>{getDataResult}</pre></div>
  {/if}
  {#if getFormDataResult}
    <div id="get-form-data-result"><pre>{getFormDataResult}</pre></div>
  {/if}
{:else}
  <div id="child-no-context">No form context available</div>
{/if}
