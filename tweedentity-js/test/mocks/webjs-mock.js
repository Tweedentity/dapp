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

        // msgParams.sig = signed;
        // console.log(sigUtil.recoverTypedSignature(msgParams));

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



/*

// Ref : https://medium.com/metamask/eip712-is-coming-what-to-expect-and-how-to-use-it-bb92fd1a7a26
// Signature was created using the API eth_signTypedData_v3
// Address recovered via eth-sig-utils

const sigUtil = require('eth-sig-util')


const domain = [{
  name: "name",
  type: "string"
}, {
  name: "version",
  type: "string"
}, {
  name: "chainId",
  type: "uint256"
}, {
  name: "verifyingContract",
  type: "address"
}, {
  name: "salt",
  type: "bytes32"
}, ];
const bid = [{
  name: "amount",
  type: "uint256"
}, {
  name: "bidder",
  type: "Identity"
}, ];
const identity = [{
  name: "userId",
  type: "uint256"
}, {
  name: "wallet",
  type: "address"
}, ];

const domainData = {
  name: "My amazing dApp",
  version: "2",
  chainId: parseInt(1),
  verifyingContract: "0x1C56346CD2A2Bf3202F771f50d3D14a367B48070",
  salt: "0xf2d857f4a3edcb9b78b4d503bfe733db1e3f6cdc2b7971ee739626c97e86a558"
};
var message = {
  amount: 100,
  bidder: {
    userId: 323,
    wallet: "0x3333333333333333333333333333333333333333"
  }
};

const data = {
  types: {
    EIP712Domain: domain,
    Bid: bid,
    Identity: identity,
  },
  domain: domainData,
  primaryType: "Bid",
  message: message
};


let signature = "0xabc0f807b4797694b4a98a271faa239c095ed6f56b45a78f81834dab66ec99666893ccc70f9ef119931775bfaf24c496c28472d28522bf606bca0cf0601f3d9d1b"

let messageParams = {}

messageParams.sig = signature;
messageParams.data = data

console.log(sigUtil.recoverTypedSignature(messageParams));


 */