import { useHttp } from '@inertiajs/react'
import { useState } from 'react'

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

export default () => {
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

  const [lastMixedResponse, setLastMixedResponse] = useState<MixedContentResponse | null>(null)

  const handleMixedFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      mixedContent.setData('document', e.target.files[0])
    }
  }

  const performMixedContent = async () => {
    try {
      const result = await mixedContent.post('/api/mixed')
      setLastMixedResponse(result)
    } catch (e) {
      console.error('Mixed content failed:', e)
    }
  }

  return (
    <div>
      <h1>useHttp Mixed Content Test</h1>

      {/* Mixed Content Test (Files + Nested Data) */}
      <section id="mixed-test">
        <h2>Mixed Content (Files + Nested Data)</h2>
        <label>
          Title
          <input
            type="text"
            id="mixed-title"
            value={mixedContent.data.title}
            onChange={(e) => mixedContent.setData('title', e.target.value)}
          />
        </label>
        <label>
          User Name
          <input
            type="text"
            id="mixed-user-name"
            value={mixedContent.data.user.name}
            onChange={(e) => mixedContent.setData('user', { ...mixedContent.data.user, name: e.target.value })}
          />
        </label>
        <label>
          User Email
          <input
            type="email"
            id="mixed-user-email"
            value={mixedContent.data.user.email}
            onChange={(e) => mixedContent.setData('user', { ...mixedContent.data.user, email: e.target.value })}
          />
        </label>
        <label>
          Tags (comma-separated)
          <input
            type="text"
            id="mixed-tags"
            onChange={(e) => mixedContent.setData('tags', e.target.value.split(',').map((t) => t.trim()))}
          />
        </label>
        <label>
          Document
          <input type="file" id="mixed-document" onChange={handleMixedFileChange} />
        </label>
        <button onClick={performMixedContent} id="mixed-button">
          Submit Mixed Content
        </button>
        {mixedContent.processing && <div id="mixed-processing">Submitting...</div>}
        {lastMixedResponse && (
          <div id="mixed-result">
            Files: {lastMixedResponse.fileCount}
            {lastMixedResponse.files.length > 0 && (
              <span> ({lastMixedResponse.files.map((f) => f.originalname).join(', ')})</span>
            )}
            <br />
            Form Data: {JSON.stringify(lastMixedResponse.formData)}
          </div>
        )}
      </section>
    </div>
  )
}
