import { useHttp } from '@inertiajs/react'
import { useState } from 'react'

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

export default () => {
  const fileUpload = useHttp<{ description: string; file?: File; files?: File[] }, UploadResponse>({
    description: '',
    file: undefined,
    files: undefined,
  })

  const [lastUploadResponse, setLastUploadResponse] = useState<UploadResponse | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      fileUpload.setData('file', e.target.files[0])
    }
  }

  const handleMultipleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      fileUpload.setData('files', Array.from(e.target.files))
    }
  }

  const performUpload = async () => {
    setUploadProgress(null)
    try {
      const result = await fileUpload.post('/api/upload', {
        onProgress: (progress) => {
          setUploadProgress(progress.percentage ?? null)
        },
      })
      setLastUploadResponse(result)
    } catch (e) {
      console.error('Upload failed:', e)
    }
  }

  return (
    <div>
      <h1>useHttp File Upload Test</h1>

      {/* File Upload Test */}
      <section id="upload-test">
        <h2>File Upload</h2>
        <label>
          Description
          <input
            type="text"
            id="upload-description"
            value={fileUpload.data.description}
            onChange={(e) => fileUpload.setData('description', e.target.value)}
          />
        </label>
        <label>
          Single File
          <input type="file" id="upload-file" onChange={handleFileChange} />
        </label>
        <label>
          Multiple Files
          <input type="file" id="upload-files" multiple onChange={handleMultipleFilesChange} />
        </label>
        <button onClick={performUpload} id="upload-button">
          Upload
        </button>
        {fileUpload.processing && <div id="upload-processing">Uploading...</div>}
        {uploadProgress !== null && <div id="upload-progress">Progress: {uploadProgress}%</div>}
        {lastUploadResponse && (
          <div id="upload-result">
            Upload Success - Files: {lastUploadResponse.fileCount}
            {lastUploadResponse.files.length > 0 && (
              <span> - {lastUploadResponse.files.map((f) => f.originalname).join(', ')}</span>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
