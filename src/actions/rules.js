import * as types from '../constants/actionTypes'
import {CALL_API} from '../middleware/api'


export function loadRules() {
  return {
    [CALL_API]: {
      types: [types.RULES_REQUEST, types.RULES_SUCCESS, types.RULES_FAILURE],
      method: 'all'
    }
  }
}


export function loadRule(id) {
  return {
    [CALL_API]: {
      types: [types.RULE_REQUEST, types.RULE_SUCCESS, types.RULE_FAILURE],
      method: 'get',
      args: [id]
    }
  }
}


export function createRule(rule) {
  return {
    [CALL_API]: {
      types: [types.CREATE_RULE_REQUEST, types.CREATE_RULE_SUCCESS, types.CREATE_RULE_FAILURE],
      method: 'create',
      args: [rule]
    }
  }
}


export function updateRule(rule) {
  return {
    [CALL_API]: {
      types: [types.UPDATE_RULE_REQUEST, types.UPDATE_RULE_SUCCESS, types.UPDATE_RULE_FAILURE],
      method: 'update',
      args: [rule]
    }
  }
}


export function deleteRule(id) {
  return {
    [CALL_API]: {
      types: [types.DELETE_RULE_REQUEST, types.DELETE_RULE_SUCCESS, types.DELETE_RULE_FAILURE],
      method: 'delete',
      args: [id]
    }
  }
}
