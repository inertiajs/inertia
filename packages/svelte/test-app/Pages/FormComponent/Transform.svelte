<script lang="ts">
  import { Form } from '@inertiajs/svelte'
  import type { FormDataConvertible } from '@inertiajs/core'

  let transformType = $state('none')

  const getTransform = (type: string) => {
    switch (type) {
      case 'uppercase':
        return (data: Record<string, FormDataConvertible>) => ({
          ...data,
          name: typeof data.name === 'string' ? data.name.toUpperCase() : data.name,
        })
      case 'format':
        return (data: Record<string, FormDataConvertible>) => ({
          ...data,
          fullName: `${data.firstName} ${data.lastName}`,
        })
      default:
        return (data: Record<string, FormDataConvertible>) => data
    }
  }

  let transform = $derived(getTransform(transformType))
</script>

<div>
  <h1>Transform Function</h1>

  <div>
    <button onclick={() => (transformType = 'none')}>None</button>
    <button onclick={() => (transformType = 'uppercase')}>Uppercase</button>
    <button onclick={() => (transformType = 'format')}>Format</button>
  </div>

  <div>Current transform: {transformType}</div>

  <Form action="/dump/post" method="post" {transform}>
    <div>
      <input type="text" name="name" placeholder="Name" value="John Doe" />
    </div>

    <div>
      <input type="text" name="firstName" placeholder="First Name" value="John" />
    </div>

    <div>
      <input type="text" name="lastName" placeholder="Last Name" value="Doe" />
    </div>

    <div>
      <button type="submit"> Submit with Transform </button>
    </div>
  </Form>
</div>
