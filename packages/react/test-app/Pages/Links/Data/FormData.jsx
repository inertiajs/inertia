import { Link } from '@inertiajs/react'
import { onMounted, ref } from 'vue'

export default (props) => {
  const linkData = ref(new FormData())

  onMounted(() => {
    linkData.value.append('bar', 'baz')
  })

  return (
    <div>
      <span className="text">This is the links page that demonstrates passing data through FormData objects</span>

      <Link method="get" href="/dump/get" data={linkData} className="get">
        GET Link
      </Link>
      <Link as="button" method="post" href="/dump/post" data={linkData} className="post">
        POST Link
      </Link>
      <Link as="button" method="put" href="/dump/put" data={linkData} className="put">
        PUT Link
      </Link>
      <Link as="button" method="patch" href="/dump/patch" data={linkData} className="patch">
        PATCH Link
      </Link>
      <Link as="button" method="delete" href="/dump/delete" data={linkData} className="delete">
        DELETE Link
      </Link>
    </div>
  )
}
