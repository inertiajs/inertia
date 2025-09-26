<script lang="ts">
  import { router } from '@inertiajs/svelte'

  interface Tag {
    id: number
    name: string
  }

  interface User {
    name: string
    age: number
  }

  export let items: string[] = []
  export let tags: Tag[] = []
  export let user: User | undefined = undefined
  export let count = 0
  export let singleValue: string | string[] | undefined = undefined
  export let undefinedValue: string | string[] | undefined = undefined

  const replacePropString = () => {
    router.replaceProp('user.name', 'Jane Smith')
  }

  const replacePropNumber = () => {
    router.replaceProp('count', 10)
  }

  const replacePropFunction = () => {
    router.replaceProp('count', (oldValue: number) => oldValue * 2)
  }

  const appendToPropArray = () => {
    router.appendToProp('items', 'item3')
  }

  const appendToPropMultiple = () => {
    router.appendToProp('items', ['item4', 'item5'])
  }

  const appendToPropFunction = () => {
    router.appendToProp('tags', () => ({ id: 3, name: 'tag3' }))
  }

  const appendArrayToArray = () => {
    router.appendToProp('tags', [
      { id: 3, name: 'tag3' },
      { id: 4, name: 'tag4' },
    ])
  }

  const prependToPropArray = () => {
    router.prependToProp('items', 'item0')
  }

  const prependToPropMultiple = () => {
    router.prependToProp('items', ['itemA', 'itemB'])
  }

  const prependToPropFunction = () => {
    router.prependToProp('tags', () => ({ id: 0, name: 'tag0' }))
  }

  // Edge case tests for mergeArrays behavior
  const appendToNonArray = () => {
    router.appendToProp('singleValue', 'world')
  }

  const prependToNonArray = () => {
    router.prependToProp('singleValue', 'hey')
  }

  const appendArrayToNonArray = () => {
    router.appendToProp('singleValue', ['there', 'world'])
  }

  const prependArrayToNonArray = () => {
    router.prependToProp('singleValue', ['hey', 'hi'])
  }

  const appendToUndefined = () => {
    router.appendToProp('undefinedValue', 'new value')
  }

  const prependToUndefined = () => {
    router.prependToProp('undefinedValue', 'start value')
  }
</script>

<div>
  <h1>Client Side Visit Props Testing</h1>

  <div>User: {user?.name || 'Unknown'} (Age: {user?.age || 'Unknown'})</div>
  <div>Count: {count}</div>

  <div>Items: {JSON.stringify(items)}</div>
  <div>Tags: {JSON.stringify(tags)}</div>
  <div>Single Value: {JSON.stringify(singleValue)}</div>
  <div>Undefined Value: {JSON.stringify(undefinedValue)}</div>

  <hr />

  <h2>Replace Prop Tests</h2>
  <button on:click={replacePropString}>Replace user.name</button>
  <button on:click={replacePropNumber}>Replace count</button>
  <button on:click={replacePropFunction}>Replace count (function)</button>

  <h2>Append To Prop Tests</h2>
  <button on:click={appendToPropArray}>Append to items (single)</button>
  <button on:click={appendToPropMultiple}>Append to items (multiple)</button>
  <button on:click={appendToPropFunction}>Append to tags (function)</button>
  <button on:click={appendArrayToArray}>Append array to array (objects)</button>

  <h2>Prepend To Prop Tests</h2>
  <button on:click={prependToPropArray}>Prepend to items (single)</button>
  <button on:click={prependToPropMultiple}>Prepend to items (multiple)</button>
  <button on:click={prependToPropFunction}>Prepend to tags (function)</button>

  <h2>Edge Case Tests (mergeArrays behavior)</h2>
  <button on:click={appendToNonArray}>Append to non-array (single + single)</button>
  <button on:click={prependToNonArray}>Prepend to non-array (single + single)</button>
  <button on:click={appendArrayToNonArray}>Append array to non-array (single + array)</button>
  <button on:click={prependArrayToNonArray}>Prepend array to non-array (array + single)</button>
  <button on:click={appendToUndefined}>Append to undefined</button>
  <button on:click={prependToUndefined}>Prepend to undefined</button>
</div>
