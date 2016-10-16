import {createReducer} from '../utils'
import * as types from '../constants/actionTypes'

const initialState = {
  rulesList: {rules: null, error: null, loading: false},
  newRule: {error: null, loading: false},
  updateRule: {error: null, loading: false},
  deleteRule: {error: null, loading: false}
}

export default createReducer(initialState, {
  [types.RULES_REQUEST]: (state, payload) => {
    return {...state, rulesList: {rules: state.rulesList.rules, error: null, loading: true}}
  },
  [types.RULES_SUCCESS]: (state, payload) => {
    return {...state, rulesList: {rules: payload, error: null, loading: false}}
  },
  [types.RULES_FAILURE]: (state, payload) => {
    return {...state, rulesList: {rules: null, error: payload, loading: false}}
  },
  [types.CREATE_RULE_REQUEST]: (state, payload) => {
    return {...state, newRule: {error: null, loading: true}}
  },
  [types.CREATE_RULE_SUCCESS]: (state, payload) => {
    // Add the rule in the local state
    let rulesList =  Object.assign({}, state.rulesList)
    rulesList.rules.unshift(payload)
    return {...state, rulesList, newRule: {error: null, loading: false}}
  },
  [types.CREATE_RULE_FAILURE]: (state, payload) => {
    return {...state, newRule: {error: payload, loading: false}}
  },
  [types.UPDATE_RULE_REQUEST]: (state, payload) => {
    return {...state, updateRule: {error: null, loading: true}}
  },
  [types.UPDATE_RULE_SUCCESS]: (state, payload) => {
    // Update the rule in the local state
    let rulesList =  Object.assign({}, state.rulesList)
    for(var i = 0; i < rulesList.rules.length; i++) {
      if (rulesList.rules[i].id === payload.id) {
        rulesList.rules[i] = payload
        break
      }
    }
    return {...state, rulesList, updateRule: {error: null, loading: false}}
  },
  [types.UPDATE_RULE_FAILURE]: (state, payload) => {
    return {...state, updateRule: {error: payload, loading: false}}
  },
  [types.DELETE_RULE_REQUEST]: (state, payload) => {
    return {...state, deleteRule: {error: null, loading: true}}
  },
  [types.DELETE_RULE_SUCCESS]: (state, payload) => {
    // Remove the deleted rule from the local state
    let rulesList = Object.assign({}, state.rulesList)
    for(var i = 0; i < rulesList.rules.length; i++) {
      if (rulesList.rules[i].id === payload) {
        rulesList.rules.splice(i, 1)
        break
      }
    }
    return {...state, rulesList, deleteRule: {error: null,  loading: false}}
  },
  [types.DELETE_RULE_FAILURE]: (state, payload) => {
    return {...state, deleteRule: {error: payload, loading: false}}
  }
})
