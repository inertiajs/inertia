// This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
import { useForm } from '@inertiajs/react'

type SubData = {
  foo: string
  items?: SubData[]
}

type Data = {
  items: SubData[]
}

export default function Any() {
  const form = useForm<Data>({
    items: [],
  })

  form.setData('items', [])
  form.setData('items', [
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
  ])

  // @ts-expect-error - items should be an array of SubData
  form.setData('items', {})
  // @ts-expect-error - foo should be a string
  form.setData('items', [{ foo: 123 }])
  // @ts-expect-error - items should be an array of SubData
  form.setData('items', [{ foo: 'bar', items: {} }])
  // @ts-expect-error - foo should be a string
  form.setData('items', [{ foo: 'bar', items: [{ foo: 123 }] }])
}
