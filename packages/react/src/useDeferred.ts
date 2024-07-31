import usePage from './usePage'

const checkForData = (keys: string[]) => {
  let status = 'pending'
  let result
  let data

  const suspender: Promise<void> = new Promise((resolve, reject) => {
    const checkIfPresent = () => {
      if (!data?.props || !keys.every((key) => data.props[key] !== undefined)) {
        setTimeout(() => checkIfPresent(), 50)
      } else {
        status = 'success'
        resolve()
      }
    }

    checkIfPresent()
  })

  return {
    read(pageData) {
      data = pageData

      if (status === 'pending') {
        throw suspender
      }

      if (status === 'error') {
        throw result
      }

      if (status === 'success') {
        return result
      }
    },
  }
}

const instances = {}

const checker = (keys: string[]) => {
  const instKey = keys.join(',')

  if (instances[instKey]) {
    return instances[instKey]
  }

  instances[instKey] = checkForData(keys)

  return instances[instKey]
}

export default (key: string | string[]) => {
  const data = usePage()
  key = Array.isArray(key) ? key : [key]
  checker(key).read(data)

  return data.props
}
