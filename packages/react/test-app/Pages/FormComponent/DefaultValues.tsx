import { Form } from '@inertiajs/react'

export default function DefaultValues() {
  return (
    <div>
      <h1>Form with Default Values</h1>

      <Form
        action="/dump/post"
        method="post"
        defaultValues={{
          name: 'John Doe',
          email: 'john@example.com',
          role: 'admin',
          newsletter: true,
          preferences: 'option2',
        }}
      >
        {({ isDirty, hasErrors, errors }) => (
          <>
            {/* State display for testing */}
            <div>Form is {isDirty ? 'dirty' : 'clean'}</div>
            {hasErrors && <div>Form has errors</div>}
            {errors.name && <div id="error_name">{errors.name}</div>}

            <div>
              <label htmlFor="name">Name:</label>
              <input type="text" name="name" id="name" />
            </div>

            <div>
              <label htmlFor="email">Email:</label>
              <input type="email" name="email" id="email" />
            </div>

            <div>
              <label htmlFor="role">Role:</label>
              <select name="role" id="role">
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
              </select>
            </div>

            <div>
              <label>
                <input type="checkbox" name="newsletter" />
                Subscribe to newsletter
              </label>
            </div>

            <div>
              <label>Preferences:</label>
              <label>
                <input type="radio" name="preferences" value="option1" />
                Option 1
              </label>
              <label>
                <input type="radio" name="preferences" value="option2" />
                Option 2
              </label>
              <label>
                <input type="radio" name="preferences" value="option3" />
                Option 3
              </label>
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
