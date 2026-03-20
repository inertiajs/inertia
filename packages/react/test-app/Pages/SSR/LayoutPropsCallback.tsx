import SSRLayout from '../../Layouts/SSRLayout'

const LayoutPropsCallback = () => {
  return (
    <div>
      <p data-testid="page-content">Callback Content</p>
    </div>
  )
}

LayoutPropsCallback.layout = (props: Record<string, unknown>) => [SSRLayout, { title: 'Profile: ' + props.pageTitle }]

export default LayoutPropsCallback
