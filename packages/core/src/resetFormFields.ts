export const FormComponentResetSymbol = Symbol('FormComponentReset')

type FormElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement

function isFormElement(element: Element): element is FormElement {
  return (
    element instanceof HTMLInputElement ||
    element instanceof HTMLSelectElement ||
    element instanceof HTMLTextAreaElement
  )
}

function resetInputElement(input: HTMLInputElement, defaultValues: FormDataEntryValue[]): boolean {
  const oldValue = input.value
  const oldChecked = input.checked

  switch (input.type.toLowerCase()) {
    case 'checkbox':
      // For checkboxes, check if the input's value is in the array of default values
      input.checked = defaultValues.includes(input.value)
      break
    case 'radio':
      // For radios, only use the first default value to avoid multiple radios being checked
      input.checked = defaultValues[0] === input.value
      break
    case 'file':
      input.value = ''
      break
    case 'button':
    case 'submit':
    case 'reset':
    case 'image':
      // These input types don't carry form state
      break
    default:
      // text, email, number, date, etc. - use first default value
      input.value = defaultValues[0] !== null && defaultValues[0] !== undefined ? String(defaultValues[0]) : ''
  }

  // Return true if the value actually changed
  return input.value !== oldValue || input.checked !== oldChecked
}

function resetSelectElement(select: HTMLSelectElement, defaultValues: FormDataEntryValue[]): boolean {
  const oldValue = select.value
  const oldSelectedOptions = Array.from(select.selectedOptions).map((opt) => opt.value)

  if (select.multiple) {
    // For multi-select, select all options that match any of the default values
    const defaultStrings = defaultValues.map((value) => String(value))

    Array.from(select.options).forEach((option) => {
      option.selected = defaultStrings.includes(option.value)
    })
  } else {
    // For single select, use the first default value (or empty string)
    select.value = defaultValues[0] !== undefined ? String(defaultValues[0]) : ''
  }

  // Check if selection actually changed
  const newSelectedOptions = Array.from(select.selectedOptions).map((opt) => opt.value)
  const hasChanged = select.multiple
    ? JSON.stringify(oldSelectedOptions.sort()) !== JSON.stringify(newSelectedOptions.sort())
    : select.value !== oldValue

  return hasChanged
}

function resetFormElement(element: FormElement, defaultValues: FormDataEntryValue[]): boolean {
  if (element.disabled) {
    // For disabled elements, use their DOM defaultValue since they're not in FormData
    if (element instanceof HTMLInputElement) {
      const oldValue = element.value
      const oldChecked = element.checked

      switch (element.type.toLowerCase()) {
        case 'checkbox':
        case 'radio':
          element.checked = element.defaultChecked
          return element.checked !== oldChecked
        case 'file':
          element.value = ''
          return oldValue !== ''
        case 'button':
        case 'submit':
        case 'reset':
        case 'image':
          // These input types don't carry form state
          return false
        default:
          element.value = element.defaultValue
          return element.value !== oldValue
      }
    } else if (element instanceof HTMLSelectElement) {
      // Reset select to default selected options
      const oldSelectedOptions = Array.from(element.selectedOptions).map((opt) => opt.value)

      Array.from(element.options).forEach((option) => {
        option.selected = option.defaultSelected
      })

      const newSelectedOptions = Array.from(element.selectedOptions).map((opt) => opt.value)
      return JSON.stringify(oldSelectedOptions.sort()) !== JSON.stringify(newSelectedOptions.sort())
    } else if (element instanceof HTMLTextAreaElement) {
      const oldValue = element.value
      element.value = element.defaultValue
      return element.value !== oldValue
    }

    return false
  }

  if (element instanceof HTMLInputElement) {
    // Pass all default values to handle checkboxes and radios correctly
    return resetInputElement(element, defaultValues)
  } else if (element instanceof HTMLSelectElement) {
    return resetSelectElement(element, defaultValues)
  } else if (element instanceof HTMLTextAreaElement) {
    const oldValue = element.value
    element.value = defaultValues[0] !== undefined ? String(defaultValues[0]) : ''
    return element.value !== oldValue
  }

  return false
}

function resetFieldElements(
  elements: Element | RadioNodeList | HTMLCollection,
  defaultValues: FormDataEntryValue[],
): boolean {
  let hasChanged = false

  if (elements instanceof RadioNodeList || elements instanceof HTMLCollection) {
    // Handle multiple elements with the same name (e.g., radio buttons, checkboxes, array fields)
    Array.from(elements).forEach((node, index) => {
      if (node instanceof Element && isFormElement(node)) {
        if (node instanceof HTMLInputElement && ['checkbox', 'radio'].includes(node.type.toLowerCase())) {
          // For checkboxes and radios, pass all default values for value-based matching
          if (resetFormElement(node, defaultValues)) {
            hasChanged = true
          }
        } else {
          // For other array elements (like text inputs), use index-based matching
          const indexedDefaultValues =
            defaultValues[index] !== undefined ? [defaultValues[index]] : [defaultValues[0] ?? null].filter(Boolean)

          if (resetFormElement(node, indexedDefaultValues)) {
            hasChanged = true
          }
        }
      }
    })
  } else if (isFormElement(elements)) {
    // Handle single element - pass all default values (important for multi-selects)
    hasChanged = resetFormElement(elements, defaultValues)
  }

  return hasChanged
}

export function resetFormFields(formElement: HTMLFormElement, defaults: FormData, fieldNames?: string[]): void {
  if (!formElement) {
    return
  }

  const resetEntireForm = !fieldNames || fieldNames.length === 0

  // If no specific fields provided, reset the entire form
  if (resetEntireForm) {
    // Get all field names from both defaults and form elements (including disabled ones)
    const formData = new FormData(formElement)
    const formElementNames = Array.from(formElement.elements)
      .map((el) => (isFormElement(el) ? el.name : ''))
      .filter(Boolean)
    fieldNames = [...new Set([...defaults.keys(), ...formData.keys(), ...formElementNames])]
  }

  let hasChanged = false

  fieldNames!.forEach((fieldName) => {
    const elements = formElement.elements.namedItem(fieldName)

    if (elements) {
      if (resetFieldElements(elements, defaults.getAll(fieldName))) {
        hasChanged = true
      }
    }
  })

  // Dispatch reset event to notify listeners that the form was reset programmatically
  if (hasChanged && resetEntireForm) {
    // Use Symbol in detail so adapters can preventDefault() to avoid Firefox's native reset behavior
    formElement.dispatchEvent(
      new CustomEvent('reset', { bubbles: true, cancelable: true, detail: { [FormComponentResetSymbol]: true } }),
    )
  }
}
