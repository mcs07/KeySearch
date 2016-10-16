import React from 'react'
import block from 'bem-cn'
import Button from './Button'
import TokenInput from './TokenInput'


export default class Rule extends React.Component {

  handleKeyChange(value) {
    if (this.props.data.key !== value) {
      console.log(`Rule: Changing key ${this.props.data.key} => ${value}`)
      let data = Object.assign(this.props.data, {key: value})
      this.props.onUpdate(data)
    }
  }

  handleUrlChange(value) {
    if (this.props.data.url !== value) {
      console.log(`Rule: Changing url ${this.props.data.url} => ${value}`)
      let data = Object.assign(this.props.data, {url: value})
      this.props.onUpdate(data)
    }
  }

  handleNameChange(value) {
    if (this.props.data.name !== value) {
      console.log(`Rule: Changing name ${this.props.data.name} => ${value}`)
      let data = Object.assign(this.props.data, {name: value})
      this.props.onUpdate(data)
    }
  }

  handleEnable(e) {
    console.log(`Rule: Changing enabled ${this.props.data.enabled} => ${!this.props.data.enabled}`)
    let data = Object.assign(this.props.data, {enabled: !this.props.data.enabled})
    this.props.onUpdate(data)
  }

  handleDelete(e) {
    console.log(`Rule: Removing ${this.props.data.name} (${this.props.data.id})`)
    this.props.onDelete(this.props.data.id)
  }

  render() {
    let {data} = this.props
    let b = block('rule')
    let enableText = data.enabled ? 'Disable' : 'Enable'
    let enableIcon = data.enabled ? 'pause' : 'play'
    return (
      <div className={b.state({disabled: !data.enabled})}>
        <div className={b('header')}>
          <h3 className={b('name')}><TokenInput placeholder="Name" value={data.name} onChange={::this.handleNameChange} noTokens/></h3>
          <Button className={b('enable')} icon={enableIcon} onClick={::this.handleEnable}>{enableText}</Button>
          <Button className={b('delete')} icon="clear" onClick={::this.handleDelete}>Delete</Button>
        </div>
        <div className={b('body')}>
          <div className={b('key')}><TokenInput placeholder="Key" value={data.key} onChange={::this.handleKeyChange}/></div>
          <div className={b('url')}><TokenInput placeholder="URL" value={data.url} onChange={::this.handleUrlChange}/></div>
        </div>
      </div>
    )
  }
}
