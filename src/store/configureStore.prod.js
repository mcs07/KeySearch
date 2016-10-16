import {createStore, applyMiddleware} from 'redux'
import thunk from 'redux-thunk'
import api from '../middleware/api'
import rootReducer from '../reducers'

const configureStore = initialState => createStore(
  rootReducer,
  initialState,
  applyMiddleware(thunk, api)
)

export default configureStore
