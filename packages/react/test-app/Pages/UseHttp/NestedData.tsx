import { useHttp } from '@inertiajs/react'
import { useState } from 'react'

interface NestedResponse {
  success: boolean
  received: Record<string, unknown>
}

export default () => {
  const nestedData = useHttp<
    {
      user: {
        name: string
        address: {
          city: string
          zip: string
        }
      }
      tags: string[]
    },
    NestedResponse
  >({
    user: {
      name: '',
      address: {
        city: '',
        zip: '',
      },
    },
    tags: [],
  })

  const [lastNestedResponse, setLastNestedResponse] = useState<NestedResponse | null>(null)

  const performNestedTest = async () => {
    try {
      const result = await nestedData.post('/api/nested')
      setLastNestedResponse(result)
    } catch (e) {
      console.error('Nested test failed:', e)
    }
  }

  return (
    <div>
      <h1>useHttp Nested Data Test</h1>

      {/* Nested Data Test */}
      <section id="nested-test">
        <h2>Nested Data</h2>
        <label>
          User Name
          <input
            type="text"
            id="nested-user-name"
            value={nestedData.data.user.name}
            onChange={(e) => nestedData.setData('user', { ...nestedData.data.user, name: e.target.value })}
          />
        </label>
        <label>
          City
          <input
            type="text"
            id="nested-city"
            value={nestedData.data.user.address.city}
            onChange={(e) =>
              nestedData.setData('user', {
                ...nestedData.data.user,
                address: { ...nestedData.data.user.address, city: e.target.value },
              })
            }
          />
        </label>
        <label>
          Zip
          <input
            type="text"
            id="nested-zip"
            value={nestedData.data.user.address.zip}
            onChange={(e) =>
              nestedData.setData('user', {
                ...nestedData.data.user,
                address: { ...nestedData.data.user.address, zip: e.target.value },
              })
            }
          />
        </label>
        <label>
          Tags (comma-separated)
          <input
            type="text"
            id="nested-tags"
            onChange={(e) =>
              nestedData.setData(
                'tags',
                e.target.value.split(',').map((t) => t.trim()),
              )
            }
          />
        </label>
        <button onClick={performNestedTest} id="nested-button">
          Submit Nested Data
        </button>
        {lastNestedResponse && <div id="nested-result">Received: {JSON.stringify(lastNestedResponse.received)}</div>}
      </section>
    </div>
  )
}
