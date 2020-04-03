
import Inertia from '../src/inertia'

class FakeAdapter {
  constructor() {
    this.resolveComponent = this.resolveComponent.bind(this)
    this.updatePage = this.updatePage.bind(this)
    this.component = null
    this.props = {}
    this.options = {}
  }

  resolveComponent(name) {
    return name
  }

  updatePage(component, props, options) {
    this.component = component
    this.props = props
    this.options = options
  }
}

test('initial page', async () => {
  let adapter = new FakeAdapter

  await Inertia.init({
    initialPage: {
      url: '/',
      component: 'Home',
      props: {
        foo: 'bar',
      },
      version: 1337,
    },
    resolveComponent: adapter.resolveComponent,
    updatePage: adapter.updatePage,
  })

  expect(adapter.component).toBe('Home')
  expect(adapter.props).toMatchObject({ foo: 'bar' })
})
