import { setLayoutProps } from '@inertiajs/react'
import SSRLayout from '../../Layouts/SSRLayout'

const LayoutPropsA = () => {
  setLayoutProps({ title: 'Page A Title' })

  return (
    <div>
      <p data-testid="page-content">Page A Content</p>
    </div>
  )
}

LayoutPropsA.layout = SSRLayout

export default LayoutPropsA
