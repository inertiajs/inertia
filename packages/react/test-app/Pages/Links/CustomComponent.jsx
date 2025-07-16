import { Link } from '@inertiajs/react'

const PrimaryButton = ({ children, ...props }) => (
  <button
    {...props}
    style={{
      backgroundColor: 'blue',
      color: 'white',
      padding: '10px',
    }}
  >
    {children}
  </button>
)

export default () => {
  return (
    <div>
      <h1>Custom Component Link Test</h1>

      <p>Regular link as button:</p>
      <Link href="/dump/get" as="button">
        Regular Button
      </Link>

      <p>Custom component link:</p>
      <Link href="/dump/get" as={PrimaryButton}>
        Custom Button
      </Link>
    </div>
  )
}