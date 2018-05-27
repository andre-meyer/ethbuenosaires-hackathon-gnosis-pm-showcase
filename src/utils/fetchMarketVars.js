import { calcLMSRMarginalPrice } from '@gnosis.pm/pm-js'

const fetchMarketVars = async (gnosisInstance, contracts) => {
  console.log(contracts)
  const type = contracts.event instanceof gnosisInstance.contracts.CategoricalEvent ? "CATEGORICAL" : "SCALAR"

  const funding = await contracts.market.funding()
  const netOutcomeTokensSold = await Promise.all(contracts.outcomeTokens.map(async (_, i) => (await contracts.market.netOutcomeTokensSold(i)).toString()))

  const market = {
    address: contracts.market.address,
    ...contracts.eventDescription,
    type,
    netOutcomeTokensSold,
    funding,
    outcomes: contracts.eventDescription.outcomes || ["SHORT", "LONG"],
  }

  if (type === 'SCALAR') {
    const scalarEvent = await gnosisInstance.contracts.ScalarEvent.at(contracts.event.address)
    market.lowerBound = (await scalarEvent.lowerBound()).toString()
    market.upperBound = (await scalarEvent.upperBound()).toString()
  }

  return market
}

export default fetchMarketVars