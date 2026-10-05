<script setup lang="ts">
import { router, useHttp } from '@inertiajs/vue3'
import { computed, ref } from 'vue'

const props = defineProps<{
  safe: number
  big: bigint
  negative: bigint
  nested: { deep: bigint[] }
  huge: bigint
  collision?: any
  echoedType?: string
}>()

const collisionValue = computed(() =>
  typeof props.collision === 'object' ? props.collision.$bigint : String(props.collision),
)

const loadReloadData = () => router.get('/bigint/reload')

const loadCollisionData = () => router.get('/bigint/collision')

const submitEcho = () => router.post('/bigint/echo', { value: 111222333444555666n })

const http = useHttp({ value: 111222333444555666n })
const httpEcho = ref<string | null>(null)
const submitHttpEcho = () =>
  http
    .post('/api/bigint/echo')
    .then((response: any) => (httpEcho.value = `${response.value} (${response.type})`))
    .catch((error: Error) => (httpEcho.value = `error: ${error.message}`))
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

    <p v-if="echoedType">
      echoed type: <span id="echoed-type">{{ echoedType }}</span>
    </p>

    <button @click="loadReloadData">Load reload data</button>
    <button @click="loadCollisionData">Load collision data</button>
    <button @click="submitEcho">Submit echo</button>
    <button @click="submitHttpEcho">Submit useHttp echo</button>

    <p v-if="httpEcho" id="http-echo">{{ httpEcho }}</p>
  </div>
</template>
