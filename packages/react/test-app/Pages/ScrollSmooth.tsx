import { Link } from '@inertiajs/react'
import { useEffect } from 'react'

export default ({ page }: { page: 'long' | 'short' }) => {
  // Apply scroll-behavior: smooth to html element
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth'
    return () => {
      document.documentElement.style.scrollBehavior = ''
    }
  }, [])

  return (
    <>
      <style>{`
        .scroll-smooth-page {
          padding: 20px;
        }
        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: white;
          padding: 10px 20px;
          border-bottom: 1px solid #ccc;
          z-index: 100;
        }
        .content {
          margin-top: 80px;
        }
        .content-block {
          padding: 20px;
          margin: 10px 0;
          background: #f5f5f5;
          border-radius: 4px;
        }
        .navigation {
          padding: 20px;
          margin-top: 20px;
        }
        .nav-link {
          display: inline-block;
          padding: 10px 20px;
          background: #4f46e5;
          color: white;
          text-decoration: none;
          border-radius: 4px;
        }
      `}</style>
      <div className="scroll-smooth-page">
        <div className="header">
          <h1>{page === 'long' ? 'Long Page' : 'Short Page'}</h1>
          <p>
            Current scroll position: <span id="scroll-position">0</span>
          </p>
        </div>

        <div className="content">
          {page === 'long' ? (
            Array.from({ length: 50 }, (_, i) => (
              <div key={i} className="content-block">
                <h2>Section {i + 1}</h2>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                  dolore magna aliqua.
                </p>
              </div>
            ))
          ) : (
            <div className="content-block">
              <h2>Short Content</h2>
              <p>This is a short page with minimal content.</p>
            </div>
          )}
        </div>

        <div className="navigation">
          {page === 'long' ? (
            <Link href="/scroll-smooth/short" className="nav-link">
              Go to Short Page
            </Link>
          ) : (
            <Link href="/scroll-smooth/long" className="nav-link">
              Go to Long Page
            </Link>
          )}
        </div>
      </div>
    </>
  )
}
