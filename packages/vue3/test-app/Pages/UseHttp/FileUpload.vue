<script setup lang="ts">
import { useHttp } from '@inertiajs/vue3'
import { ref } from 'vue'

interface UploadResponse {
  success: boolean
  files: Array<{
    fieldname: string
    originalname: string
    mimetype: string
    size: number
  }>
  fileCount: number
  formData: Record<string, string>
}

const fileUpload = useHttp<{ description: string; file?: File; files?: File[] }, UploadResponse>({
  description: '',
  file: undefined,
  files: undefined,
})

const lastUploadResponse = ref<UploadResponse | null>(null)
const uploadProgress = ref<number | null>(null)

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    fileUpload.file = target.files[0]
  }
}

const handleMultipleFilesChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files) {
    fileUpload.files = Array.from(target.files)
  }
}

const performUpload = async () => {
  uploadProgress.value = null
  try {
    const result = await fileUpload.post('/api/upload', {
      onProgress: (progress) => {
        uploadProgress.value = progress.percentage ?? null
      },
    })
    lastUploadResponse.value = result
  } catch (e) {
    console.error('Upload failed:', e)
  }
}
</script>

<template>
  <div>
    <h1>useHttp File Upload Test</h1>

    <!-- File Upload Test -->
    <section id="upload-test">
      <h2>File Upload</h2>
      <label>
        Description
        <input type="text" id="upload-description" v-model="fileUpload.description" />
      </label>
      <label>
        Single File
        <input type="file" id="upload-file" @change="handleFileChange" />
      </label>
      <label>
        Multiple Files
        <input type="file" id="upload-files" multiple @change="handleMultipleFilesChange" />
      </label>
      <button @click="performUpload" id="upload-button">Upload</button>
      <div v-if="fileUpload.processing" id="upload-processing">Uploading...</div>
      <div v-if="uploadProgress !== null" id="upload-progress">Progress: {{ uploadProgress }}%</div>
      <div v-if="lastUploadResponse" id="upload-result">
        Upload Success - Files: {{ lastUploadResponse.fileCount }}
        <span v-if="lastUploadResponse.files.length > 0">
          - {{ lastUploadResponse.files.map((f) => f.originalname).join(', ') }}
        </span>
      </div>
    </section>
  </div>
</template>
