<script lang="ts">
  import { useHttp } from '@inertiajs/svelte'

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

  let lastUploadResponse: UploadResponse | null = $state(null)
  let uploadProgress: number | null = $state(null)

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
    uploadProgress = null
    try {
      const result = await fileUpload.post('/api/upload', {
        onProgress: (progress) => {
          uploadProgress = progress.percentage ?? null
        },
      })
      lastUploadResponse = result
    } catch (e) {
      console.error('Upload failed:', e)
    }
  }
</script>

<div>
  <h1>useHttp File Upload Test</h1>

  <!-- File Upload Test -->
  <section id="upload-test">
    <h2>File Upload</h2>
    <label>
      Description
      <input type="text" id="upload-description" bind:value={fileUpload.description} />
    </label>
    <label>
      Single File
      <input type="file" id="upload-file" onchange={handleFileChange} />
    </label>
    <label>
      Multiple Files
      <input type="file" id="upload-files" multiple onchange={handleMultipleFilesChange} />
    </label>
    <button onclick={performUpload} id="upload-button">Upload</button>
    {#if fileUpload.processing}
      <div id="upload-processing">Uploading...</div>
    {/if}
    {#if uploadProgress !== null}
      <div id="upload-progress">Progress: {uploadProgress}%</div>
    {/if}
    {#if lastUploadResponse}
      <div id="upload-result">
        Upload Success - Files: {lastUploadResponse.fileCount}
        {#if lastUploadResponse.files.length > 0}
          <span> - {lastUploadResponse.files.map((f) => f.originalname).join(', ')}</span>
        {/if}
      </div>
    {/if}
  </section>
</div>
