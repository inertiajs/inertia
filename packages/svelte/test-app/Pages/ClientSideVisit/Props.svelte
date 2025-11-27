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

  interface Props_1 {
    items?: string[]
    tags?: Tag[]
    user?: User | undefined
    count?: number
    singleValue?: string | string[] | undefined
    undefinedValue?: string | string[] | undefined
  }

  let {
    items = [],
    tags = [],
    user = undefined,
    count = 0,
    singleValue = undefined,
    undefinedValue = undefined,
  }: Props_1 = $props()

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
  <button onclick={replacePropString}>Replace user.name</button>
  <button onclick={replacePropNumber}>Replace count</button>
  <button onclick={replacePropFunction}>Replace count (function)</button>

  <h2>Append To Prop Tests</h2>
  <button onclick={appendToPropArray}>Append to items (single)</button>
  <button onclick={appendToPropMultiple}>Append to items (multiple)</button>
  <button onclick={appendToPropFunction}>Append to tags (function)</button>
  <button onclick={appendArrayToArray}>Append array to array (objects)</button>

  <h2>Prepend To Prop Tests</h2>
  <button onclick={prependToPropArray}>Prepend to items (single)</button>
  <button onclick={prependToPropMultiple}>Prepend to items (multiple)</button>
  <button onclick={prependToPropFunction}>Prepend to tags (function)</button>

  <h2>Edge Case Tests (mergeArrays behavior)</h2>
  <button onclick={appendToNonArray}>Append to non-array (single + single)</button>
  <button onclick={prependToNonArray}>Prepend to non-array (single + single)</button>
  <button onclick={appendArrayToNonArray}>Append array to non-array (single + array)</button>
  <button onclick={prependArrayToNonArray}>Prepend array to non-array (array + single)</button>
  <button onclick={appendToUndefined}>Append to undefined</button>
  <button onclick={prependToUndefined}>Prepend to undefined</button>
</div>
