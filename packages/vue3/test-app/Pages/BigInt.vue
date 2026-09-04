<script setup lang="ts">
import { router } from '@inertiajs/vue3'
import { computed } from 'vue'

const props = defineProps<{
  safe: number
  big: bigint
  negative: bigint
  nested: { deep: bigint[] }
  huge: bigint
  collision?: any
}>()

const collisionValue = computed(() =>
  typeof props.collision === 'object' ? props.collision.$bigint : String(props.collision),
)

const loadReloadData = () => router.get('/bigint/reload')

const loadCollisionData = () => router.get('/bigint/collision')

const submitEcho = () => router.post('/bigint/echo', { value: 111222333444555666n })
</script>

<template>
  <div>
    <p>
      safe: <span id="safe">{{ safe }}</span> (<span id="safe-type">{{ typeof safe }}</span
      >)
    </p>
    <p>
      big: <span id="big">{{ big }}</span> (<span id="big-type">{{ typeof big }}</span
      >)
    </p>
    <p>
      negative: <span id="negative">{{ negative }}</span>
    </p>
    <p>
      huge: <span id="huge">{{ huge }}</span>
    </p>
    <p>
      nested: <span id="nested">{{ nested.deep.join(',') }}</span>
    </p>
    <p v-if="collision">
      collision: <span id="collision">{{ collisionValue }}</span> (<span id="collision-type">{{
        typeof collision
      }}</span
      >)
    </p>

    <button @click="loadReloadData">Load reload data</button>
    <button @click="loadCollisionData">Load collision data</button>
    <button @click="submitEcho">Submit echo</button>
  </div>
</template>
