import 'babel-polyfill'
import 'whatwg-fetch'

import React from 'react'
import ReactDOM from 'react-dom'
import Decimal from 'decimal.js'

Decimal.set({ toExpPos: 9999, precision: 50 })

import RootComponent from './components/RootComponent'

/* global document */
const rootElement = document.getElementById('root')

const render = () => {
  ReactDOM.render(<RootComponent />, rootElement)
}

render()