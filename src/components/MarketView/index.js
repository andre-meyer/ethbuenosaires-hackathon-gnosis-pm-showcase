import React from 'react'
import { compose, lifecycle } from 'recompose'
import classnames from 'classnames/bind'
import moment from 'moment'

import withGnosis from 'components/withGnosis'
import collectAllContractsForMarket from 'utils/collectAllContractsForMarket'

import style from './style.css'

import {
  Card, CardContent, CardHeader, Typography
} from '@material-ui/core'

const cx = classnames.bind(style)

const MARKET_TEST_ADDRESS = '0xe3f8f1c5102c016710bb1028e27e0ca7e268d638'

const MarketView = ({ gnosis, contracts }) => {
  if (!contracts) {
    return null
  }

  const resolutionDate = moment.utc(contracts.eventDescription.resolutionDate).local()
  const timeUntil = moment.duration(resolutionDate.diff(moment())).humanize()

  return (
    <div className={cx('marketView')}>
      <Card>
        <CardHeader title={contracts.eventDescription.title} subheader={
          <Typography component="span">
            Will resolve in {timeUntil} – {resolutionDate.format('LLL')}
          </Typography>
        } />
        <CardContent>
          <Typography component="p">
            {contracts.eventDescription.description}
          </Typography>
          <Typography component="p">
          </Typography>
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
      console.log(contracts)
      this.setState({ contracts })
    }
  })
)

export default enhancer(MarketView)