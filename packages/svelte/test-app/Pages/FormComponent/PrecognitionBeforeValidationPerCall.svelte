<script lang="ts">
  import { Form } from '@inertiajs/svelte'

  let blockedFirst = false
  let blockedSecond = false

  const handleBeforeValidationFirst = () => {
    blockedFirst = true
    return false
  }

  const handleBeforeValidationSecond = () => {
    blockedSecond = true
    return false
  }
</script>

<div>
  <h1>Precognition - onBeforeValidation Per Call</h1>

  <Form action="/form-component/precognition" method="post" let:validate let:validating>
    {#if validating}
      <p class="validating">Validating...</p>
    {/if}
    {#if blockedFirst}
      <p class="blocked-first">Blocked by first callback</p>
    {/if}
    {#if blockedSecond}
      <p class="blocked-second">Blocked by second callback</p>
    {/if}

    <div>
      <input id="name-input" name="name" />
    </div>

    <!-- This button uses first callback -->
    <button
      type="button"
      on:click={() =>
        validate('name', {
          onBeforeValidation: handleBeforeValidationFirst,
        })}
    >
      Validate with First
    </button>

    <!-- This button uses second callback -->
    <button
      type="button"
      on:click={() =>
        validate('name', {
          onBeforeValidation: handleBeforeValidationSecond,
        })}
    >
      Validate with Second
    </button>

    <button type="submit">Submit</button>
  </Form>
</div>
