const fs = require('fs')
const path = require('path')

const contracts = [
  'Datastore',
  'StoreManager',
  'OwnershipClaimer',
  'TweedentityRegistry'
]

for (let c of contracts) {

  let abi = require(`../store/build/contracts/${c}`).abi

  let existentAbiPath = path.resolve(__dirname, '../app/client/js/abi', `${c}.json`)
  let existentAbi = require(existentAbiPath)

  let modified = false

  if (abi.length !== existentAbi.length) {

    modified = true

  } else {

    for (let j = 0; j < abi.length; j++) {

      let a = abi[j]
      let b = existentAbi[j]
      for (let p of [
        'constant', 'name', 'payable', 'stateMutability', 'type', 'anonymous'
      ]) {
        if (a[p] !== b[p]) {
          modified = true
          break
        }
      }
      if (a.inputs && !b.inputs || !a.inputs && b.inputs || a.outputs && !b.outputs || !a.outputs && b.outputs) {
        modified = true
        break
      }
      if (a.inputs) {
        if (a.inputs.length !== b.inputs.length) {

          modified = true
          break

        }
        for (let i = 0; i < a.inputs.length; i++) {
          let A = a.inputs[i]
          let B = b.inputs[i]
          if (A.name !== B.name || A.type !== B.type) {
            modified = true
            break
          }
        }
      }
      if (a.outputs) {
        if (a.outputs.length !== b.outputs.length) {

          modified = true
          break

        }
        for (let i = 0; i < a.outputs.length; i++) {
          let A = a.outputs[i]
          let B = b.outputs[i]
          if (A.name !== B.name || A.type !== B.type) {
            modified = true
            break
          }
        }
      }
    }
  }

  if (modified) {
    console.log('Writing', existentAbiPath)
    fs.writeFileSync(existentAbiPath, JSON.stringify(abi, null, 2))
  }


}
