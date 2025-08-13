/**
 * Resets specified form fields to their default values
 * @param {HTMLFormElement} formElement - The form element containing the fields
 * @param {string[]} fieldNames - Array of field names to reset
 */
export function resetFormFields(formElement: HTMLFormElement, fieldNames?: string[]): void {
  if (!(formElement instanceof HTMLFormElement)) {
    throw new Error('First argument must be a valid HTMLFormElement');
  }

  if (fieldNames === undefined || fieldNames.length === 0) {
    formElement.reset();
    return;
  }

  fieldNames.forEach((fieldName) => {
    const namedItems = (formElement as any).elements?.namedItem(fieldName);
    if (!namedItems) return;

    const elements = namedItems instanceof RadioNodeList ? Array.from(namedItems) : [namedItems];

    elements.forEach((element: any) => {
      if (element instanceof HTMLSelectElement) {
        Array.from(element.options).forEach((option) => {
          option.selected = option.defaultSelected;
        });
      } else if (element instanceof HTMLTextAreaElement) {
        element.value = element.defaultValue || '';
      } else if (element instanceof HTMLInputElement) {
        const type = (element.type || '').toLowerCase();
        if (type === 'checkbox' || type === 'radio') {
          element.checked = element.defaultChecked;
        } else if (type === 'file') {
          element.value = '';
        } else if (type !== 'button' && type !== 'submit' && type !== 'reset' && type !== 'image') {
          element.value = element.defaultValue || '';
        }
      }

      // Dispatch a change event for each element updated
      element.dispatchEvent(new Event('change', { bubbles: true }));
    });
  });
}