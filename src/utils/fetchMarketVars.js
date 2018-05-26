const fetchMarketVars = async (gnosisInstance, contracts) => {
  console.log(contracts)
  const market = {
    ...contracts.eventDescription,
    type: contracts.event instanceof gnosisInstance.contracts.CategoricalEvent ? "CATEGORICAL" : "SCALAR",
    netOutcomeTokensSold: await Promise.all(contracts.outcomeTokens.map(async (_, i) => (await contracts.market.netOutcomeTokensSold(i)).toString()))
    
  }

  return market
}

export default fetchMarketVars