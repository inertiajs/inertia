<script lang="ts">
  import { Form } from '@inertiajs/svelte'

  let show = true
</script>

<div>
  <h1>Form Unmount Race</h1>

  {#if show}
    <Form action="/dump/post" method="post">
      <input type="text" name="name" id="name" value="John" />
    </Form>
  {/if}

  <button id="hide" on:click={() => (show = false)}>Hide Form</button>
</div>
