import { Form } from '@inertiajs/react'
import { useState } from 'react'

export default () => {
  const [items, setItems] = useState<Array<{ name: string }>>([])

  function addItem() {
    setItems([...items, { name: '' }])
  }

  function updateItem(index: number, value: string) {
    const newItems = [...items]
    newItems[index] = { name: value }
    setItems(newItems)
  }

  return (
    <div>
      <button id="add-item" onClick={addItem}>
        Add Item
      </button>

      <Form action="/precognition/dynamic-array-inputs" method="post" validationTimeout={100}>
        {({ invalid, errors, validate, validating }) => (
          <>
            {items.map((item, idx) => (
              <div key={idx}>
                <input
                  value={item.name}
                  name={`items.${idx}.name`}
                  onChange={(e) => updateItem(idx, e.target.value)}
                  onBlur={() => validate(`items.${idx}.name`)}
                />
                {invalid(`items.${idx}.name`) && <p id={`items.${idx}.name-error`}>{errors[`items.${idx}.name`]}</p>}
              </div>
            ))}

            {validating && <p>Validating...</p>}
          </>
        )}
      </Form>
    </div>
  )
}
