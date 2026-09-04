<script setup lang="ts">
import { Head, router, usePage } from '@inertiajs/vue3'
import { computed } from 'vue'

const props = defineProps<{
  safe: number
  big: bigint
  negative: bigint
  maximum: bigint
  boundary: number
  order: { id: bigint; lines: { sku: string; reference: bigint }[] }
  wrapped: { id: bigint }
}>()

const page = usePage()

const echo = computed(() => (Object.keys(page.flash ?? {}).length ? page.flash : 'Nothing submitted yet'))
const rounded = computed(() => Number(props.big))
const incremented = computed(() => props.big + 1n)

const submit = () => {
  router.post('/big-integers/echo', { id: props.big })
}
</script>

<template>
  <Head title="Big Integers" />
  <h1 class="text-3xl">Big Integers</h1>

  <p class="mt-2 max-w-2xl text-gray-600">
    Integers outside JavaScript's safe range arrive as native BigInt values instead of being rounded while the page is
    parsed.
  </p>

  <div class="mt-6 space-y-6">
    <div>
      <h2 class="text-lg font-semibold">Props</h2>
      <table class="mt-2 text-sm">
        <thead class="text-left text-gray-500">
          <tr>
            <th class="pr-8">Prop</th>
            <th class="pr-8">Value</th>
            <th>typeof</th>
          </tr>
        </thead>
        <tbody class="font-mono">
          <tr>
            <td class="pr-8">safe</td>
            <td class="pr-8" id="safe">{{ safe }}</td>
            <td>{{ typeof safe }}</td>
          </tr>
          <tr>
            <td class="pr-8">boundary</td>
            <td class="pr-8" id="boundary">{{ boundary }}</td>
            <td>{{ typeof boundary }}</td>
          </tr>
          <tr>
            <td class="pr-8">big</td>
            <td class="pr-8" id="big">{{ big }}</td>
            <td>{{ typeof big }}</td>
          </tr>
          <tr>
            <td class="pr-8">negative</td>
            <td class="pr-8" id="negative">{{ negative }}</td>
            <td>{{ typeof negative }}</td>
          </tr>
          <tr>
            <td class="pr-8">maximum</td>
            <td class="pr-8" id="maximum">{{ maximum }}</td>
            <td>{{ typeof maximum }}</td>
          </tr>
          <tr>
            <td class="pr-8">order.id</td>
            <td class="pr-8" id="nested">{{ order.id }}</td>
            <td>{{ typeof order.id }}</td>
          </tr>
          <tr>
            <td class="pr-8">order.lines[0].reference</td>
            <td class="pr-8" id="deep">{{ order.lines[0].reference }}</td>
            <td>{{ typeof order.lines[0].reference }}</td>
          </tr>
          <tr>
            <td class="pr-8">wrapped.id</td>
            <td class="pr-8" id="wrapped">{{ wrapped.id }}</td>
            <td>{{ typeof wrapped.id }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div>
      <h2 class="text-lg font-semibold">Precision Loss Without BigInt</h2>
      <pre class="mt-2 rounded-sm bg-gray-100 p-3 text-sm">
big              {{ big }}
Number(big)      {{ rounded }}
big + 1n         {{ incremented }}</pre
      >
      <p class="mt-2 text-sm text-gray-600">
        Casting to a number is what happens without this feature enabled. Arithmetic stays exact while both operands are
        BigInt values.
      </p>
    </div>

    <div>
      <h2 class="text-lg font-semibold">Submitting</h2>
      <button @click="submit" class="mt-2 rounded-sm bg-slate-800 px-4 py-2 text-white">Post big to the server</button>
      <pre class="mt-2 rounded-sm bg-gray-100 p-3 text-sm" id="echo">{{ echo }}</pre>
      <p class="mt-2 text-sm text-gray-600">
        The value is encoded on submit and decoded by the Inertia middleware, so the controller receives an integer.
      </p>
    </div>
  </div>
</template>
