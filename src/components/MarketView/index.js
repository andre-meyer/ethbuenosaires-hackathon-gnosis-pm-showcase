import React from 'react'
import { compose, lifecycle } from 'recompose'
import classnames from 'classnames/bind'
import moment from 'moment'

import Outcomes from './Outcomes'

import withGnosis from 'components/withGnosis'
import collectAllContractsForMarket from 'utils/collectAllContractsForMarket'
import fetchOutcomeTokenHolders from 'utils/fetchOutcomeTokenHolders'
import fetchMarketVars from 'utils/fetchMarketVars'
import {initGnosisConnection, createMarket, closeMarket, buyOutcomes, sellOutcomes} from '../../../scripts/api.js'

import style from './style.css'

import {
  Card, CardContent, CardHeader, Typography, Button
} from '@material-ui/core'

const cx = classnames.bind(style)

const MARKET_TEST_ADDRESS = '0xdb5fc20105f3ac7a0c8ec35c65801a99cde21d54'

// var getm = gnosisInst.market
const MarketView = ({
  gnosis,
  market,
}) => {
  if (!market) {
    return null
  }

  const resolutionDate = moment.utc(market.resolutionDate).local()
  const timeUntil = moment.duration(resolutionDate.diff(moment())).humanize()

  return (
    <div className={cx('marketView')}>
      <Card>
        <CardHeader title={"Roll Your Own PM"} subheader={
          <Typography component="span">
            Unlock your Metamask and open your console!
          </Typography>
          } />
        <CardContent>
          <Button 
            variant="raised" 
            color="default"
            onClick={() => { initGnosisConnection() }}>
            1: Connect To Provider
            </Button>
          <Button 
            variant="raised" 
            color="default"
            onClick={() => { createMarket() }}>
            2: Create Market
          </Button>
          <Button 
            variant="raised" 
            color="default"
            onClick={() => { buyOutcomes() }}>
            3: Buy Shares
          </Button>
          <Button 
            variant="raised" 
            color="default"
            onClick={() => { sellOutcomes() }}>
            4: Sell Shares
          </Button>
          <Button 
            variant="raised" 
            color="default"
            onClick={() => { closeMarket() }}>
            5: Close Market
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader title={market.title} subheader={
          <Typography component="span">
            Will resolve in {timeUntil} – {resolutionDate.format('LLL')}
          </Typography>
        } />
        <CardContent>
          <Typography component="p">
            {market.description}
          </Typography>
          <Typography component="p">
          </Typography>

          <Outcomes market={market} />
        </CardContent>
      </Card>
    </div>
  )
}

const enhancer = compose(
  withGnosis(),
  lifecycle({
    async componentDidMount() {
      const contracts = await collectAllContractsForMarket(this.props.gnosis, MARKET_TEST_ADDRESS)
      const market = await fetchMarketVars(this.props.gnosis, contracts)

      this.setState({ market })
    }
  })
)

export default enhancer(MarketView)