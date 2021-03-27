export default {
  inertia: null,

  init(inertia) {
    this.inertia = inertia
    this.inertia.on('navigate', event => {
      console.log('honk', event)
    })
  },
}
