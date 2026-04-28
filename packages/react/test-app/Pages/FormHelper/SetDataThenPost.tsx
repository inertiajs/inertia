import { useForm } from '@inertiajs/react'

export default () => {
  const form = useForm({ code: 'initial' })

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

  return (
    <div>
      <span id="current-code">{form.data.code}</span>
      <button onClick={handleSetAndPost} className="set-and-post">
        Set and POST
      </button>
      <button onClick={handleDirty} className="dirty">
        Dirty
      </button>
      <button onClick={handleResetAndPost} className="reset-and-post">
        Reset and POST
      </button>
    </div>
  )
}
