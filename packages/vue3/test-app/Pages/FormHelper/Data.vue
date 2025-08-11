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

const resetAll = () => {
  form.reset()
}

const resetOne = () => {
  form.reset('handle')
}

const reassign = () => {
  form.defaults()
}

const reassignObject = () => {
  form.defaults({
    handle: 'updated handle',
    remember: true,
  })
}

const reassignSingle = () => {
  form.defaults('name', 'single value')
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
      Handle
      <input type="text" id="handle" name="handle" v-model="form.handle" />
    </label>
    <span class="handle_error" v-if="form.errors.handle">{{ form.errors.handle }}</span>
    <label>
      Remember Me
      <input type="checkbox" id="remember" name="remember" v-model="form.remember" />
    </label>
    <span class="remember_error" v-if="form.errors.remember">{{ form.errors.remember }}</span>
    <label>
      Accept Terms and Conditions
      <input type="checkbox" id="accept_tos" name="accept_tos" v-model="form.accept_tos" />
    </label>
    <span class="accept_tos_error" v-if="form.errors.accept_tos">{{ form.errors.accept_tos }}</span>

    <button @click="submit" class="submit">Submit form</button>

    <button @click="resetAll" class="reset">Reset all data</button>
    <button @click="resetOne" class="reset-one">Reset one field</button>

    <button @click="reassign" class="reassign">Reassign current as defaults</button>
    <button @click="reassignObject" class="reassign-object">Reassign default values</button>
    <button @click="reassignSingle" class="reassign-single">Reassign single default</button>

    <button @click="addCustomOtherProp" class="add-custom-other-prop">Add custom.other_prop</button>

    <span class="errors-status">Form has {{ form.hasErrors ? '' : 'no ' }}errors</span>

    <div id="form-data-output" data-test-id="form-data-output" style="display: none">{{ formDataOutput.json }}</div>
  </div>
</template>
