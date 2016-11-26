class StoreClient {

  constructor() {
    this.callbacks = {}

    // Call the corresponding Promise callback
    safari.self.addEventListener('message', (e) => {
      if (e.name === 'storeResponse') {
        console.log('StoreClient storeResponse')
        let {id, response} = e.message
        let cb = this.callbacks[id]
        if (cb) {
          delete this.callbacks[id]
          cb.fulfill(response)
          // TODO: Call cb.reject(data) if there is an error
        }
      }
    }, false)
  }

  request(method, args) {
    // Return Promise that is fulfilled by the response message from the global page
    return new Promise((fulfill, reject) => {
      let id = Math.random()
      this.callbacks[id] = {fulfill, reject}
      safari.self.tab.dispatchMessage('storeRequest', {id, method, args})
    })
  }

}

const storeClient = new StoreClient()


export const CALL_API = Symbol('Call API')


export default store => next => action => {
  const callAPI = action[CALL_API]
  if (typeof callAPI === 'undefined') {
    return next(action)
  }

  function actionWith(data) {
    const finalAction = Object.assign({}, action, data)
    delete finalAction[CALL_API]
    return finalAction
  }

  let {method, args, types} = callAPI
  const [requestType, successType, errorType] = types
  next(actionWith({payload: args, type: requestType}))
  return storeClient.request(method, args).then(
    response => next(actionWith({payload: response, type: successType})),
    error => next(actionWith({payload: error, type: errorType}))
  )
}

