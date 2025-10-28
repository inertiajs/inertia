import { Head } from '@inertiajs/react'
import { useState } from 'react'

export default () => {
  const [showDescription, setShowDescription] = useState(true)
  const [showKeywords, setShowKeywords] = useState(false)

  const toggleDescription = () => {
    setShowDescription(!showDescription)
  }

  const toggleKeywords = () => {
    setShowKeywords(!showKeywords)
  }

  return (
    <>
      <Head title="Conditional Rendering">
        {showDescription && (
          <meta name="description" content="This description is conditionally rendered" head-key="description" />
        )}
        {showKeywords && <meta name="keywords" content="vue, test, conditional" head-key="keywords" />}
        <meta name="always-present" content="This is always here" />
      </Head>

      <div>
        <h1>Conditional Head Rendering</h1>
        <button id="toggle-description" onClick={toggleDescription}>
          {showDescription ? 'Hide' : 'Show'} Description
        </button>
        <button id="toggle-keywords" onClick={toggleKeywords}>
          {showKeywords ? 'Hide' : 'Show'} Keywords
        </button>
        <p>Description visible: {showDescription.toString()}</p>
        <p>Keywords visible: {showKeywords.toString()}</p>
      </div>
    </>
  )
}
