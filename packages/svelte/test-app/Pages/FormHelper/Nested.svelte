<script lang="ts">
  import { useForm } from '@inertiajs/svelte'

  const form = useForm({
    name: 'foo',
    address: {
      street: '123 Main St',
      city: 'New York',
    },
    organization: {
      name: 'Inertia',
      repo: {
        name: 'inertiajs/inertia',
        tags: ['v0.1', 'v0.2'],
      },
    },
    checked: ['foo', 'bar'],
  })

  const submit = () => {
    form.submit('post', '/dump/post')
  }
</script>

<div>
  <label>
    Full Name
    <input type="text" id="name" bind:value={form.name} />
  </label>
  <label>
    Street
    <input type="text" id="street" bind:value={form.address.street} />
  </label>
  <label>
    City
    <input type="text" id="city" bind:value={form.address.city} />
  </label>
  <label>
    Foo
    <input type="checkbox" id="foo" value="foo" bind:group={form.checked} />
  </label>
  <label>
    Bar
    <input type="checkbox" id="bar" value="bar" bind:group={form.checked} />
  </label>
  <label>
    Baz
    <input type="checkbox" id="baz" value="baz" bind:group={form.checked} />
  </label>
  <label>
    Organization Name
    <input type="text" id="organization-name" bind:value={form.organization.name} />
  </label>
  <label>
    Repository Name
    <input type="text" id="repo-name" bind:value={form.organization.repo.name} />
  </label>
  Repository Tags
  <label>
    v0.1
    <input type="checkbox" id="tag-0" value="v0.1" bind:group={form.organization.repo.tags} />
  </label>
  <label>
    v0.2
    <input type="checkbox" id="tag-1" value="v0.2" bind:group={form.organization.repo.tags} />
  </label>
  <label>
    v0.3
    <input type="checkbox" id="tag-2" value="v0.3" bind:group={form.organization.repo.tags} />
  </label>
  <button onclick={submit} class="submit">Submit form</button>
</div>
