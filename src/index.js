import 'babel-polyfill'
import 'whatwg-fetch'

import React from 'react'
import ReactDOM from 'react-dom'

import RootComponent from './components/RootComponent'

/* global document */
const rootElement = document.getElementById('root')

const render = () => {
  ReactDOM.render(<RootComponent />, rootElement)
}

render()