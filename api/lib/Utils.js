'use strict'

const ethUtil = require('ethereumjs-util')
const sigUtil = require('eth-sig-util')

class Utils {

  verify(address, message, sig, signer, signame) {
    if (signer === 'MEW') {
      return this.mewVerify(address, message, sig)
    } else if (signer === 'web3') {
      return this.web3Verify(address, message, sig, signame)
    }
    return false
  }

  equal(a, b) {
    return a.toLowerCase() === b.toLowerCase()
  }

  mewVerify(address, message, sig) {

    const msgHash = ethUtil.hashPersonalMessage(ethUtil.toBuffer(message))
    const sgn = ethUtil.stripHexPrefix(sig)
    const r = new Buffer(sgn.slice(0, 64), 'hex')
    const s = new Buffer(sgn.slice(64, 128), 'hex')
    let v = parseInt(sgn.slice(128, 130), 16)
    if (v < 27) {
      v += 27
    }
    const pub = ethUtil.ecrecover(msgHash, v, r, s)
    const addr = ethUtil.setLength(ethUtil.fromSigned(ethUtil.pubToAddress(pub)), 20)

    return this.equal(ethUtil.bufferToHex(addr), address)
  }

  web3Verify(address, message, sig, signame) {

    return this.equal(sigUtil.recoverTypedSignature({
      data: [{type: 'string', name: signame, value: message}],
      sig
    }), address)
  }

  deconstructTweet(tweet) {
    try {
      const tmp = tweet.replace(/^(|.+)tweedentity\(/, '').replace(/\)(|.+)$/, '').split(';')
      const content = tmp[0].split(',')
      const meta = tmp[1].split(',')
      return {
        shortAddr: content[0].toLowerCase(),
        message: content[1],
        sig: content[2],
        sigver: content[3],
        signer: content[4],
        signame: 'tweedentity',
        version: meta[0]
      }
    } catch (err) {
      return {}
    }
  }

}

module.exports = new Utils
