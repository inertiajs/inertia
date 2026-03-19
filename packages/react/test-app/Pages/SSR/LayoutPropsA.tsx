import SSRLayout from '../../Layouts/SSRLayout'

const LayoutPropsA = () => {
  return (
    <div>
      <p data-testid="page-content">Page A Content</p>
    </div>
  )
}

LayoutPropsA.layout = SSRLayout
LayoutPropsA.layoutProps = { title: 'Page A Title' }

export default LayoutPropsA
