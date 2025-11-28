import { Form } from '@inertiajs/react'

export default () => {
  return (
    <div>
      <h1>Form Precognition - Touch, Reset & Validate</h1>

      <Form action="/precognition/default" method="post" validationTimeout={100}>
        {({ invalid, errors, validate, touch, touched, validating, reset }) => (
          <>
            <div>
              <input name="name" placeholder="Name" onBlur={() => touch('name')} />
              {invalid('name') && <p>{errors.name}</p>}
            </div>

            <div>
              <input name="email" placeholder="Email" onBlur={() => touch('email')} />
              {invalid('email') && <p>{errors.email}</p>}
            </div>

            {validating && <p>Validating...</p>}

            <p id="name-touched">{touched('name') ? 'Name is touched' : 'Name is not touched'}</p>
            <p id="email-touched">{touched('email') ? 'Email is touched' : 'Email is not touched'}</p>
            <p id="any-touched">{touched() ? 'Form has touched fields' : 'Form has no touched fields'}</p>

            <button type="button" onClick={() => validate()}>
              Validate All Touched
            </button>
            <button type="button" onClick={() => validate('name')}>
              Validate Name
            </button>
            <button type="button" onClick={() => validate({ only: ['name', 'email'] })}>
              Validate Name and Email
            </button>
            <button type="button" onClick={() => touch('name', 'email')}>
              Touch Name and Email
            </button>
            <button
              type="button"
              onClick={() => {
                touch('name')
                touch('name')
              }}
            >
              Touch Name Twice
            </button>
            <button type="button" onClick={() => reset()}>
              Reset All
            </button>
            <button type="button" onClick={() => reset('name')}>
              Reset Name
            </button>
            <button type="button" onClick={() => reset('name', 'email')}>
              Reset Name and Email
            </button>
          </>
        )}
      </Form>
    </div>
  )
}
