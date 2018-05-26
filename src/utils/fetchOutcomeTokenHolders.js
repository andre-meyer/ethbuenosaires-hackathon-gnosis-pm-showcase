import Decimal from 'decimal.js'

let abiMap = {}

const paramIntHandler = (regexMatches, value) => {
  const [_, signedUnsigned, bits] = regexMatches

  console.info(Decimal(value).toString())

  return 'quack'
}

const addressHandler = (regexMatches, value) => {
  return `0x${value.slice(26)}`
}

const paramTypeHandler = [
  { match: /^(u?)int(\d+)$/g, func: paramIntHandler },
  { match: /^address$/g, func: addressHandler },
]


const findOrGenerateFromAbi = (sha3, contractAbi, topic, transaction) => {
  let abiHandler
  if (abiMap[topic]) { 
    abiHandler =  abiMap[topic]
  } else {
    contractAbi.forEach((abiDef) => {
      const defToHash = `${abiDef.name}(${abiDef.inputs.map(i => i.type).join(',')})`
      const defHash = sha3(defToHash)
  
      if (topic === defHash) {
        console.info(`ABI Definiton found for ${topic}, ${abiDef.name}`)
        abiMap[defHash] = abiDef
        abiHandler = abiDef
  
        return false
      }
    })
  }

  if (abiHandler) {
    const reflection = {}

    abiHandler.inputs.forEach((input, inputIndex) => {
      paramTypeHandler.forEach((paramHandler) => {
        const matches = paramHandler.match.exec(input.type)
        if (matches) {
          console.log(inputIndex, transaction.topics[inputIndex])
          const normalizedValue = paramHandler.func(matches, transaction.topics[inputIndex])

          reflection[input.name] = normalizedValue
        }
      })
    })

    return reflection
  }
}

const fetchOutcomeTokenHolders = async (gnosisInstance, outcomeTokenInstances, startBlock) => {
  const sha3 = gnosisInstance.web3.sha3
  const tokenAbi = gnosisInstance.contracts.Token.abi

  const outcomeTokensTransactions = await Promise.all(outcomeTokenInstances.map((outcomeTokenInstance) => {
    const options = {
      fromBlock: startBlock,
      address: outcomeTokenInstance.address,
    }

    const filter = gnosisInstance.web3.eth.filter(options)

    return new Promise((resolve, reject) => {
      filter.get((err, res) => {
        if (err) {
          return reject(err)
        }
        return resolve(res)
      })
    })
  }))

  // resolve abi
  outcomeTokensTransactions.forEach((tokenTransactions) => {
    tokenTransactions.forEach((transaction) => {
      transaction.topics.forEach((topic) => {
        const funcReflection = findOrGenerateFromAbi(sha3, tokenAbi, topic, transaction)

        if (funcReflection) {
          console.log(funcReflection, transaction)
        }
      })
    })
  })
}

export default fetchOutcomeTokenHolders