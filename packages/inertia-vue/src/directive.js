import { Inertia, shouldIntercept } from '@inertiajs/inertia'

export default {
  bind(el, binding, vnode) {
    el.addEventListener('click', event => {
      if (!shouldIntercept(event)) {
        return
      }

      event.preventDefault()

      const method = binding.arg || 'get'
      const options = (binding.value || {}).options || {}
      const data = (binding.value || {}).data || (! options ? binding.value : {})
      const url = ((vnode.data || {}).attrs || {}).href || (binding.value || {}).href || (binding.value || {}).url

      if (method === 'replace') {
        Inertia.replace(url, options)
      } else if (method === 'reload') {
        Inertia.reload(options)
      } else if (['post', 'put', 'patch'].indexOf(method) > -1) {
        Inertia[method](url, data, options)
      } else if (method === 'delete') {
        Inertia.delete(url, options)
      } else {
        Inertia.visit(url, {
          ...options,
          method,
          data,
        })
      }

      return false
    })
  },
}
