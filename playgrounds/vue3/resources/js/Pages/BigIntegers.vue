<script setup lang="ts">
import { Head, router, useForm, usePage } from '@inertiajs/vue3'
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

const safeValue = 900719925474099988n
const hugeValue = 99999999999999999999999n

const validationForm = useForm({
  account_id: safeValue,
  reference: 'ABC-123',
}).withPrecognition('post', '/big-integers/validate')

const uploadForm = useForm({
  account_id: safeValue,
  avatar: null as File | null,
})

const pickAvatar = (event: Event) => {
  uploadForm.avatar = (event.target as HTMLInputElement).files?.[0] ?? null
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
        The value is sent as its digits, the same way form data and query strings send it, so the controller receives a
        numeric string.
      </p>
    </div>

    <div>
      <h2 class="text-lg font-semibold">Validation</h2>
      <p class="mt-1 max-w-2xl text-sm text-gray-600">
        The rule is <code>integer</code>. It passes because the digits arrive as a numeric string. Beyond PHP_INT_MAX
        the digits cannot become a native integer, so the same rule fails.
      </p>

      <form
        @submit.prevent="validationForm.post('/big-integers/validate')"
        class="mt-2 max-w-md space-y-2 font-mono text-sm"
      >
        <p>
          account_id: <span id="validation-account-id">{{ validationForm.account_id }}</span>
        </p>

        <label class="block">
          reference
          <input
            id="validation-reference"
            v-model="validationForm.reference"
            @blur="validationForm.validate('reference')"
            class="mt-1 w-full rounded-sm border border-gray-300 px-2 py-1"
          />
        </label>

        <div class="space-x-2">
          <button type="button" @click="validationForm.account_id = safeValue" class="rounded-sm bg-gray-200 px-3 py-1">
            Use safe value
          </button>
          <button type="button" @click="validationForm.account_id = hugeValue" class="rounded-sm bg-gray-200 px-3 py-1">
            Use value beyond PHP_INT_MAX
          </button>
          <button type="submit" class="rounded-sm bg-slate-800 px-4 py-1 text-white">Submit</button>
        </div>
      </form>

      <p class="mt-2 text-sm">
        validating: <span id="validation-validating" class="font-mono">{{ validationForm.validating }}</span>
      </p>
      <pre class="mt-2 rounded-sm bg-gray-100 p-3 text-sm" id="validation-errors">{{
        Object.keys(validationForm.errors).length ? validationForm.errors : 'No errors'
      }}</pre>
    </div>

    <div>
      <h2 class="text-lg font-semibold">File Upload</h2>
      <p class="mt-1 max-w-2xl text-sm text-gray-600">
        Attaching a file switches the request to multipart. The value arrives as its digits, just like a JSON
        submission.
      </p>

      <form @submit.prevent="uploadForm.post('/big-integers/upload')" class="mt-2 max-w-md space-y-2">
        <input id="upload-avatar" type="file" @change="pickAvatar" class="block text-sm" />
        <button type="submit" class="rounded-sm bg-slate-800 px-4 py-1 text-sm text-white">
          Upload with account_id
        </button>
      </form>

      <pre class="mt-2 rounded-sm bg-gray-100 p-3 text-sm" id="upload-errors">{{
        Object.keys(uploadForm.errors).length ? uploadForm.errors : 'No errors'
      }}</pre>
    </div>
  </div>
</template>
