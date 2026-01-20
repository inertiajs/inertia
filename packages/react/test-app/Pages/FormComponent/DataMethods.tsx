import { Form } from '@inertiajs/react'

export default () => {
  return (
    <div>
      <h1>Test getData() and getFormData() Methods</h1>

      <Form>
        {({ getData, getFormData }) => (
          <>
            <input type="text" name="name" id="name" />

            <button
              type="button"
              onClick={() => {
                const data = getData()
                console.log('getData result: ' + JSON.stringify(data))
              }}
            >
              Test getData()
            </button>

            <button
              type="button"
              onClick={() => {
                const formData = getFormData()
                console.log('getFormData entries: ' + JSON.stringify(Object.fromEntries(formData.entries())))
              }}
            >
              Test getFormData()
            </button>
          </>
        )}
      </Form>
    </div>
  )
}
