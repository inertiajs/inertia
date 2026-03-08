import { Link, usePage } from '@inertiajs/react'

export default ({ user, items, count }: { user: { name: string; email: string }; items: string[]; count: number }) => {
  const page = usePage()

  return (
    <div>
      <h1 data-testid="ssr-title">SSR Page 1</h1>

      <p data-testid="page-url">URL: {page.url}</p>

      <div data-testid="user-info">
        <p data-testid="user-name">Name: {user.name}</p>
        <p data-testid="user-email">Email: {user.email}</p>
      </div>

      <ul data-testid="items-list">
        {items.map((item) => (
          <li key={item} data-testid="item">
            {item}
          </li>
        ))}
      </ul>

      <p data-testid="count">Count: {count}</p>

      <Link href="/ssr/page2" data-testid="navigate-link">
        Navigate to another page
      </Link>
    </div>
  )
}
