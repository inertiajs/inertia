// This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
import { useForm } from '@inertiajs/react'
import { useEffect } from 'react'

type SubData = {
  items?: SubData[]
}

type Data = {
  items: SubData[]
}

export default function Any() {
  const form = useForm<Data>({
    items: [],
  })

  useEffect(() => {
    form.setData('items', [
      {
        items: [],
      },
    ])
  }, [form])
}
