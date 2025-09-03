import { useForm } from '@inertiajs/react'
import { useEffect, useState } from 'react'

export default () => {
  const [count, setCount] = useState(0)
  const [effectCount, setEffectCount] = useState(0)
  const { data, setData, setDefaults, reset } = useForm({ count: 0, foo: 'bar' })

  useEffect(() => {
    setData('count', count)
    setDefaults()
    setEffectCount((e) => e + 1)
  }, [count, setData, setDefaults])

  return (
    <div>
      <p id="data-count">Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <p id="form-data">Form data: {JSON.stringify(data)}</p>
      <button onClick={() => reset()}>Reset</button>
      <p id="effect-count">Effect count: {effectCount}</p>
    </div>
  )
}
