<script>
  import { Form } from '@inertiajs/svelte'
  
  let transformType = 'none'
  
  $: getTransform = () => {
    switch (transformType) {
      case 'uppercase':
        return (data) => ({
          ...data,
          name: data.name?.toUpperCase()
        })
      case 'format':
        return (data) => ({
          ...data,
          fullName: `${data.firstName} ${data.lastName}`
        })
      default:
        return (data) => data
    }
  }
</script>

<div>
  <h1>Transform Function</h1>
  
  <div>
    <button on:click={() => transformType = 'none'}>None</button>
    <button on:click={() => transformType = 'uppercase'}>Uppercase</button>
    <button on:click={() => transformType = 'format'}>Format</button>
  </div>

  <div>Current transform: {transformType}</div>

  <Form action="/dump/post" method="post" transform={getTransform()}>
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
      <button type="submit">
        Submit with Transform
      </button>
    </div>
  </Form>
</div>