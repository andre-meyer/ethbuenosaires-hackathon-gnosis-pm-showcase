import React from 'react'
import { compose, lifecycle } from 'recompose'
import classnames from 'classnames/bind'
import moment from 'moment'

import Outcomes from './Outcomes'

import withGnosis from 'components/withGnosis'
import collectAllContractsForMarket from 'utils/collectAllContractsForMarket'
import fetchOutcomeTokenHolders from 'utils/fetchOutcomeTokenHolders'
import fetchMarketVars from 'utils/fetchMarketVars'

import style from './style.css'

import {
  Card, CardContent, CardHeader, Typography
} from '@material-ui/core'

const cx = classnames.bind(style)

const MARKET_TEST_ADDRESS = '0xf4294b5783fce0644943444bf3ee6922995f5e95'

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