import { useForm, usePage } from '@inertiajs/react'
import { useEffect, useState } from 'react'

export default (props) => {
  const form = useForm({
    name: 'foo',
    handle: 'example',
    remember: false,
    custom: {},
  })

  const page = usePage()

  const submit = () => {
    form.post(page.url)
  }

  const resetAll = () => {
    form.reset()
  }

  const resetOne = () => {
    form.reset('handle')
  }

  const reassign = () => {
    form.setDefaults()
  }

  const reassignObject = () => {
    form.setDefaults({ handle: 'updated handle', remember: true })
  }

  const reassignSingle = () => {
    form.setDefaults('name', 'single value')
  }

  const addCustomOtherProp = () => {
    form.setData((prevData) => ({
      ...prevData,
      custom: {
        ...prevData.custom,
        other_prop: 'dynamic_value',
      },
    }))
  }

  const [formDataOutput, setFormDataOutput] = useState('')

  // Effect to watch form.data and update formDataOutput
  useEffect(() => {
    setFormDataOutput(JSON.stringify(form.data))
  }, [form.data])

  return (
    <div>
      <label>
        Full Name
        <input
          type="text"
          id="name"
          name="name"
          onChange={(e) => form.setData('name', e.target.value)}
          value={form.data.name}
        />
      </label>
      {form.errors.name && <span className="name_error">{form.errors.name}</span>}
      <label>
        Handle
        <input
          type="text"
          id="handle"
          name="handle"
          onChange={(e) => form.setData('handle', e.target.value)}
          value={form.data.handle}
        />
      </label>
      {form.errors.handle && <span className="handle_error">{form.errors.handle}</span>}
      <label>
        Remember Me
        <input
          type="checkbox"
          id="remember"
          name="remember"
          onChange={(e) => form.setData('remember', e.target.checked)}
          checked={form.data.remember}
        />
      </label>
      {form.errors.remember && <span className="remember_error">{form.errors.remember}</span>}

      <label>
        Accept Terms and Conditions
        <input
          type="checkbox"
          id="accept_tos"
          name="accept_tos"
          onChange={(e) => form.setData('accept_tos', e.target.checked)}
          checked={!!form.data.accept_tos}
        />
      </label>
      {form.errors.accept_tos && <span className="accept_tos_error">{form.errors.accept_tos}</span>}

      <button onClick={submit} className="submit">
        Submit form
      </button>

      <button onClick={resetAll} className="reset">
        Reset all data
      </button>
      <button onClick={resetOne} className="reset-one">
        Reset one field
      </button>

      <button onClick={reassign} className="reassign">
        Reassign current as defaults
      </button>
      <button onClick={reassignObject} className="reassign-object">
        Reassign default values
      </button>
      <button onClick={reassignSingle} className="reassign-single">
        Reassign single default
      </button>

      <button onClick={addCustomOtherProp} className="add-custom-other-prop">
        Add custom.other_prop
      </button>

      <span className="errors-status">Form has {form.hasErrors ? '' : 'no '}errors</span>

      <div id="form-data-output" data-test-id="form-data-output" style={{ display: 'none' }}>
        {formDataOutput}
      </div>
    </div>
  )
}
