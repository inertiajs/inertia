import Layout from '../Components/Layout'
import { Form, Head } from '@inertiajs/react'

const FormComponent = () => {
  return (
    <>
      <Head title="Form Component" />

      <h1 className="text-3xl">Form Component</h1>

      <Form
        method="post"
        action="/form-component"
        data={{ additional: 'data' }}
        className="mt-6 max-w-md space-y-4"
      >
        {({ errors, reset, isDirty, processing }) => (
          <>
            {isDirty && (
              <div className="my-5 rounded border border-amber-100 bg-amber-50 p-3 text-amber-800">
                There are unsaved changes!
              </div>
            )}

            <div className="space-y-4 *:w-full *:border *:p-2">
              <input type="text" name="name" id="name" placeholder="Name" />

              <select name="role" id="role" defaultValue="">
                <option value="" disabled>Role</option>
                <option>User</option>
                <option>Admin</option>
                <option>Super</option>
              </select>

              <div className="flex gap-4">
                <label><input type="radio" name="plan" value="free" /> Free</label>
                <label><input type="radio" name="plan" value="pro" /> Pro</label>
                <label><input type="radio" name="plan" value="enterprise" /> Enterprise</label>
              </div>

              <div>
                <input type="checkbox" name="subscribe" value="yes" id="subscribe" />
                <label htmlFor="subscribe">Subscribe to newsletter</label>
              </div>

              <div className="flex gap-4">
                <label><input type="checkbox" name="interests[]" value="sports" /> Sports</label>
                <label><input type="checkbox" name="interests[]" value="music" /> Music</label>
                <label><input type="checkbox" name="interests[]" value="tech" /> Tech</label>
              </div>

              <select name="skills[]" id="skills" multiple defaultValue="">
                <option disabled value="">Skills</option>
                <option value="vue">Vue</option>
                <option value="react">React</option>
                <option value="angular">Angular</option>
                <option value="svelte">Svelte</option>
              </select>

              <input type="file" name="avatar" id="avatar" placeholder="Avatar" />
              <input type="file" name="documents[]" id="documents" multiple placeholder="Documents" />

              <textarea name="bio" id="bio" rows={3} placeholder="Bio" />

              <input type="hidden" name="token" value="abc123" />

              <input type="number" name="age" id="age" placeholder="Age" />

              <input type="text" name="user[address][street]" placeholder="Street" />

              <input type="text" name="items[0][name]" defaultValue="Item A" />
              <input type="text" name="items[1][name]" defaultValue="Item B" />

              <input type="text" name="disabled_field" value="Ignore me" disabled />
            </div>

            {Object.entries(errors).map(([field, error]) => (
              <div key={field} className="mt-2 text-red-600">
                {field}: {error}
              </div>
            ))}

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={processing}
                className="rounded bg-slate-800 px-6 py-2 text-white"
              >
                Submit
              </button>
              <button type="button" onClick={reset}>
                Reset
              </button>
            </div>
          </>
        )}
      </Form>
    </>
  )
}

FormComponent.layout = (page) => <Layout children={page} />

export default FormComponent
