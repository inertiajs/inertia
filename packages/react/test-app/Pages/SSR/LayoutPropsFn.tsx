import SSRLayout from '../../Layouts/SSRLayout'

const LayoutPropsFn = () => {
  return (
    <div>
      <p data-testid="page-content">Function Form Content</p>
    </div>
  )
}

LayoutPropsFn.layout = SSRLayout
LayoutPropsFn.layoutProps = (layout: (...args: unknown[]) => void, props: Record<string, unknown>) => {
  layout({ title: props.pageTitle })
}

export default LayoutPropsFn
