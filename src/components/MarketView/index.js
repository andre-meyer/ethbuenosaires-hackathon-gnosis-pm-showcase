import React from 'react'
import { compose, lifecycle } from 'recompose'
import classnames from 'classnames/bind'
import moment from 'moment'
import Decimal from 'decimal.js'

import Outcomes from './Outcomes'

import withGnosis from 'components/withGnosis'
import collectAllContractsForMarket from 'utils/collectAllContractsForMarket'
import fetchOutcomeTokenHolders from 'utils/fetchOutcomeTokenHolders'
import fetchMarketVars from 'utils/fetchMarketVars'
import {initGnosisConnection, createMarket, closeMarket, buyOutcomes, sellOutcomes} from '../../../scripts/api.js'

import style from './style.css'

import {
  Card, CardContent, CardHeader, CardActions, Typography, Button, IconButton, CircularProgress
} from '@material-ui/core'

const cx = classnames.bind(style)

const MARKET_TEST_ADDRESS = '0xca6ee8fee04ba3ddb51ef05626d8d62492363b46'

// var getm = gnosisInst.market
class MarketView extends React.Component {
  constructor() {
    super()

    this.handleBuyShares = this.handleBuyShares.bind(this)

    this.state = {
      market: undefined,
      buttonBuyState: 'READY',
    }
  }

  async componentDidMount() {
    const contracts = await collectAllContractsForMarket(this.props.gnosis, MARKET_TEST_ADDRESS)
    const market = await fetchMarketVars(this.props.gnosis, contracts)

    this.setState({ market })
  }

  async handleBuyShares(outcomeTokenIndex) {
    const amount = prompt('Amount to buy in Eth?')
    const outcomeTokenCount = Decimal(parseInt(amount, 10).toString()).mul(1e19).toString()

    const prevNetOutcomeTokensSold = this.state.market.netOutcomeTokensSold

    this.setState({ buttonBuyState: 'LOADING' })
    try {
      await buyOutcomes(this.props.gnosis, this.state.market, outcomeTokenIndex, outcomeTokenCount)
      prevNetOutcomeTokensSold[outcomeTokenIndex] = Decimal(prevNetOutcomeTokensSold[outcomeTokenIndex]).add(outcomeTokenCount).toString()

      this.setState({ 
        market: {
          ...this.state.market,
          netOutcomeTokensSold: prevNetOutcomeTokensSold
        }
      })
    } catch (e) {
      console.error(e)
    }
    this.setState({ buttonBuyState: 'READY' })
  }

  render() {
    const { gnosis } = this.props
    const { market } = this.state

    if (!market) {
      return (
        <div className={cx('marketView--loading')}>
          <Typography component="h1">Loading your PM experience...</Typography>
          <CircularProgress />
        </div>
      )
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
              onClick={() => { createMarket(this.props.gnosis) }}>
              2: Create Market
            </Button>
            <Button 
              variant="raised" 
              color="default"
              onClick={() => this.handleBuyShares(0)}>
              {this.state.buttonBuyState === 'READY' ? '3: Buy Short' : (
                <CircularProgress size={18} />
              )}
            </Button>
            <Button 
              variant="raised" 
              color="default"
              onClick={() => this.handleBuyShares(1)}>
              {this.state.buttonBuyState === 'READY' ? '3: Buy Long' : (
                <CircularProgress size={18} />
              )}
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
          <CardActions>
            <IconButton>
            </IconButton>
          </CardActions>
        </Card>
      </div>
    )

  }
}


export default withGnosis()(MarketView)