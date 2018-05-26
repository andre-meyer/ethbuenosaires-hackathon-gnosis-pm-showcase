import React from 'react'
import Gnosis from '@gnosis.pm/pm-js'

import { compose, lifecycle, withState } from 'recompose'


const MarketView = ({ gnosis }) => {
  console.log(gnosis)
  if (!gnosis) {
    return null
  }

  return (
    <div>{gnosis.web3.eth.accounts[0]}</div>
  )
}

const enhance = compose(
  withState('gnosis', 'setGnosisInstance'),
  lifecycle({
    async componentDidMount() {
      const gnosisInstance = await Gnosis.create()
      console.log(gnosisInstance)
  
      this.setGnosisInstance(gnosisInstance)
    }
  })
)

export default enhance(MarketView)