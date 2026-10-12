import { useRemember } from '@inertiajs/react'

export default () => {
  const [notes, setNotes] = useRemember('', 'Users/Notes')

  return (
    <label>
      Notes
      <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} />
    </label>
  )
}
