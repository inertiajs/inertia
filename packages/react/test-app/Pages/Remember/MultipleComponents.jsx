import { Link, useRemember } from '@inertiajs/react'
import { ref } from 'vue'

export default (props) => {
  const untracked = ref('')

  const form = useRemember({ name: '', remember: false })

  return (
    <div>
      <label>
        Full Name
        <input type="text" id="name" name="full_name" v-model="form.name" />
      </label>
      <label>
        Remember Me
        <input type="checkbox" id="remember" name="remember" v-model="form.remember" />
      </label>
      <label>
        Untracked
        <input type="text" id="untracked" name="untracked" v-model="untracked" />
      </label>

      <ComponentA className="component-a" />
      <ComponentB className="component-b" />

      <Link href="/dump/get" className="link">
        Navigate away
      </Link>
      <a href="/non-inertia" className="off-site">
        Navigate off-site
      </a>
    </div>
  )
}
