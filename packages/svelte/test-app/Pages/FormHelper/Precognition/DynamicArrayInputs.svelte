<script lang="ts">
  import { useForm } from '@inertiajs/svelte'

  const form = useForm({
    items: [] as Array<{ name: string }>,
  })
    .withPrecognition('post', '/precognition/dynamic-array-inputs')
    .setValidationTimeout(100)

  function addItem() {
    form.items = [...form.items, { name: '' }]
  }
</script>

<div>
  <button id="add-item" onclick={addItem}>Add Item</button>

  {#each form.items as item, idx (idx)}
    <div>
      <input bind:value={item.name} name={`items.${idx}.name`} onblur={() => form.validate(`items.${idx}.name`)} />
      {#if form.invalid(`items.${idx}.name`)}<p id={`items.${idx}.name-error`}>
          {form.errors[`items.${idx}.name`]}
        </p>{/if}
      {#if form.valid(`items.${idx}.name`)}<p>Valid!</p>{/if}
    </div>
  {/each}

  {#if form.validating}<p>Validating...</p>{/if}
</div>
