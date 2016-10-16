import React from 'react'
import {Route, IndexRedirect} from 'react-router'
import App from './containers/App'
import RulesApp from './containers/RulesApp'


export default <Route path="/" component={App}>
  <IndexRedirect to="/rules" />
  <Route component={RulesApp} path="/rules"/>
</Route>
