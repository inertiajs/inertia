<script lang="ts">
  import { Form } from '@inertiajs/svelte'
  import type { Method, QueryStringArrayFormatOption } from '@inertiajs/core'
  import Article from '../Article.svelte'

  let only: string[] = $state([])
  let except: string[] = $state([])
  let reset: string[] = $state([])
  let replace = $state(false)
  let _state = $state('Default State')
  let preserveScroll = $state(false)
  let preserveState = $state(false)
  let preserveUrl = $state(false)
  let queryStringArrayFormat: QueryStringArrayFormatOption | undefined = $state(undefined)

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
    _state = 'Replaced State'
  }

  function enablePreserveUrl() {
    preserveUrl = true
  }

  let action = $derived(
    (() => {
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
    })(),
  )

  let method = $derived(
    (() => {
      if (preserveScroll || preserveState || preserveUrl) {
        return 'get'
      }

      return queryStringArrayFormat ? 'get' : 'post'
    })() as Method,
  )

  let options = $derived({
    only,
    except,
    reset,
    replace,
    preserveScroll,
    preserveState,
    preserveUrl,
  })
</script>

<Form {action} {method} {options} {queryStringArrayFormat}>
  <h1>Form Options</h1>

  <input type="text" name="tags[]" value="alpha" readonly />
  <input type="text" name="tags[]" value="beta" readonly />

  <div>
    State: <span id="state">{_state}</span>
  </div>

  <div>
    <button type="button" onclick={setOnly}>Set Only (users)</button>
    <button type="button" onclick={setExcept}>Set Except (stats)</button>
    <button type="button" onclick={setReset}>Set Reset (orders)</button>
    <button type="button" onclick={() => (queryStringArrayFormat = 'brackets')}>Use Brackets Format</button>
    <button type="button" onclick={() => (queryStringArrayFormat = 'indices')}>Use Indices Format</button>
    <button type="button" onclick={enablePreserveScroll}>Enable Preserve Scroll</button>
    <button type="button" onclick={enablePreserveState}>Enable Preserve State</button>
    <button type="button" onclick={enablePreserveUrl}>Enable Preserve URL</button>
    <button type="button" onclick={enableReplace}>Enable Replace</button>
    <button type="submit">Submit</button>
  </div>

  {#if preserveScroll}
    <Article />
  {/if}
</Form>
