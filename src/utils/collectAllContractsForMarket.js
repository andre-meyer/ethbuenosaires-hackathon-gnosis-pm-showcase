import Gnosis from "@gnosis.pm/pm-js"
import multihash from 'multi-hash'
import bs58 from 'bs58'
import Decimal from 'decimal.js'

const getMarket = async (gnosisInstance, marketAddress) => {
  // get market
  const marketInstance = await gnosisInstance.contracts.Market.at(marketAddress)
 
  // get event
  const eventAddress = await marketInstance.eventContract()
  const eventInstance = await gnosisInstance.contracts.Event.at(eventAddress)
 
  // get oracle
  const oracleAddress = await eventInstance.oracle()
  const oracleInstance = await gnosisInstance.contracts.CentralizedOracle.at(oracleAddress)

  // get eventdescription
  const ipfsBytes = await oracleInstance.ipfsHash()
  const buffer = new Buffer(ipfsBytes.slice(2), 'hex')
  const ipfsHash = buffer.toString()
  
  const eventDescription = await gnosisInstance.loadEventDescription(ipfsHash)

  // get outcome tokens
  const outcomeTokens = await eventInstance.getOutcomeTokens()

  const outcomeTokenInstances = await Promise.all(outcomeTokens.map((outcomeToken) => gnosisInstance.contracts.Token.at(outcomeToken)))

  return {
    market: marketInstance,
    event: eventInstance,
    oracle: oracleInstance,
    outcomeTokens: outcomeTokenInstances,
    eventDescription
  }
}

export default getMarket