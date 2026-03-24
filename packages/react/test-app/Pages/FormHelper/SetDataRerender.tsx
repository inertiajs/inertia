import { InertiaFormProps, useForm } from '@inertiajs/react'
import { memo, useRef } from 'react'

const MemoizedDisplay = memo(({ form }: { form: InertiaFormProps<{ position: string }> }) => {
  return <div id="memo-value">Memo value: {form.data.position}</div>
})

export default () => {
  const form = useForm({ position: 'initial' })
  const renderCount = useRef(0)

  renderCount.current++

  const options = ['initial', 'goalkeeper', 'defender', 'midfielder', 'forward']

  return (
    <div>
      <h1>setData Re-render Test</h1>
      <div id="render-count">Render count: {renderCount.current}</div>
      <div id="current-value">Current value: {form.data.position}</div>

      <MemoizedDisplay form={form} />

      {options.map((option) => (
        <button key={option} onClick={() => form.setData('position', option)}>
          Set {option}
        </button>
      ))}
    </div>
  )
}
