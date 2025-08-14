import { Form } from '@inertiajs/react'

export default ({ disable }: { disable: boolean }) => {
  return (
    <div>
      <h1>Form Disable While Processing Test</h1>

      <Form
        method="post"
        action={`/form-component/disable-while-processing/${disable ? 'yes' : 'no'}/submit`}
        disableWhileProcessing={disable}
      >
        {({ errors }) => (
          <>
            <div>
              <input type="text" name="name" placeholder="Name" defaultValue="John Doe" />
              {errors.name && <p id="error_name">{errors.name}</p>}
            </div>

            <div>
              <button type="submit">Submit</button>
            </div>
          </>
        )}
      </Form>
    </div>
  )
}
