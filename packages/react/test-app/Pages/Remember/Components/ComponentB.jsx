import { useRemember } from '@inertiajs/react'
import { ref } from 'vue'

export default (props) => {
  const untracked = ref('')

  const data = useRemember({ name: '', remember: false }, 'Example/ComponentB')

  return (
    <div>
      <span>This component uses a callback-style 'key' for the remember functionality.</span>
      <label>
        Full Name
        <input type="text" className="b-name" name="full_name" v-model="data.name" />
      </label>
      <label>
        Remember Me
        <input type="checkbox" className="b-remember" name="remember" v-model="data.remember" />
      </label>
      <label>
        Remember Me
        <input type="text" className="b-untracked" name="untracked" v-model="untracked" />
      </label>
    </div>
  )
}
