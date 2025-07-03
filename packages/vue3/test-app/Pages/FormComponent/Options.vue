<script setup>
import { Form } from '@inertiajs/vue3'
import { ref } from 'vue'

const only = ref([])
const except = ref([])
const replace = ref(false)
const preserveScroll = ref(false)
const preserveState = ref(false)
const queryStringArrayFormat = ref(undefined)

function setOnly() {
  only.value = ['users']
}

function setExcept() {
  except.value = ['stats']
}
</script>

<template>
  <Form
    :action="queryStringArrayFormat ? '/dump/get' : '/dump/post'"
    :method="queryStringArrayFormat ? 'get' : 'post'"
    :only="only"
    :except="except"
    :replace="replace"
    :preserve-scroll="preserveScroll"
    :preserve-state="preserveState"
    :query-string-array-format="queryStringArrayFormat"
  >
    <h1>Form Options</h1>

    <input type="text" name="tags[]" value="alpha" />
    <input type="text" name="tags[]" value="beta" />

    <div>
      <button type="button" @click="setOnly">Set Only (users)</button>
      <button type="button" @click="setExcept">Set Except (stats)</button>
      <button type="button" @click="queryStringArrayFormat = 'brackets'">Use Brackets Format</button>
      <button type="button" @click="queryStringArrayFormat = 'indices'">Use Indices Format</button>
      <button type="submit">Submit</button>
    </div>
  </Form>
</template>
