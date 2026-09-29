import { router } from '@inertiajs/react'

export default () => {
  const pushFunctionProp = () => {
    router.push({
      url: '/history/non-serializable/target',
      component: 'History/NonSerializableTarget',
      props: { message: 'Target page', onAction: () => 'action from the function prop' },
    })
  }

  return <button onClick={pushFunctionProp}>Push a function prop</button>
}
