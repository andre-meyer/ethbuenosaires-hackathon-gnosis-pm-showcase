import React from 'react'
import MarketView from 'components/MarketView'
import classnames from 'classnames/bind'

import style from './style.css'
const cx = classnames.bind(style)

const App = () => (
  <div className={cx('app')}>
    <MarketView />
  </div>
)

export default App