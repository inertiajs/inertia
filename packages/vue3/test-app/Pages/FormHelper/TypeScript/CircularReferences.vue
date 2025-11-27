<script setup lang="ts">
// This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
import { useForm } from '@inertiajs/vue3'

type SubData = {
  foo: string
  items?: SubData[]
}

type Data = {
  items: SubData[]
}

const form = useForm<Data>({
  items: [],
})

form.items = []
form.items = [
  {
    foo: 'bar',
    items: [
      {
        foo: 'baz',
        items: [
          {
            foo: 'qux',
          },
        ],
      },
    ],
  },
]

// @ts-expect-error - items should be an array of SubData
form.items = {}
// @ts-expect-error - foo should be a string
form.items = [{ foo: 123 }]
// @ts-expect-error - items should be an array of SubData
form.items = [{ foo: 'bar', items: {} }]
// @ts-expect-error - foo should be a string
form.items = [{ foo: 'bar', items: [{ foo: 123 }] }]
</script>
