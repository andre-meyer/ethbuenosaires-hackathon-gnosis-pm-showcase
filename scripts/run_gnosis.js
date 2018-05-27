var Gnosis = require('@gnosis.pm/pm-js')
var HDWalletProvider = require("truffle-hdwallet-provider")
var config = require('./config.json')

var gnosis
var ipfsHash
var oracle
var event
var market
var localCalculatedCost
var localCalculatedProfit

const FUNDING = config.FUNDING

const LOWERBOUND = config.LOWERBOUND
const UPPERBOUND = config.UPPERBOUND
var provider
var defaultAccount

switch(config.testingFlag) {
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

const GNOSIS_OPTIONS = {
    ethereum: provider,
    ipfs: config.ipfs,
    gnosisdb: config.gnosisdb,
    defaultAccount: defaultAccount
}

const GNOSIS_DESCRIPTION = {
    title: config.GNOSIS_DESCRIPTION.title,
    description: config.GNOSIS_DESCRIPTION.description,
    resolutionDate: new Date(config.GNOSIS_DESCRIPTION.resolutionDate).toISOString(),
    LOWERBOUND,
    UPPERBOUND,
    decimals: config.GNOSIS_DESCRIPTION.decimals,
    unit: config.GNOSIS_DESCRIPTION.unit
}

async function runGnosis() {
    switch(config.resolveMarketFlag) {
        case 0:
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
             * STEP 2 DEFINE EVENT AND UPLOAD TO IPFS
             */
            ipfsHash = await gnosis.publishEventDescription(GNOSIS_DESCRIPTION)
            console.info(`Ipfs hash: https://ipfs.infura.io/api/v0/cat?stream-channels=true&arg=${ipfsHash}`)

            /* 
             * STEP 3 CREATE ORACLE FOR EVENT 
             */
            oracle = await gnosis.createCentralizedOracle(ipfsHash)
            console.info(`Oracle created with address ${oracle.address}`)

            /* 
             * STEP 4 CREATE SCALAR EVENT TYPE
             */
            event = await gnosis.createScalarEvent(
                gnosis.etherToken,
                oracle,
                LOWERBOUND,
                UPPERBOUND
            )
            console.info(`Event created with address ${event.address}`)

            /*
             * STEP 5 CREATE AND FUND MARKET
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
            
            break;
        case 1:
            console.log("closing market")
            /* LAST STEP
             * STEP 8 RESOLVE ORACLE
             */
            var oracleIsSet = await oracle.isSet()
            if (oracleIsSet) {
                await oracle.setOutcome(parseInt(config.EVENT_OUTCOME, 10))
            }
            break;
    }
}

async function buyOutcomes() {
    /*
     * STEP 6 COMPARE LMSR ESTIMATIONS
     * CHANGE VARIABLES BELOW BEFORE PUBLISH
     */
    var outcomeTokenIndex = 0 
    var outcomeTokenCount = 2.5e17
    var netOutcomeTokensSold = [0, 0]
    var lmsrData = {
        netOutcomeTokensSold,
        FUNDING,
        outcomeTokenIndex,
        outcomeTokenCount,
    }
    localCalculatedCost = await Gnosis.calcLMSRCost(lmsrData)
    netOutcomeTokensSold[outcomeTokenIndex] += outcomeTokenCount
    var numOutcomeTokensToSell = 2.5e17
    localCalculatedProfit = await Gnosis.calcLMSRProfit({      
        netOutcomeTokensSold,      
        FUNDING,     
        outcomeTokenIndex,      
        outcomeTokenCount: numOutcomeTokensToSell,
    })

    /*
     * STEP 7 BUY AND SELL MARKET SHARES
     */
    await gnosis.etherToken.deposit(localCalculatedCost)
    var actualCost = await gnosis.buyOutcomeTokens({       
        market,       
        outcomeTokenIndex,       
        outcomeTokenCount   
    })
    return actualCost

}

async function sellOutcomes() {
    /*
     * STEP 6 COMPARE LMSR ESTIMATIONS
     * CHANGE VARIABLES BELOW BEFORE PUBLISH
     */
    var outcomeTokenIndex = 0 
    var outcomeTokenCount = 2.5e17
    var netOutcomeTokensSold = [0, 0]
    var lmsrData = {
        netOutcomeTokensSold,
        FUNDING,
        outcomeTokenIndex,
        outcomeTokenCount,
    }
    localCalculatedCost = await Gnosis.calcLMSRCost(lmsrData)
    netOutcomeTokensSold[outcomeTokenIndex] += outcomeTokenCount
    var numOutcomeTokensToSell = 2.5e17
    localCalculatedProfit = await Gnosis.calcLMSRProfit({      
        netOutcomeTokensSold,      
        FUNDING,     
        outcomeTokenIndex,      
        outcomeTokenCount: numOutcomeTokensToSell,
    })

    /*
     * STEP 7 BUY AND SELL MARKET SHARES
     */
    var actualProfit = await gnosis.sellOutcomeTokens({      
        market,       
        outcomeTokenIndex,             
        outcomeTokenCount: numOutcomeTokensToSell
    }) 
    return actualProfit
}

runGnosis()
