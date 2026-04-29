import { useForm } from '@inertiajs/react'

export default () => {
  const form = useForm({ code: 'initial', name: 'initial-name' })

  const handleSetAndPost = () => {
    form.setData('code', '123456')
    form.post('/dump/post')
  }

  const handleDirty = () => {
    form.setData('code', 'dirty')
  }

  const handleResetAndPost = () => {
    form.reset()
    form.post('/dump/post')
  }

  const handlePartialResetAndPost = () => {
    form.setData('code', 'changed-code')
    form.setData('name', 'changed-name')
    form.reset('code')
    form.post('/dump/post')
  }

  const handleFunctionalSetAndPost = () => {
    form.setData((prev) => ({ ...prev, code: 'functional-code' }))
    form.post('/dump/post')
  }

  const handleTwoSetAndPost = () => {
    form.setData('code', 'first-code')
    form.setData('name', 'second-name')
    form.post('/dump/post')
  }

  return (
    <div>
      <span id="current-code">{form.data.code}</span>
      <span id="current-name">{form.data.name}</span>
      <button onClick={handleSetAndPost} className="set-and-post">
        Set and POST
      </button>
      <button onClick={handleDirty} className="dirty">
        Dirty
      </button>
      <button onClick={handleResetAndPost} className="reset-and-post">
        Reset and POST
      </button>
      <button onClick={handlePartialResetAndPost} className="partial-reset-and-post">
        Partial reset and POST
      </button>
      <button onClick={handleFunctionalSetAndPost} className="functional-set-and-post">
        Functional set and POST
      </button>
      <button onClick={handleTwoSetAndPost} className="two-set-and-post">
        Two set and POST
      </button>
    </div>
  )
}
