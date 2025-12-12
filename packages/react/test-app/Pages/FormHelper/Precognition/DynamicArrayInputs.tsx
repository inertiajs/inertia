import { useForm } from '@inertiajs/react'

export default () => {
  const form = useForm({
    items: [] as Array<{ name: string }>,
  })
    .withPrecognition('post', '/precognition/dynamic-array-inputs')
    .setValidationTimeout(100)

  function addItem() {
    form.setData('items', [...form.data.items, { name: '' }])
  }

  function updateItem(index: number, value: string) {
    const items = [...form.data.items]
    items[index] = { name: value }
    form.setData('items', items)
  }

  return (
    <div>
      <button id="add-item" onClick={addItem}>
        Add Item
      </button>

      {form.data.items.map((item, idx) => (
        <div key={idx}>
          <input
            value={item.name}
            name={`items.${idx}.name`}
            onChange={(e) => updateItem(idx, e.target.value)}
            onBlur={() => form.validate(`items.${idx}.name`)}
          />
          {form.invalid(`items.${idx}.name`) && <p id={`items.${idx}.name-error`}>{form.errors[`items.${idx}.name`]}</p>}
          {form.valid(`items.${idx}.name`) && <p>Valid!</p>}
        </div>
      ))}

      {form.validating && <p>Validating...</p>}
    </div>
  )
}
