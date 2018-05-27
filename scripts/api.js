import Gnosis from '@gnosis.pm/pm-js'
import HDWalletProvider from "truffle-hdwallet-provider"
import config from './config.json'

let gnosis
let ipfsHash
let oracle
let event
let market
let localCalculatedCost
let localCalculatedProfit

const FUNDING = config.FUNDING

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

export const createMarket = async () => {
    console.log("creating market")

    /* 
     * STEP 1 CONNECT TO GNOSIS
     */
    try {
        gnosis = await Gnosis.create(GNOSIS_OPTIONS)   
        console.info("Connected to Gnosis")
    } catch(err) {
        console.error("unable to connect to Gnosis :(")
        console.error(err)
    }

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
        } catch (err) {
            console.error(err)
        }
    }
}

export const buyOutcomes = async () => {
    /*
     * STEP 3 COMPARE LMSR ESTIMATIONS
     * CHANGE VARIABLES BELOW BEFORE PUBLISH
     */
    var outcomeTokenIndex = 0 
    var outcomeTokenCount = 2.5e17
    var netOutcomeTokensSold = [0, 0]
    var funding = 1e17
    var lmsrData = {
        netOutcomeTokensSold,
        funding,
        outcomeTokenIndex,
        outcomeTokenCount,
    }
    localCalculatedCost = await Gnosis.calcLMSRCost(lmsrData)
    netOutcomeTokensSold[outcomeTokenIndex] += outcomeTokenCount
    var numOutcomeTokensToSell = 2.5e17
    localCalculatedProfit = await Gnosis.calcLMSRProfit({      
        netOutcomeTokensSold,      
        funding,     
        outcomeTokenIndex,      
        outcomeTokenCount: numOutcomeTokensToSell,
    })

    /*
     *  STEP 4 BUY MARKET SHARES
     */
    await gnosis.etherToken.deposit(localCalculatedCost)
    var actualCost = await gnosis.buyOutcomeTokens({       
        market,       
        outcomeTokenIndex,       
        outcomeTokenCount   
    })
    return actualCost
}

export const sellOutcomes = async () => {
    /*
     * COMPARE LMSR ESTIMATIONS
     * CHANGE VARIABLES BELOW BEFORE PUBLISH
     */
    var outcomeTokenIndex = 0 
    var outcomeTokenCount = 2.5e17
    var funding = 1e17
    var netOutcomeTokensSold = [0, 0]
    var lmsrData = {
        netOutcomeTokensSold,
        funding,
        outcomeTokenIndex,
        outcomeTokenCount,
    }
    localCalculatedCost = await Gnosis.calcLMSRCost(lmsrData)
    netOutcomeTokensSold[outcomeTokenIndex] += outcomeTokenCount
    var numOutcomeTokensToSell = 2.5e17
    localCalculatedProfit = await Gnosis.calcLMSRProfit({      
        netOutcomeTokensSold,      
        funding,     
        outcomeTokenIndex,      
        outcomeTokenCount: numOutcomeTokensToSell,
    })

    /*
     * STEP 5 SELL MARKET SHARES
     */
    var actualProfit = await gnosis.sellOutcomeTokens({      
        market,       
        outcomeTokenIndex,             
        outcomeTokenCount: numOutcomeTokensToSell
    }) 
    return actualProfit
}

// export const marketAddr = market.address
