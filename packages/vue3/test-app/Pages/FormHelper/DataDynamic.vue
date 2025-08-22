<script setup>
import { useForm, usePage } from '@inertiajs/vue3'
import { reactive, watch } from 'vue'

const form = useForm({
  name: 'foo',
  handle: 'example',
  remember: false,
  custom: {},
})

const page = usePage()

const submit = () => {
  form.post(page.url)
}

const addCustomOtherProp = () => {
  form.custom.other_prop = 'dynamic_value' // Add nested dynamic property
}

const formDataOutput = reactive({
  json: '',
})
watch(
  () => form.data(),
  (newData) => {
    formDataOutput.json = JSON.stringify(newData)
  },
  { deep: true, immediate: true },
)
</script>

<template>
  <div>
    <label>
      Full Name
      <input type="text" id="name" name="name" v-model="form.name" />
    </label>
    <span class="name_error" v-if="form.errors.name">{{ form.errors.name }}</span>

    <label>
      Accept Terms and Conditions
      <input type="checkbox" id="accept_tos" name="accept_tos" v-model="form.accept_tos" />
    </label>
    <span class="accept_tos_error" v-if="form.errors.accept_tos">{{ form.errors.accept_tos }}</span>

    <button @click="submit" class="submit">Submit form</button>

    <button @click="addCustomOtherProp" class="add-custom-other-prop">Add custom.other_prop</button>

    <div id="form-data-output" data-test-id="form-data-output" style="display: none">{{ formDataOutput.json }}</div>
  </div>
</template>
