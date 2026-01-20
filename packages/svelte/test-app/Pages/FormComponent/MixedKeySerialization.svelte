<script>
  import { Form } from '@inertiajs/svelte'
</script>

<div>
  <h1>Mixed Key Serialization</h1>

  <Form action="/dump/post" method="post">
    <div>
      <input type="text" name="fields[entries][100][name]" placeholder="Name for ID 100" value="John Doe" />
    </div>

    <div>
      <input type="email" name="fields[entries][100][email]" placeholder="Email for ID 100" value="john@example.com" />
    </div>

    <div>
      <input type="text" name="fields[entries][new:1][name]" placeholder="Name for new entry" value="Jane Smith" />
    </div>

    <div>
      <input
        type="email"
        name="fields[entries][new:1][email]"
        placeholder="Email for new entry"
        value="jane@example.com"
      />
    </div>

    <button type="submit">Submit</button>
  </Form>
</div>
