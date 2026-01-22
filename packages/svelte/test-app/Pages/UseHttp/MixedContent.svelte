<script lang="ts">
  import { useHttp } from '@inertiajs/svelte'

  interface MixedContentResponse {
    success: boolean
    files: Array<{
      fieldname: string
      originalname: string
      mimetype: string
      size: number
    }>
    fileCount: number
    formData: Record<string, unknown>
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

  let lastMixedResponse: MixedContentResponse | null = $state(null)

  const handleMixedFileChange = (e: Event) => {
    const target = e.target as HTMLInputElement
    if (target.files && target.files[0]) {
      mixedContent.document = target.files[0]
    }
  }

  const performMixedContent = async () => {
    try {
      const result = await mixedContent.post('/api/mixed')
      lastMixedResponse = result
    } catch (e) {
      console.error('Mixed content failed:', e)
    }
  }
</script>

<div>
  <h1>useHttp Mixed Content Test</h1>

  <!-- Mixed Content Test (Files + Nested Data) -->
  <section id="mixed-test">
    <h2>Mixed Content (Files + Nested Data)</h2>
    <label>
      Title
      <input type="text" id="mixed-title" bind:value={mixedContent.title} />
    </label>
    <label>
      User Name
      <input type="text" id="mixed-user-name" bind:value={mixedContent.user.name} />
    </label>
    <label>
      User Email
      <input type="email" id="mixed-user-email" bind:value={mixedContent.user.email} />
    </label>
    <label>
      Tags (comma-separated)
      <input
        type="text"
        id="mixed-tags"
        oninput={(e) => (mixedContent.tags = (e.target as HTMLInputElement).value.split(',').map((t) => t.trim()))}
      />
    </label>
    <label>
      Document
      <input type="file" id="mixed-document" onchange={handleMixedFileChange} />
    </label>
    <button onclick={performMixedContent} id="mixed-button">Submit Mixed Content</button>
    {#if mixedContent.processing}
      <div id="mixed-processing">Submitting...</div>
    {/if}
    {#if lastMixedResponse}
      <div id="mixed-result">
        Files: {lastMixedResponse.fileCount}
        {#if lastMixedResponse.files.length > 0}
          <span> ({lastMixedResponse.files.map((f) => f.originalname).join(', ')})</span>
        {/if}
        <br />
        Form Data: {JSON.stringify(lastMixedResponse.formData)}
      </div>
    {/if}
  </section>
</div>
