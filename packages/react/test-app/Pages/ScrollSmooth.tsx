import { Link } from '@inertiajs/react'
import { useEffect } from 'react'

export default ({ page }: { page: 'long' | 'short' }) => {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth'
    return () => {
      document.documentElement.style.scrollBehavior = ''
    }
  }, [])

  return (
    <div>
      <h1>{page === 'long' ? 'Long Page' : 'Short Page'}</h1>

      <div style={{ height: page === 'long' ? '2000px' : '100px' }}></div>

      {page === 'long' ? (
        <Link href="/scroll-smooth/short">Go to Short Page</Link>
      ) : (
        <Link href="/scroll-smooth/long">Go to Long Page</Link>
      )}
    </div>
  )
}
