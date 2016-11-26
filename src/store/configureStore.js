import {createStore, applyMiddleware, compose} from 'redux'
import thunk from 'redux-thunk'
// import createLogger from 'redux-logger'
import api from '../middleware/api'
import rootReducer from '../reducers'

export default function configureStore(initialState) {
  let middleware = [thunk, api]
  if (process.env.NODE_ENV !== 'production') {
    let createLogger = require('redux-logger')
    middleware = [...middleware, createLogger()]
  }
  return createStore(rootReducer, initialState, applyMiddleware(...middleware))
}
