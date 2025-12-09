import { router } from '@inertiajs/react'

export default ({ foo = '', bar = '' }: { foo?: string; bar?: string }) => {
  const replaceSequentially = () => {
    router.replaceProp('foo', 'baz')
    router.replaceProp('bar', 'qux')
  }

  return (
    <div>
      <p>Foo: {foo}</p>
      <p>Bar: {bar}</p>

      <button onClick={replaceSequentially}>Replace foo and bar sequentially</button>
    </div>
  )
}
