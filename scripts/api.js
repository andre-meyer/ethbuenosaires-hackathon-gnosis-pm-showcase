import Gnosis from '@gnosis.pm/pm-js'
import HDWalletProvider from "truffle-hdwallet-provider"
import config from './config.json'
import Decimal from 'decimal.js'

let gnosis
let ipfsHash
let oracle
let event
let market
let localCalculatedCost
let localCalculatedProfit

const FUNDING = Decimal(config.FUNDING).toString()

const LOWERBOUND = config.LOWERBOUND
const UPPERBOUND = config.UPPERBOUND
let provider
let defaultAccount

export const initGnosisConnection = async() => {
    switch(config.testingFlag){
        case 1:
            console.info("initializing localhost provider")
            provider = new HDWalletProvider(config.testMnemonic, config.localhost);
            defaultAccount = config.testDefaultAccount
            break;
        case 0:
            console.info("initializing ethereum provider")
            if (config.mnemonic != "") {
                provider = new HDWalletProvider(config.mnemonic, config.GNOSIS_OPTIONS.ethereum);
                defaultAcount = config.defaultAccount
            } else {
                console.error("mnemonic is null, please edit config.json")
            }
            break;
    }
}

export const GNOSIS_OPTIONS = {
    ethereum: provider,
    ipfs: config.ipfs,
    gnosisdb: config.gnosisdb,
    defaultAccount: defaultAccount
}

export const GNOSIS_DESCRIPTION = {
    title: config.GNOSIS_DESCRIPTION.title,
    description: config.GNOSIS_DESCRIPTION.description,
    resolutionDate: new Date(config.GNOSIS_DESCRIPTION.resolutionDate).toISOString(),
    LOWERBOUND,
    UPPERBOUND,
    decimals: config.GNOSIS_DESCRIPTION.decimals,
    unit: config.GNOSIS_DESCRIPTION.unit
}

export const createMarket = async (gnosisInst) => {
    console.log("creating market")

    /* 
     * STEP 1 CONNECT TO GNOSIS
     */
    gnosis = gnosisInst
    console.info("Connected to Gnosis")
    
    /* 
     * DEFINE EVENT AND UPLOAD TO IPFS
     */
    ipfsHash = await gnosis.publishEventDescription(GNOSIS_DESCRIPTION)
    console.info(`Ipfs hash: ${ipfsHash}`)

    /* 
     * CREATE ORACLE FOR EVENT 
     */
    oracle = await gnosis.createCentralizedOracle(ipfsHash)
    console.info(`Oracle created with address ${oracle.address}`)

    /* 
     * CREATE SCALAR EVENT TYPE
     */
    event = await gnosis.createScalarEvent(
        gnosis.etherToken,
        oracle,
        LOWERBOUND,
        UPPERBOUND
    )
    console.info(`Event created with address ${event.address}`)

    /*
     * CREATE AND FUND MARKET
     */
    market = await gnosis.createMarket({
        marketFactory: gnosis.standardMarketFactory,
        event: event,
        marketMaker: gnosis.lmsrMarketMaker,
        fee: 0, // 0%
    })
    console.info(`Market created with address ${market.address}`)
    await gnosis.etherToken.deposit({value: FUNDING})
    await gnosis.etherToken.approve(market.address, FUNDING) 
    await market.fund(FUNDING)

    console.info("Success! Your market has been created")
    return market.address
}

export const closeMarket = async () => {
    console.log("closing market")
    /* LAST STEP
        * STEP 8 RESOLVE ORACLE
        */
    var oracleIsSet = await oracle.isSet()
    if (oracleIsSet) {
        try {
            await oracle.setOutcome(parseInt(config.EVENT_OUTCOME, 10))
            console.info("Market closed")
        } catch (err) {
            console.error(err)
        }
    }
}

export const buyOutcomes = async (gnosisInst, market, outcomeTokenIndex, outcomeTokenCount) => {
    /*
     * STEP 3 COMPARE LMSR ESTIMATIONS
     */
    gnosis = gnosisInst
    var netOutcomeTokensSold = market.netOutcomeTokensSold
    var funding = market.funding
    var lmsrData = {
        netOutcomeTokensSold,
        funding,
        outcomeTokenIndex,
        outcomeTokenCount,
    }
    console.info("Calculating LMSR costs")
    localCalculatedCost = await Gnosis.calcLMSRCost(lmsrData)
    netOutcomeTokensSold[outcomeTokenIndex] += outcomeTokenCount
    var numOutcomeTokensToSell = 2.5e17
    console.info("Calculating LMSR profit")
    localCalculatedProfit = await Gnosis.calcLMSRProfit({      
        netOutcomeTokensSold,      
        funding,     
        outcomeTokenIndex,      
        outcomeTokenCount: numOutcomeTokensToSell,
    })

    /*
     *  STEP 4 BUY MARKET SHARES
     */
    console.info("Buying market shares")
    await gnosis.etherToken.deposit(localCalculatedCost)
    var actualCost = await gnosis.buyOutcomeTokens({       
        market: market.address,       
        outcomeTokenIndex,       
        outcomeTokenCount   
    })
    return actualCost
}

export const sellOutcomes = async (gnosisInst, market, outcomeTokenIndex, outcomeTokenCount) => {
    /*
     * COMPARE LMSR ESTIMATIONS
     */
    gnosis = gnosisInst
    var netOutcomeTokensSold = market.netOutcomeTokensSold
    var funding = market.funding
    var lmsrData = {
        netOutcomeTokensSold,
        funding,
        outcomeTokenIndex,
        outcomeTokenCount,
    }
    console.info("Calculating LMSR costs")
    localCalculatedCost = await Gnosis.calcLMSRCost(lmsrData)
    netOutcomeTokensSold[outcomeTokenIndex] += outcomeTokenCount
    var numOutcomeTokensToSell = 2.5e17
    console.info("Calculating LMSR profits")
    localCalculatedProfit = await Gnosis.calcLMSRProfit({      
        netOutcomeTokensSold,      
        funding,     
        outcomeTokenIndex,      
        outcomeTokenCount: numOutcomeTokensToSell,
    })

    /*
     * STEP 5 SELL MARKET SHARES
     */
    console.info("Selling market shares")
    var actualProfit = await gnosis.sellOutcomeTokens({      
        market: market.address,       
        outcomeTokenIndex,             
        outcomeTokenCount: numOutcomeTokensToSell
    }) 
    return actualProfit
}

// export const marketAddr = market.address
