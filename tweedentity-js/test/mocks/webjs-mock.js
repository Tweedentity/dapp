const sigUtil = require('eth-sig-util')
const config = require('../helpers/config')

class web3jsMock {

  constructor(web3js) {

    web3js.currentProvider.sendAsync = ({method, params, from}, callback) => {
      return new Promise((resolve, reject) => {
        const privKey = new Buffer(config.privateKey, 'hex')

        console.log(params[0])

        const msgParams = {
          data: params[0]
        }
        const signed = sigUtil.signTypedData(privKey, msgParams)

        console.log(signed)

        callback(null, {
          result: signed
        })
      })
    }

    this.web3js = web3js

  }

}

module.exports = web3jsMock