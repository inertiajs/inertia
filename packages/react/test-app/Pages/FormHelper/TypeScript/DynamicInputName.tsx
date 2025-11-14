// This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
import { useForm } from '@inertiajs/react'

interface ClientForm {
  name: string
  [key: string]: any // eslint-disable-line @typescript-eslint/no-explicit-any
}

export default function DynamicInputName() {
  const { data, setData } = useForm<ClientForm>({
    name: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target as HTMLInputElement
    setData(name, value)
  }

  return <input name="name" type="text" value={data.name} onChange={handleChange} />
}
