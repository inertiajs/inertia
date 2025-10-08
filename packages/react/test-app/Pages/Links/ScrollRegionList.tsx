import WithScrollRegion from '@/Layouts/WithScrollRegion.jsx'
import { VisitHelperOptions } from '@inertiajs/core'
import { router } from '@inertiajs/react'

const ScrollRegionList = ({ user_id }: { user_id?: number }) => {
  const navigate = (id: number, options: VisitHelperOptions = {}) => {
    router.get(`/links/scroll-region-list/user/${id}`, {}, options)
  }

  const users = Array.from({ length: 10 }, (_, i) => ({ id: i + 1, name: `User ${i + 1}` }))

  return (
    <div>
      <span className="text">Scrollable list with scroll region</span>
      <div className="user-text">Clicked user: {user_id || 'none'}</div>

      {users.map((user) => (
        <div key={user.id} style={{ padding: '20px', borderBottom: '1px solid #ccc' }}>
          <div style={{ marginBottom: '10px', width: '500px' }}>{user.name}</div>
          <button onClick={() => navigate(user.id)}>Default</button>
          <button onClick={() => navigate(user.id, { preserveScroll: true })}>Preserve True</button>
          <button onClick={() => navigate(user.id, { preserveScroll: false })}>Preserve False</button>
        </div>
      ))}
    </div>
  )
}

ScrollRegionList.layout = (page: React.ReactNode) => <WithScrollRegion children={page} />

export default ScrollRegionList
