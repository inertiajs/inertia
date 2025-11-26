import { useForm } from '@inertiajs/react'
import { useEffect, useState } from 'react'

export default () => {
  const form = useForm<{
    name: string
    avatar: File | null
  }>({
    name: '',
    avatar: null,
  })
    .withPrecognition('post', '/precognition/files')
    .setValidationTimeout(100)

  const [validateFiles, setValidateFiles] = useState(false)

  useEffect(() => {
    if (validateFiles) {
      form.validateFiles()
    } else {
      form.withoutFileValidation()
    }
  }, [form, validateFiles])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    form.setData('avatar', file)
  }

  return (
    <div>
      <div>
        <input
          value={form.data.name}
          name="name"
          placeholder="Name"
          onChange={(e) => form.setData('name', e.target.value)}
          onBlur={() => form.validate('name')}
        />
        {form.invalid('name') && <p>{form.errors.name}</p>}
        {form.valid('name') && <p>Name is valid!</p>}
      </div>

      <div>
        <input type="file" name="avatar" id="avatar" onChange={handleFileChange} />
        {form.invalid('avatar') && <p>{form.errors.avatar}</p>}
        {form.valid('avatar') && <p>Avatar is valid!</p>}
      </div>

      {form.validating && <p>Validating...</p>}

      <button type="button" onClick={() => setValidateFiles(!validateFiles)}>
        Toggle Validate Files ({validateFiles ? 'enabled' : 'disabled'})
      </button>

      <button type="button" onClick={() => form.validate({ only: ['name', 'avatar'] })}>
        Validate Both
      </button>
    </div>
  )
}
