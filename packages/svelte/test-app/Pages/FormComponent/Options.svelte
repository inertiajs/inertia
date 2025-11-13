<script lang="ts">
  import { Form } from '@inertiajs/svelte'
  import type { Method, QueryStringArrayFormatOption } from '@inertiajs/core'
  import Article from '../Article.svelte'

  let only: string[] = []
  let except: string[] = []
  let reset: string[] = []
  let replace = false
  let state = 'Default State'
  let preserveScroll = false
  let preserveState = false
  let preserveUrl = false
  let queryStringArrayFormat: QueryStringArrayFormatOption | undefined = undefined

  function setOnly() {
    only = ['users']
  }

  function setExcept() {
    except = ['stats']
  }

  function setReset() {
    reset = ['orders']
  }

  function enableReplace() {
    replace = true
  }

  function enablePreserveScroll() {
    preserveScroll = true
  }

  function enablePreserveState() {
    preserveState = true
    state = 'Replaced State'
  }

  function enablePreserveUrl() {
    preserveUrl = true
  }

  $: action = (() => {
    if (preserveScroll) {
      return '/article'
    }

    if (preserveState) {
      return '/form-component/options'
    }

    if (preserveUrl) {
      return '/form-component/options?page=2'
    }

    return queryStringArrayFormat ? '/dump/get' : '/dump/post'
  })()

  $: method = (() => {
    if (preserveScroll || preserveState || preserveUrl) {
      return 'get'
    }

    return queryStringArrayFormat ? 'get' : 'post'
  })() as Method

  $: options = {
    only,
    except,
    reset,
    replace,
    preserveScroll,
    preserveState,
    preserveUrl,
  }
</script>

<Form {action} {method} {options} {queryStringArrayFormat}>
  <h1>Form Options</h1>

  <input type="text" name="tags[]" value="alpha" readonly />
  <input type="text" name="tags[]" value="beta" readonly />

  <div>
    State: <span id="state">{state}</span>
  </div>

  <div>
    <button type="button" on:click={setOnly}>Set Only (users)</button>
    <button type="button" on:click={setExcept}>Set Except (stats)</button>
    <button type="button" on:click={setReset}>Set Reset (orders)</button>
    <button type="button" on:click={() => (queryStringArrayFormat = 'brackets')}>Use Brackets Format</button>
    <button type="button" on:click={() => (queryStringArrayFormat = 'indices')}>Use Indices Format</button>
    <button type="button" on:click={enablePreserveScroll}>Enable Preserve Scroll</button>
    <button type="button" on:click={enablePreserveState}>Enable Preserve State</button>
    <button type="button" on:click={enablePreserveUrl}>Enable Preserve URL</button>
    <button type="button" on:click={enableReplace}>Enable Replace</button>
    <button type="submit">Submit</button>
  </div>

  {#if preserveScroll}
    <Article />
  {/if}
</Form>
