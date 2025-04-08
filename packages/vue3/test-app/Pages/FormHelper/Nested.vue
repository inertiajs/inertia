<script setup>
import { useForm } from '@inertiajs/vue3'

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

const updateData = (key, value) => {
  form.setData(key, value)
}

const submit = () => {
  form.submit('post', '/dump/post')
}
</script>

<template>
  <div>
    <label>
      Full Name
      <input type="text" id="name" v-model="form.name" @input="updateData('name', form.data.name)" />
    </label>
    <label>
      Street
      <input type="text" id="street" v-model="form.address.street" />
    </label>
    <label>
      City
      <input type="text" id="city" v-model="form.address.city" />
    </label>
    <label>
      Foo
      <input type="checkbox" id="foo" value="foo" v-model="form.checked" />
    </label>
    <label>
      Bar
      <input type="checkbox" id="bar" value="bar" v-model="form.checked" />
    </label>
    <label>
      Baz
      <input type="checkbox" id="baz" value="baz" v-model="form.checked" />
    </label>
    <label>
      Organization Name
      <input type="text" id="organization-name" v-model="form.organization.name" />
    </label>
    <label>
      Repository Name
      <input type="text" id="repo-name" v-model="form.organization.repo.name" />
    </label>
    Repository Tags
    <label>
      v0.1
      <input type="checkbox" id="tag-0" value="v0.1" v-model="form.organization.repo.tags" />
    </label>
    <label>
      v0.2
      <input type="checkbox" id="tag-1" value="v0.2" v-model="form.organization.repo.tags" />
    </label>
    <label>
      v0.3
      <input type="checkbox" id="tag-2" value="v0.3" v-model="form.organization.repo.tags" />
    </label>
    <button @click="submit" class="submit">Submit form</button>
  </div>
  {{ form }}
</template>
