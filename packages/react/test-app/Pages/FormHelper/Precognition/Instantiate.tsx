import { Method, UrlMethodPair } from '@inertiajs/core'
import { useForm } from '@inertiajs/react'
import { useState } from 'react'

export default () => {
  const wayfinderUrl = (): UrlMethodPair => ({
    url: '/precognition/default',
    method: 'post',
  })

  const [form, setForm] = useState<keyof typeof forms>('default')
  const data = () => ({ name: 'a' })

  const forms = {
    // Forms that use the new withPrecognition() method
    default: useForm(data()).withPrecognition('post', '/precognition/default'),
    dynamic: useForm(data()).withPrecognition(
      () => 'post',
      () => '/precognition/default',
    ),
    wayfinder: useForm(data()).withPrecognition(wayfinderUrl()),
    dynamicWayfinder: useForm(data()).withPrecognition(() => wayfinderUrl()),

    // Forms that use the original useForm() parameters from the 0.x Precognition implementation
    legacy: useForm('post', '/precognition/default', data()),
    legacyDynamic: useForm(
      () => 'post' as Method,
      () => '/precognition/default',
      data(),
    ),
    legacyWayfinder: useForm(wayfinderUrl(), data()),
    legacyDynamicWayfinder: useForm(() => wayfinderUrl(), data()),
  }

  const validateForm = (formName: keyof typeof forms) => {
    forms[formName].touch('name')
    forms[formName].validate()
  }

  const submitWithoutArgs = (formName: keyof typeof forms) => {
    forms[formName].submit()
  }

  const submitWithArgs = (formName: keyof typeof forms) => {
    forms[formName].submit('patch', '/dump/patch')
  }

  const submitWithMethod = (formName: keyof typeof forms) => {
    forms[formName].put('/dump/put')
  }

  const submitWithWayfinder = (formName: keyof typeof forms) => {
    forms[formName].submit({ url: '/dump/post', method: 'post' })
  }

  return (
    <div>
      <select value={form} onChange={(e) => setForm(e.target.value as keyof typeof forms)}>
        <option value="default">withPrecognition()</option>
        <option value="dynamic">withPrecognition() dynamic</option>
        <option value="wayfinder">withPrecognition() Wayfinder</option>
        <option value="dynamicWayfinder">withPrecognition() dynamic Wayfinder</option>
        <option value="legacy">useForm() legacy</option>
        <option value="legacyDynamic">useForm() legacy dynamic</option>
        <option value="legacyWayfinder">useForm() legacy Wayfinder</option>
        <option value="legacyDynamicWayfinder">useForm() legacy dynamic Wayfinder</option>
      </select>

      <button onClick={() => validateForm(form)}>Validate</button>
      <button onClick={() => submitWithoutArgs(form)}>Submit without args</button>
      <button onClick={() => submitWithArgs(form)}>Submit with args</button>
      <button onClick={() => submitWithMethod(form)}>Submit with method</button>
      <button onClick={() => submitWithWayfinder(form)}>Submit with Wayfinder</button>

      {forms[form].validating && <p>Validating...</p>}
      {forms[form].errors.name && <p>{forms[form].errors.name}</p>}
    </div>
  )
}
