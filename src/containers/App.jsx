import React from 'react'
import {Link} from 'react-router'
import block from 'bem-cn'


export default class App extends React.Component {
  render() {
    let h = block('navbar')
    return (
      <div className="container">
        <div className={h}>
          <h1 className={h('brand')}>KeySearch</h1>
          <ul className={h('nav')}>
            <li className={h('item')}>
              <Link className={h('link')} to="/rules" activeClassName="active">My Rules</Link>
            </li>
          </ul>
        </div>
        {this.props.children}
      </div>
    )
  }
}
