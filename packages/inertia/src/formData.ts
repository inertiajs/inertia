import { FormDataConvertible } from './types'

export function objectToFormData(
  source: Record<string, FormDataConvertible>,
  form: FormData = new FormData(),
  parentKey: string|null = null,
): FormData {
  source = source || {}

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      append(form, composeKey(parentKey, key), source[key])
    }
  }

  return form
}

function composeKey(parent: string|null, key: string) : string {
  return parent ? parent + '[' + key + ']' : key
}

function append(
  form: FormData,
  key: string,
  value: FormDataConvertible|Record<string, FormDataConvertible>,
): void {
  if (value instanceof Date) {
    return form.append(key, value.toISOString())
  } else if (value instanceof File) {
    return form.append(key, value, value.name)
  } else if (value instanceof Blob) {
    return form.append(key, value)
  } else if (typeof value === 'boolean') {
    return form.append(key, value ? '1' : '0')
  } else if (typeof value === 'string') {
    return form.append(key, value)
  } else if (typeof value === 'number') {
    return form.append(key, `${value}`)
  } else if (value === null || value === undefined) {
    return form.append(key, '')
  }

  objectToFormData(value, form, key)
}
