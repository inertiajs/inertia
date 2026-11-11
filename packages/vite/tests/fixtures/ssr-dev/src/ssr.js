import './app.css'
import 'virtual:theme.css'

export default (page) => {
  if (page.component === 'Broken') {
    throw new Error('Render failed')
  }

  return { head: [], body: `<div>${page.component}</div>` }
}
