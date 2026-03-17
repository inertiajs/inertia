import SSRLayout from '../../Layouts/SSRLayout'

const LayoutPropsB = () => {
  return (
    <div>
      <p data-testid="page-content">Page B Content</p>
    </div>
  )
}

LayoutPropsB.layout = SSRLayout

export default LayoutPropsB
