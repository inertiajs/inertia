<script lang="ts">
  import { Form } from '@inertiajs/svelte'

  let items: Array<{ name: string }> = []

  function addItem() {
    items = [...items, { name: '' }]
  }
</script>

<div>
  <button id="add-item" on:click={addItem}>Add Item</button>

  <Form action="/precognition/dynamic-array-inputs" method="post" validationTimeout={100} let:invalid let:errors let:validate let:validating>
    {#each items as item, idx}
      <div>
        <input bind:value={item.name} name={`items.${idx}.name`} on:blur={() => validate(`items.${idx}.name`)} />
        {#if invalid(`items.${idx}.name`)}<p id={`items.${idx}.name-error`}>{errors[`items.${idx}.name`]}</p>{/if}
      </div>
    {/each}

    {#if validating}<p>Validating...</p>{/if}
  </Form>
</div>
