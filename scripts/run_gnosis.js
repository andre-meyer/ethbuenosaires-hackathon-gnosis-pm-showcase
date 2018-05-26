var Gnosis = require('@gnosis.pm/pm-js')
// var HDWalletProvider = require("truffle-hdwallet-provider-privkey");
var HDWalletProvider = require("truffle-hdwallet-provider")
var config = require('./config.json')

var gnosis
var ipfsHash
var oracle
var event
var market
var localCalculatedCost
var localCalculatedProfit

const LOWERBOUND = config.LOWERBOUND
const UPPERBOUND = config.UPPERBOUND

const provider = new HDWalletProvider("stool arrow fatigue sunny actual bind radio license enemy peanut penalty soccer", "https://rinkeby.infura.io/O6AgF19kplltX0VsPbYg");

const GNOSIS_OPTIONS = {
    ethereum: provider,
    ipfs: config.ipfs,
    gnosisdb: config.gnosisdb,
    defaultAccount: config.defaultAccount
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
             * STEP 1 CONNECT TO GNOSIS AND ADD ACCOUNT
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
            await gnosis.etherToken.deposit({value: config.FUNDING})
            await gnosis.etherToken.approve(market.address, config.FUNDING) 
            await market.fund(config.FUNDING)

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

runGnosis()
