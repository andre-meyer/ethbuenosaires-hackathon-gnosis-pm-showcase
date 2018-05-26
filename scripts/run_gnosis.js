import Gnosis from '@gnosis.pm/pm-js'

let gnosis
let ipfsHash
let oracle
let event
let market
let localCalculatedCost
let localCalculatedProfit

/* 
 * STEP 1 CONNECT TO GNOSIS 
 */
export const initGnosisConnnection = async (GNOSIS_OPTIONS) => {
    try {
        gnosis = await Gnosis.create(GNOSIS_OPTIONS)   
        console.info("Connected to Gnosis")
    } catch(err) {
        console.error("unable to connect to Gnosis :(")
        console.error(err)
    }
}

/* 
 * STEP 2 DEFINE EVENT AND UPLOAD TO IPFS
 */
export const defineEventDescription = async (GNOSIS_DESCRIPTION) => {
    ipfsHash = await gnosis.publishEventDescription(GNOSIS_DESCRIPTION)
    
    console.info(`Ipfs hash: https://ipfs.infura.io/api/v0/cat?stream-channels=true&arg=${ipfsHash}`)
}

/* 
 * STEP 3 CREATE ORACLE FOR EVENT 
 */
export const createOracle = async () => {
    oracle = await gnosis.createCentralizedOracle(ipfsHash)

    console.info(`Oracle created with address ${oracle.address}`)
}

/* 
 * STEP 4 CREATE SCALAR EVENT TYPE
 */
export const createScalarEvent = async (LOWERBOUND, UPPERBOUND) => {

    event = await gnosis.createScalarEvent({
        collateralToken: gnosis.etherToken,
        oracle,
        // Note that these bounds should match the values published on IPFS
        LOWERBOUND,
        UPPERBOUND,
    })

    console.info(`Event created with address ${event.address}`)
}

/*
 * STEP 5 CREATE AND FUND MARKET
 */
export const createMarketAndFund = async (FUNDING) => {
    market = await gnosis.createMarket({
        marketFactory: gnosis.standardMarketFactory,
        event: event,
        marketMaker: gnosis.lmsrMarketMaker,
        fee: 0, // 0%
    })

    console.info(`Market create with address ${market.address}`)

    await gnosis.etherToken.deposit({value: FUNDING})
    await gnosis.etherToken.approve(market.address, FUNDING) 
    await market.fund(FUNDING)
}

/*
 * STEP 6 COMPARE LMSR ESTIMATIONS
 * CHANGE VARIABLES BELOW BEFORE PUBLISH
 */
let outcomeTokenIndex = 0 
let outcomeTokenCount = 2.5e17
let netOutcomeTokensSold = [0, 0]
export const compareLMSR = async (FUNDING) => {
    let lmsrData = {
        netOutcomeTokensSold,
        funding,
        outcomeTokenIndex,
        outcomeTokenCount,
    }
    localCalculatedCost = Gnosis.calcLMSRCost(lmsrData)
    netOutcomeTokensSold[outcomeTokenIndex] += outcomeTokenCount
    let numOutcomeTokensToSell = 2.5e17
    localCalculatedProfit = Gnosis.calcLMSRProfit({      
        netOutcomeTokensSold,      
        funding,     
        outcomeTokenIndex,      
        outcomeTokenCount: numOutcomeTokensToSell,
    })
}

/*
 * STEP 7 BUY AND SELL MARKET SHARES
 */
export const buyShares = async () => {
    await gnosis.etherToken.deposit(localCalculatedCost)
    let acualCost = await gnosis.buyOutcomeTokens({       
        market,       
        outcomeTokenIndex,       
        outcomeTokenCount   
    })
}

export const sellShares = async () => {
    let actualProfit = await gnosis.sellOutcomeTokens({      
        market,       
        outcomeTokenIndex,             
        outcomeTokenCount: numOutcomeTokensToSell
    }) 
}

/* LAST STEP
 * STEP 8 RESOLVE ORACLE
 */
export const resolveOracle = async (EVENT_RESULT) => {
    let oracleIsSet = await oracle.isSet()
    if (oracleIsSet) {
        await oracle.setOutcome(parseInt(EVENT_RESULT, 10))
    }
}

export default Gnosis