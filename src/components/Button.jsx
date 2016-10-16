import React from 'react'
import block from 'bem-cn'
import MdAdd from 'react-icons/lib/md/add'
import MdClear from 'react-icons/lib/md/clear'
import MdPause from 'react-icons/lib/md/pause'
import MdPlayArrow from 'react-icons/lib/md/play-arrow'
import MdDelete from 'react-icons/lib/md/delete'


export default class Button extends React.Component {

  render() {
    let {icon, className, children, ...props} = this.props
    let b = block('button')
    let iconEl = null
    switch (icon) {
      case 'add': iconEl = MdAdd
      break
      case 'clear': iconEl = MdClear
      break
      case 'pause': iconEl = MdPause
      break
      case 'play': iconEl = MdPlayArrow
      break
      case 'delete': iconEl = MdDelete
      break
    }
    return (
      <button className={b.mix(className)} {...props}>
        {React.createElement(iconEl, {className: b('icon')})}
        <span className={b('text')}>{children}</span>
      </button>
    )
  }
}
