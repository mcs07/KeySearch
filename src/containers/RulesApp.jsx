import React from 'react'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {VelocityTransitionGroup} from 'velocity-react'
import * as actionCreators from '../actions'
import {Button, Rule, TokenInput} from '../components'
import block from 'bem-cn'
import FileSaver from 'file-saver'
import Dropzone from 'react-dropzone'


class RulesApp extends React.Component {

  componentDidMount() {
    this.props.actions.loadRules()
  }

  handleAdd(e) {
    console.log('RulesApp handleAdd')
    this.props.actions.createRule({name: '', key: '', url: '', enabled: true})
  }

  handleImport(files, rejected) {
    console.log('RulesApp handleImport')
    if (files.length > 0) {
      console.log('Files: ', files);
      let reader = new FileReader()
      reader.onload = (function(createRule) {
        return function(e) {
          let rules = JSON.parse(e.target.result)
          console.log(rules)
          for (let rule of rules) {
            createRule(rule)
          }
        }
      })(this.props.actions.createRule)
      reader.readAsText(files[0]);
    }
  }

  handleExport(e) {
    console.log('RulesApp handleExport')
    console.log(this.props.rulesList.rules)
    // No ideal configuration here for now...
    // application/octet-stream => downloads, "Unknown" filename
    // application/json => displays with incorrect encoding, "Unknown.json" default name in save dialog
    // application/json;charset=utf-8 => fails completely
    // text/plain;charset=utf-8 => displays with correct encoding, "Unknown.css" default name in save dialog
    let blob = new Blob([JSON.stringify(this.props.rulesList.rules, null, 2)], {type: 'text/plain;charset=utf-8'})
    FileSaver.saveAs(blob, 'keysearch.json')
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
          <Button className={b('add')} icon="add" onClick={::this.handleAdd}>Create New Rule</Button>
          <Dropzone className={b('import-drop').toString()} onDrop={::this.handleImport} multiple={false}>
            <Button className={b('import')} icon="import">Import Rules</Button>
          </Dropzone>
          <Button className={b('export')} icon="export" onClick={::this.handleExport}>Export Rules</Button>
        </div>
        {rulesList.loading && <div>Loading rules...</div>}
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
