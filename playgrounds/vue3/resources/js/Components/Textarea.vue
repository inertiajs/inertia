<script setup lang="ts">
import autosize from 'autosize'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const modelValue = defineModel<string>()
const textareaRef = ref<HTMLTextAreaElement | null>(null)

onMounted(() => autosize(textareaRef.value!))
watch(modelValue, () => nextTick(() => autosize.update(textareaRef.value!)))
onBeforeUnmount(() => autosize.destroy(textareaRef.value!))
</script>

<template>
  <textarea
    rows="1"
    ref="textareaRef"
    v-model="modelValue"
    class="block w-full resize-none border-0 bg-transparent py-1 text-[16px] text-gray-900 placeholder-gray-500 outline-none"
  ></textarea>
</template>
