import { Link } from '@inertiajs/react'

export default ({ user, items, count }: { user: { name: string; email: string }; items: string[]; count: number }) => (
  <div>
    <h1 data-testid="ssr-title">SSR Page 1</h1>

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
