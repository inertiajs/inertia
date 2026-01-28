<script setup lang="ts">
// This component is used for checking the TypeScript implementation; there is no Playwright test depending on it.
import { useForm } from '@inertiajs/vue3'

const defaultForm = useForm({})
const rememberForm = useForm('id', {})

// @ts-expect-error - No Precognition...
defaultForm.validate()
// @ts-expect-error - No Precognition...
rememberForm.validate()

const precognitionForm = useForm({ name: '', company: '' }).withPrecognition('post', '/precognition/default')
const originalPrecognitionForm = useForm('post', '/', {})

precognitionForm.validate()
originalPrecognitionForm.validate()

precognitionForm.validate('name')
precognitionForm.validate({ only: ['name'] })
precognitionForm.touch('name')
precognitionForm.touch('name', 'company')
precognitionForm.touched()
precognitionForm.touched('name')
precognitionForm.invalid('name')
precognitionForm.valid('name')

// @ts-expect-error - Field does not exist
precognitionForm.validate('email')
// @ts-expect-error - Field does not exist
precognitionForm.validate({ only: ['email'] })
// @ts-expect-error - Field does not exist
precognitionForm.touch('email')
// @ts-expect-error - Field does not exist
precognitionForm.touched('email')
// @ts-expect-error - Field does not exist
precognitionForm.invalid('email')
// @ts-expect-error - Field does not exist
precognitionForm.valid('email')

const nestedForm = useForm({ user: { name: '', company: '' } }).withPrecognition('post', '/precognition/nested')

nestedForm.validate('user.name')
nestedForm.validate({ only: ['user.name'] })
nestedForm.valid('user.name')
nestedForm.invalid('user.name')

// @ts-expect-error - Field does not exist
nestedForm.validate('user.email')
// @ts-expect-error - Field does not exist
nestedForm.validate({ only: ['user.email'] })
// @ts-expect-error - Field does not exist
nestedForm.valid('user.email')
// @ts-expect-error - Field does not exist
nestedForm.invalid('user.email')

type User = {
  name: string
  email: string
}

type Company = {
  name: string
  addresses: string[]
}

type FormData = {
  users: User[]
  profile: {
    age: number
    city: string
  }
  company: Company
  nested: {
    companies: Company[]
  }
}

const complexForm = useForm<FormData>({
  users: [],
  profile: {
    age: 0,
    city: '',
  },
  company: {
    name: '',
    addresses: [],
  },
  nested: {
    companies: [],
  },
}).withPrecognition('post', '/precognition/complex')

complexForm.validate('users')
complexForm.validate('users.*')
complexForm.validate('users.*.email')
complexForm.validate('users.*.*')

complexForm.validate('profile')
complexForm.validate('profile.*')
complexForm.validate('profile.age')

complexForm.validate('company')
complexForm.validate('company.addresses')

complexForm.validate('nested')
complexForm.validate('nested.companies')
complexForm.validate('nested.companies.*')
complexForm.validate('nested.companies.*.name')
complexForm.validate('nested.companies.*.addresses')
complexForm.validate('nested.companies.*.*')

// @ts-expect-error - No such field
complexForm.validate('users.*.street')
// @ts-expect-error - No such field
complexForm.validate('profile.country')
// @ts-expect-error - No such depth
complexForm.validate('profile.*.*')
// @ts-expect-error - No such field
complexForm.validate('company.address.city')
// @ts-expect-error - No such field
complexForm.validate('nested.companies.*.employees')
// @ts-expect-error - No such depth
complexForm.validate('nested.companies.*.*.*')
</script>
