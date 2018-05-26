import React from 'react'
import withGnosis from 'components/WithGnosis'

const MarketView = (props) => {
  return (
    <div>{props.gnosis.web3.eth.accounts[0]}</div>
  )
}

const wrapped = withGnosis()(MarketView)

console.log(wrapped)

export default wrapped