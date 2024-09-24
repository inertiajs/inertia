import { Link } from '@inertiajs/react'
import { ref } from 'vue'

export default (props) => {
  const name = ref('')
  const remember = ref(false)
  const untracked = ref('')

  return (
    <div>
      <label>
        Full Name
        <input type="text" id="name" name="full_name" v-model="name" />
      </label>
      <label>
        Remember Me
        <input type="checkbox" id="remember" name="remember" v-model="remember" />
      </label>
      <label>
        Untracked
        <input type="text" id="untracked" name="untracked" v-model="untracked" />
      </label>

      <Link href="/dump/get" className="link">
        Navigate away
      </Link>
    </div>
  )
}
