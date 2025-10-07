<script lang="ts">
  import { Form } from '@inertiajs/svelte'

  let blocked = false
  let dataCorrect = false

  const handleBeforeValidation = (
    newRequest: { data: Record<string, any>; touched: string[] },
    oldRequest: { data: Record<string, any>; touched: string[] },
  ) => {
    // Verify the data structure is correct
    const hasNewData = typeof newRequest.data === 'object' && newRequest.data !== null
    const hasNewTouched = Array.isArray(newRequest.touched)
    const hasOldData = typeof oldRequest.data === 'object' && oldRequest.data !== null
    const hasOldTouched = Array.isArray(oldRequest.touched)
    const hasNameField = 'name' in newRequest.data
    const touchedContainsName = newRequest.touched.includes('name')

    dataCorrect = hasNewData && hasNewTouched && hasOldData && hasOldTouched && hasNameField && touchedContainsName

    // Block validation if name is "block"
    if (newRequest.data.name === 'block') {
      blocked = true
      return false
    }

    blocked = false
    return true
  }
</script>

<div>
  <h1>Precognition - onBeforeValidation</h1>

  <Form action="/form-component/precognition" method="post" let:errors let:invalid let:validate let:validating>
    <div>
      <label for="name">Name:</label>
      <input
        id="name"
        name="name"
        on:change={() =>
          validate('name', {
            onBeforeValidation: handleBeforeValidation,
          })}
      />
      {#if invalid('name')}
        <p class="error">{errors.name}</p>
      {/if}
    </div>

    <div>
      <label for="email">Email:</label>
      <input id="email" name="email" on:change={() => validate('email')} />
      {#if invalid('email')}
        <p class="error">{errors.email}</p>
      {/if}
    </div>

    {#if validating}
      <p class="validating">Validating...</p>
    {/if}
    {#if blocked}
      <p class="blocked">Validation blocked by onBeforeValidation</p>
    {/if}
    {#if dataCorrect}
      <p class="data-correct">Data structure is correct</p>
    {/if}

    <button type="submit">Submit</button>
  </Form>
</div>
