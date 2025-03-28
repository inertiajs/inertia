<template>
  <div class="rounded border border-gray-300 p-4 text-sm text-gray-500">
    <div class="mb-2 font-bold" v-if="$slots.title">
      <slot name="title" />
    </div>

    <slot />
  </div>
</template>
