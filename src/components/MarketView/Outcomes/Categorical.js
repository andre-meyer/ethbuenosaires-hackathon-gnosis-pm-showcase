import React from 'react'
import classnames from 'classnames/bind'


import style from './Categorical.css'

const cx = classnames.bind(style)

const Categorical = ({market}) => {
  console.log(market)
  return (
    <div className={cx('categoricalOutcome')}>
      {market.outcomeTokens.map(outcomeToken => (
        <div className={cx('outcome')}>
        </div>
      ))}
    </div>
  )
}

export default Categorical