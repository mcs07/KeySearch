import React from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {VelocityTransitionGroup} from 'velocity-react'
import * as actionCreators from '../actions'
import {Button, Rule, TokenInput} from '../components'
import block from 'bem-cn'


class RulesApp extends React.Component {

  componentDidMount() {
    this.props.actions.loadRules()
  }

  handleChange(data) {
    console.log('RulesApp handleChange')
    // store.set(data)
  }

  handleRemove(key) {
    console.log('RulesApp handleRemove')
    // store.remove(key)
  }

  handleAdd(e) {
    console.log('RulesApp handleAdd')
    this.props.actions.createRule({name: '', key: '', url: '', enabled: true})
    // store.remove(key)
  }

  render() {
    let {rulesList, actions} = this.props
    let rows = !rulesList.rules ? [] : rulesList.rules.map((rule, i) => <Rule
      key={rule.id}
      data={rule}
      onDelete={actions.deleteRule}
      onUpdate={actions.updateRule}
    />)
    let b = block('rules-app')
    return (
      <div>
        <div className="row">
          <span></span>
          <Button className={b('add')} icon="add" onClick={::this.handleAdd}>Create New Rule</Button>
        </div>
        {rulesList.loading && <div>Loading...</div>}
        {rulesList.rules != null && rulesList.rules.length === 0 && <div>You have no rules!</div>}
        {rulesList.rules != null &&
          <VelocityTransitionGroup enter={{animation: "slideDown"}} leave={{animation: "slideUp"}} runOnMount={false}>
            {rows}
          </VelocityTransitionGroup>
        }
      </div>
    )
  }
}


const mapStateToProps = (state) => ({
  rulesList: state.rules.rulesList,
  // updateRule: state.rules.updateRule,
  // deleteRule: state.rules.deleteRule
})


const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actionCreators, dispatch)
})


export default connect(mapStateToProps, mapDispatchToProps)(RulesApp)
