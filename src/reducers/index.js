import {routerReducer as routing} from 'react-router-redux'
import {combineReducers} from 'redux'
import rules from './rules'


const rootReducer = combineReducers({
  routing,
  rules
})


export default rootReducer
