import React from 'react'
import block from 'bem-cn'

export default class TokenInput extends React.Component {

  constructor(props) {
    super(props)
    this.state = {currentValue: this.props.value, focused: false}
  }

  // handleClick(e) {
  //   console.log('TokenInput clicked, focusing...')
  //   if (!this.state.focused) {
  //     this.refs.input.focus()
  //   }
  // }

  handleChange(e) {
    this.setState({currentValue: e.target.value})
  }

  handleFocus(e) {
    console.log('TokenInput handleFocus')
    this.setState({focused: true})
  }

  handleBlur(e) {
    console.log(`TokenInput blur: ${e.target.value}`)
    this.props.onChange(e.target.value)
    this.setState({focused: false})
  }

  handleKeyDown(e) {
    // Tab, Return
    if ([9, 13].indexOf(e.keyCode) !== -1) {
      e.preventDefault()
      this.refs.input.blur()
    }
  }

  renderSpan(value, token) {
    let className = this.props.noTokens ? block('token-input')('span') : block('token-input')('span').state({token})
    return (
      <span className={className} key={value}>
        <span>{value}</span>
      </span>
    )
  }

  render() {
    let {currentValue, focused} = this.state
    let {value, placeholder} = this.props
    let b = block('token-input')

    // Insert spans in place of tokens
    let spans = []
    let re = /\{\{.+?\}\}/g
    let lastIndex = 0
    let match
    while ((match = re.exec(value)) !== null) {
      spans.push(this.renderSpan(value.substring(lastIndex, match.index), false))
      spans.push(this.renderSpan(value.substring(match.index + 2, match.index + match[0].length - 2), true))
      lastIndex = match.index + match[0].length
    }
    spans.push(this.renderSpan(value.substring(lastIndex), false))
    return (
      <div className={b}>
        <input
          ref="input"
          className={b('input')}
          type="text"
          value={currentValue}
          placeholder={placeholder}
          onChange={::this.handleChange}
          onFocus={::this.handleFocus}
          onKeyDown={::this.handleKeyDown}
          onBlur={::this.handleBlur}
        />
        <div className={b('overlay').state({focused})}>{spans}</div>
      </div>
    )
  }
}
