<script setup lang="ts">
import { InfiniteScroll } from '@inertiajs/vue3'
import { defineComponent, h, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { User, default as UserCard } from './UserCard.vue'

defineProps<{
  users: { data: User[] }
}>()

const LifecycleMarker = defineComponent({
  setup() {
    onMounted(() => console.log('marker mounted'))
    onUnmounted(() => console.log('marker destroyed'))
    return () => h('span', { style: 'display: none' })
  },
})

const show = ref(false)
const cycleCount = ref(0)

async function cycleMount() {
  show.value = true
  await nextTick()
  show.value = false
  cycleCount.value++
}
</script>

<template>
  <div>
    <button @click="cycleMount">Cycle Mount</button>
    <p id="cycle-count">Cycles: {{ cycleCount }}</p>

    <template v-if="show">
      <LifecycleMarker />
      <InfiniteScroll data="users" style="display: grid; gap: 20px">
        <UserCard v-for="user in users.data" :key="user.id" :user="user" />
      </InfiniteScroll>
    </template>
  </div>
</template>
