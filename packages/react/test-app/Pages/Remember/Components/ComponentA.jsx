import { useRemember } from '@inertiajs/react'
import { ref } from 'vue'

export default (props) => {
  const untracked = ref('')
  const data = useRemember({ name: '', remember: false }, 'Example/ComponentA')

  return (
    <div>
      <span>This component uses a string 'key' for the remember functionality.</span>
      <label>
        Full Name
        <input type="text" className="a-name" name="full_name" v-model="data.name" />
      </label>
      <label>
        Remember Me
        <input type="checkbox" className="a-remember" name="remember" v-model="data.remember" />
      </label>
      <label>
        Remember Me
        <input type="text" className="a-untracked" name="untracked" v-model="untracked" />
      </label>
    </div>
  )
}
