<script setup lang="ts">
import { useHttp } from '@inertiajs/vue3'
import { ref } from 'vue'

interface MixedContentResponse {
  success: boolean
  files: Array<{
    fieldname: string
    originalname: string
    mimetype: string
    size: number
  }>
  fileCount: number
  formData: Record<string, any>
}

const mixedContent = useHttp<
  {
    title: string
    user: {
      name: string
      email: string
    }
    tags: string[]
    document?: File
  },
  MixedContentResponse
>({
  title: '',
  user: {
    name: '',
    email: '',
  },
  tags: [],
  document: undefined,
})

const lastMixedResponse = ref<MixedContentResponse | null>(null)

const handleMixedFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    mixedContent.document = target.files[0]
  }
}

const performMixedContent = async () => {
  try {
    const result = await mixedContent.post('/api/mixed')
    lastMixedResponse.value = result
  } catch (e) {
    console.error('Mixed content failed:', e)
  }
}
</script>

<template>
  <div>
    <h1>useHttp Mixed Content Test</h1>

    <!-- Mixed Content Test (Files + Nested Data) -->
    <section id="mixed-test">
      <h2>Mixed Content (Files + Nested Data)</h2>
      <label>
        Title
        <input type="text" id="mixed-title" v-model="mixedContent.title" />
      </label>
      <label>
        User Name
        <input type="text" id="mixed-user-name" v-model="mixedContent.user.name" />
      </label>
      <label>
        User Email
        <input type="email" id="mixed-user-email" v-model="mixedContent.user.email" />
      </label>
      <label>
        Tags (comma-separated)
        <input
          type="text"
          id="mixed-tags"
          @input="(e) => (mixedContent.tags = (e.target as HTMLInputElement).value.split(',').map((t) => t.trim()))"
        />
      </label>
      <label>
        Document
        <input type="file" id="mixed-document" @change="handleMixedFileChange" />
      </label>
      <button @click="performMixedContent" id="mixed-button">Submit Mixed Content</button>
      <div v-if="mixedContent.processing" id="mixed-processing">Submitting...</div>
      <div v-if="lastMixedResponse" id="mixed-result">
        Files: {{ lastMixedResponse.fileCount }}
        <span v-if="lastMixedResponse.files.length > 0">
          ({{ lastMixedResponse.files.map((f) => f.originalname).join(', ') }})
        </span>
        <br />
        Form Data: {{ JSON.stringify(lastMixedResponse.formData) }}
      </div>
    </section>
  </div>
</template>
