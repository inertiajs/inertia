import { Link, router } from '@inertiajs/react'

interface PreserveUrlProps {
  foo?: string
  items?: {
    data: string[]
    next_page_url?: string
  }
}

const PreserveUrl = ({ foo = 'default', items }: PreserveUrlProps) => {
  const loadMore = () => {
    if (items?.next_page_url) {
      router.visit(items.next_page_url, {
        only: ['items'],
        preserveState: true,
        preserveScroll: true,
        preserveUrl: true,
      })
    }
  }

  return (
    <div>
      <span className="text">This is the links page that demonstrates preserve url on Links</span>
      <span className="foo">Foo is now {foo}</span>

      <Link href="/links/preserve-url-page-two" preserveUrl data={{ foo: 'bar' }} className="preserve">
        [URL] Preserve: true
      </Link>
      <Link href="/links/preserve-url-page-two" preserveUrl={false} data={{ foo: 'baz' }} className="preserve-false">
        [URL] Preserve: false
      </Link>

      {items && (
        <div className="items-section">
          <div className="items">
            {items.data.map((item) => (
              <div key={item} className="item">
                {item}
              </div>
            ))}
          </div>

          <span className="items-loaded">Items loaded: {items.data.length}</span>
          <span className="has-next-page">{items.next_page_url ? 'true' : 'false'}</span>

          {items.next_page_url && (
            <Link
              href={items.next_page_url}
              only={['items']}
              preserveState
              preserveScroll
              preserveUrl
              className="load-more"
            >
              Load More
            </Link>
          )}

          {items.next_page_url && (
            <button onClick={loadMore} className="load-more-router">
              Load More Router
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default PreserveUrl
