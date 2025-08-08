<script setup>
import { useForm, usePage } from '@inertiajs/vue3'

const page = usePage()

const form = useForm({
  title: '',
  content: '',
  published: false,
})

// Enable autosave with advanced options
form.autosave = true
form.autosaveOptions = {
  url: page.url + '/autosave',
  method: 'post',
  debounce: 1000,
  onSaveSuccess: (page) => {
    console.log('Auto-saved successfully', page)
  },
  onSaveError: (errors) => {
    console.error('Auto-save failed', errors)
  }
}

const manualSubmit = () => {
  form.post(page.url)
}

const toggleAutoSave = () => {
  if (form.autosave) {
    form.autosave = false
  } else {
    form.autosave = true
    form.autosaveOptions = {
      url: page.url + '/autosave',
      method: 'post',
      debounce: 1000,
    }
  }
}
</script>

<template>
  <div>
    <h2>Auto-Save Form Example</h2>
    
    <div class="auto-save-status">
      Auto-save is currently: <strong>{{ form.autosave ? 'Enabled' : 'Disabled' }}</strong>
    </div>
    
    <form @submit.prevent="manualSubmit">
      <label>
        Title
        <input 
          type="text" 
          id="title" 
          name="title" 
          v-model="form.title" 
          placeholder="Enter a title..."
        />
      </label>
      <span class="title_error" v-if="form.errors.title">{{ form.errors.title }}</span>
      
      <label>
        Content
        <textarea 
          id="content" 
          name="content" 
          v-model="form.content" 
          placeholder="Write your content here..."
          rows="5"
        ></textarea>
      </label>
      <span class="content_error" v-if="form.errors.content">{{ form.errors.content }}</span>
      
      <label>
        Published
        <input type="checkbox" id="published" name="published" v-model="form.published" />
      </label>
      <span class="published_error" v-if="form.errors.published">{{ form.errors.published }}</span>

      <div class="form-actions">
        <button type="submit" class="submit" :disabled="form.processing">
          {{ form.processing ? 'Submitting...' : 'Submit' }}
        </button>
        
        <button type="button" @click="toggleAutoSave" class="toggle-autosave">
          {{ form.autosave ? 'Disable' : 'Enable' }} Auto-Save
        </button>
      </div>
    </form>

    <div class="form-status">
      <p>Form is {{ form.isDirty ? 'dirty' : 'clean' }}</p>
      <p>Form has {{ form.hasErrors ? '' : 'no ' }}errors</p>
      <p v-if="form.wasSuccessful" class="success">Form submitted successfully!</p>
      <p v-if="form.recentlySuccessful" class="recent-success">Recently successful!</p>
    </div>
  </div>
</template>

<style scoped>
.auto-save-status {
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f9f9f9;
}

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

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.submit {
  background-color: #007bff;
  color: white;
}

.submit:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.toggle-autosave {
  background-color: #6c757d;
  color: white;
}

.form-status {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.success, .recent-success {
  color: green;
  font-weight: bold;
}

.title_error, .content_error, .published_error {
  color: red;
  font-size: 14px;
  margin-top: 5px;
  display: block;
}
</style>
