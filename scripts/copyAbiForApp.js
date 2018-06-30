const fs = require('fs')
const path = require('path')
const diff = require('deep-diff').diff

const contracts = [
    'Datastore',
    'StoreManager',
    'OwnershipClaimer',
    'TweedentityRegistry'
]

for (let c of contracts) {

  let existentAbiPath = path.resolve(__dirname, '../app/client/js/abi', `${c}.json`)
  let abi = require(`../store/build/contracts/${c}`).abi
  let existentAbi = fs.readFileSync(existentAbiPath)

  let differences = diff ()


  // fs.writeFileSync(existentAbiPath, JSON.stringify(abi, null, 2))


}
