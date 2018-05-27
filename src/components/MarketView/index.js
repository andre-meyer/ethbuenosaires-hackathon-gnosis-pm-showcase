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

// var getm = gnosisInst.market
class MarketView extends React.Component {
  constructor() {
    super()

    this.handleBuyShares = this.handleBuyShares.bind(this)

    this.state = {
      market: undefined,
      buttonBuyState: 'READY',
      buttonSellState: 'READY',
    }
  }

  async componentDidMount() {
    const marketAddress = window.location.hash || '0xca6ee8fee04ba3ddb51ef05626d8d62492363b46'
    const contracts = await collectAllContractsForMarket(this.props.gnosis, marketAddress)
    const market = await fetchMarketVars(this.props.gnosis, contracts)

    this.setState({ market })
  }

  async handleBuyShares(outcomeTokenIndex) {
    const amount = prompt('Amount to buy in Eth?')
    if (!amount) return

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

  async handleSellShares(outcomeTokenIndex) {
    const amount = prompt('Amount to sell in Eth?')
    if (!amount) return

    const outcomeTokenCount = Decimal(parseInt(amount, 10).toString()).mul(1e19).toString()

    const prevNetOutcomeTokensSold = this.state.market.netOutcomeTokensSold

    this.setState({ buttonSellState: 'LOADING' })
    try {
      await sellOutcomes(this.props.gnosis, this.state.market, outcomeTokenIndex, outcomeTokenCount)
      prevNetOutcomeTokensSold[outcomeTokenIndex] = Decimal(prevNetOutcomeTokensSold[outcomeTokenIndex]).sub(outcomeTokenCount).toString()

      this.setState({ 
        market: {
          ...this.state.market,
          netOutcomeTokensSold: prevNetOutcomeTokensSold
        }
      })
    } catch (e) {
      console.error(e)
    }
    this.setState({ buttonSellState: 'READY' })
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
              Unlock your Metamask and connect to Rinkeby!
            </Typography>
            } />
          <CardContent>
            <Button 
              variant="raised" 
              color="default"
              onClick={() => { createMarket(this.props.gnosis) }}>
              1: Create Market
            </Button>
            <Button 
              variant="raised" 
              color="default"
              onClick={() => this.handleBuyShares(0)}>
              {this.state.buttonBuyState === 'READY' ? '2a: Buy Short' : (
                <CircularProgress size={18} />
              )}
            </Button>
            <Button 
              variant="raised" 
              color="default"
              onClick={() => this.handleBuyShares(1)}>
              {this.state.buttonBuyState === 'READY' ? '2b: Buy Long' : (
                <CircularProgress size={18} />
              )}
            </Button>
            <Button 
              variant="raised" 
              color="default"
              onClick={() => this.handleSellShares(0)}>
              {this.state.buttonSellState === 'READY' ? '3a: Sell Short' : (
                <CircularProgress size={18} />
              )}
            </Button>
            <Button 
              variant="raised" 
              color="default"
              onClick={() => this.handleSellShares(1)}>
              {this.state.buttonSellState === 'READY' ? '3a: Sell Long' : (
                <CircularProgress size={18} />
              )}
            </Button>
            <Button 
              variant="raised" 
              color="default"
              onClick={() => { closeMarket() }}>
              4: Close Market
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