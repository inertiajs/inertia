import { Head } from '@inertiajs/react'
import { useState } from 'react'

export default () => {
  const [title, setTitle] = useState('Initial Title')
  const [description, setDescription] = useState('Initial description')

  const updateMeta = () => {
    setTitle('Updated Title')
    setDescription('Updated description')
  }

  return (
    <>
      <Head title={title}>
        <meta name="description" content={description} head-key="description" />
        <meta name="author" content="Test Author" />
      </Head>

      <div>
        <h1>Dynamic Head Updates</h1>
        <button id="update-meta" onClick={updateMeta}>
          Update Meta
        </button>
        <p>Current title: {title}</p>
        <p>Current description: {description}</p>
      </div>
    </>
  )
}
