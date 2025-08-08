<script setup>
import { useForm, usePage } from '@inertiajs/vue3'

const page = usePage()

const form = useForm({
  name: '',
  email: '',
  message: '',
})

// Enable autosave on form creation
form.autosave = true
form.autosaveOptions = {
  url: '/form-helper/basic-auto-save/autosave',
  method: 'post',
  debounce: 2000,
  onSaveSuccess: () => {
    console.log('Auto-saved successfully')
  },
  onSaveError: (errors) => {
    console.error('Auto-save failed', errors)
  }
}

const submit = () => {
  form.post(page.url)
}

const disableAutoSave = () => {
  form.disableAutoSave()
}

const enableAutoSave = () => {
  form.enableAutoSave({
    url: '/form-helper/basic-auto-save/autosave',
    method: 'post',
    debounce: 2000,
  })
}
</script>

<template>
  <div>
    <h2>Basic Auto-Save Example</h2>
    <p>This form auto-saves every 2 seconds when the form data changes.</p>
    
    <form @submit.prevent="submit">
      <label>
        Name
        <input type="text" name="name" v-model="form.name" placeholder="Enter your name" />
      </label>
      <span class="error" v-if="form.errors.name">{{ form.errors.name }}</span>
      
      <label>
        Email
        <input type="email" name="email" v-model="form.email" placeholder="Enter your email" />
      </label>
      <span class="error" v-if="form.errors.email">{{ form.errors.email }}</span>
      
      <label>
        Message
        <textarea name="message" v-model="form.message" rows="4" placeholder="Enter your message"></textarea>
      </label>
      <span class="error" v-if="form.errors.message">{{ form.errors.message }}</span>

      <div class="actions">
        <button type="submit" :disabled="form.processing">
          {{ form.processing ? 'Submitting...' : 'Submit' }}
        </button>
        
        <button type="button" @click="disableAutoSave">
          Disable Auto-Save
        </button>
        
        <button type="button" @click="enableAutoSave">
          Enable Auto-Save
        </button>
      </div>
    </form>

    <div class="status">
      <p>Form is {{ form.isDirty ? 'dirty' : 'clean' }}</p>
      <p>Auto-save is {{ form.autosave ? 'enabled' : 'disabled' }}</p>
      <p v-if="form.hasErrors">Form has errors</p>
      <p v-if="form.wasSuccessful" class="success">Form submitted successfully!</p>
    </div>
  </div>
</template>

<style scoped>
label {
  display: block;
  margin-bottom: 15px;
}

input, textarea {
  display: block;
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

button {
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #007bff;
  color: white;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.status {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.success {
  color: green;
  font-weight: bold;
}

.error {
  color: red;
  font-size: 14px;
  margin-top: 5px;
  display: block;
}
</style>
