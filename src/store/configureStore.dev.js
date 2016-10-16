import {createStore, applyMiddleware, compose} from 'redux'
import thunk from 'redux-thunk'
import createLogger from 'redux-logger'
import api from '../middleware/api'
import rootReducer from '../reducers'

const configureStore = initialState => createStore(
  rootReducer,
  initialState,
  applyMiddleware(thunk, api, createLogger())
)

export default configureStore
