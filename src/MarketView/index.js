import React from 'react'
import Gnosis from '@gnosis.pm/pm-js'
import {
  description
} from '../../scripts/run_gnosis.js'
import {
  GNOSIS_OPTIONS,
  GNOSIS_DESCRIPTION
} from './config.js'

import { compose, lifecycle, withState } from 'recompose'

console.log(GNOSIS_OPTIONS)

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