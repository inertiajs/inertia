<script setup lang="ts">
import type { Method, QueryStringArrayFormatOption } from '@inertiajs/core'
import { Form } from '@inertiajs/vue3'
import { computed, ref } from 'vue'
import Article from './../Article.vue'

const only = ref<string[]>([])
const except = ref<string[]>([])
const reset = ref<string[]>([])
const replace = ref(false)
const state = ref('Default State')
const preserveScroll = ref(false)
const preserveState = ref(false)
const preserveUrl = ref(false)
const queryStringArrayFormat = ref<QueryStringArrayFormatOption | undefined>(undefined)

function setOnly() {
  only.value = ['users']
}

function setExcept() {
  except.value = ['stats']
}

function setReset() {
  reset.value = ['orders']
}

function enableReplace() {
  replace.value = true
}

function enablePreserveScroll() {
  preserveScroll.value = true
}

function enablePreserveState() {
  preserveState.value = true
  state.value = 'Replaced State'
}

function enablePreserveUrl() {
  preserveUrl.value = true
}

const action = computed(() => {
  if (preserveScroll.value) {
    return '/article'
  }

  if (preserveState.value) {
    return '/form-component/options'
  }

  if (preserveUrl.value) {
    return '/form-component/options?page=2'
  }

  return queryStringArrayFormat.value ? '/dump/get' : '/dump/post'
})

const method = computed((): Method => {
  if (preserveScroll.value || preserveState.value || preserveUrl.value) {
    return 'get'
  }

  return queryStringArrayFormat.value ? 'get' : 'post'
})
</script>

<template>
  <Form
    :action="action"
    :method="method"
    :options="{
      only,
      except,
      reset,
      replace,
      preserveScroll,
      preserveState,
      preserveUrl,
    }"
    :query-string-array-format="queryStringArrayFormat"
  >
    <h1>Form Options</h1>

    <input type="text" name="tags[]" value="alpha" />
    <input type="text" name="tags[]" value="beta" />

    <div>
      State: <span id="state">{{ state }}</span>
    </div>

    <div>
      <button type="button" @click="setOnly">Set Only (users)</button>
      <button type="button" @click="setExcept">Set Except (stats)</button>
      <button type="button" @click="setReset">Set Reset (orders)</button>
      <button type="button" @click="queryStringArrayFormat = 'brackets'">Use Brackets Format</button>
      <button type="button" @click="queryStringArrayFormat = 'indices'">Use Indices Format</button>
      <button type="button" @click="enablePreserveScroll">Enable Preserve Scroll</button>
      <button type="button" @click="enablePreserveState">Enable Preserve State</button>
      <button type="button" @click="enablePreserveUrl">Enable Preserve URL</button>
      <button type="button" @click="enableReplace">Enable Replace</button>
      <button type="submit">Submit</button>
    </div>
  </Form>

  <Article v-if="preserveScroll" />
</template>
