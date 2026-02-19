<script lang="ts">
  import { Form } from '@inertiajs/svelte'

  let items: Array<{ name: string }> = $state([])

  function addItem() {
    items = [...items, { name: '' }]
  }
</script>

<div>
  <button id="add-item" onclick={addItem}>Add Item</button>

  <Form action="/precognition/dynamic-array-inputs" method="post" validationTimeout={100}>
    {#snippet children({ invalid, errors, validate, validating })}
      {#each items as item, idx (idx)}
        <div>
          <input bind:value={item.name} name={`items.${idx}.name`} onblur={() => validate(`items.${idx}.name`)} />
          {#if invalid(`items.${idx}.name`)}<p id={`items.${idx}.name-error`}>{errors[`items.${idx}.name`]}</p>{/if}
        </div>
      {/each}

      {#if validating}<p>Validating...</p>{/if}
    {/snippet}
  </Form>
</div>
