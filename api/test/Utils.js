const assert = require('assert')

const utils = require('../lib/Utils')
const fixtures = require('./fixtures')

describe('Utils', function () {

  let tweet1
  let tweet2


  describe('deconstructTweet', function () {

    it('should deconstruct the tweets', () => {

      tweet1 = utils.deconstructTweet(fixtures.web3.tweet)

      assert(tweet1.shortAddr === fixtures.web3.shortAddr)
      assert(tweet1.message === fixtures.web3.message)
      assert(tweet1.sig === fixtures.web3.sig)
      assert(tweet1.sigver === fixtures.web3.sigver)
      assert(tweet1.signer === fixtures.web3.signer)
      assert(tweet1.signame === fixtures.web3.signame)
      assert(tweet1.version === fixtures.web3.version)

      tweet2 = utils.deconstructTweet(fixtures.MEW.tweet)

      assert(tweet2.shortAddr === fixtures.MEW.shortAddr)
      assert(tweet2.message === fixtures.MEW.message)
      assert(tweet2.sig === fixtures.MEW.sig)
      assert(tweet2.sigver === fixtures.MEW.sigver)
      assert(tweet2.signer === fixtures.MEW.signer)
      assert(tweet2.signame === fixtures.MEW.signame)
      assert(tweet2.version === fixtures.MEW.version)

    })

  })

  describe('verify', function () {

    it('should verify a web3 signature', () => {

      const {message, sig, signer, signame} = tweet1
      assert(utils.verify(fixtures.web3.address, message, sig, signer, signame) === true)
    })

    it('should verify a MEW signature', () => {

      const {message, sig, signer, signame} = tweet2
      assert(utils.verify(fixtures.MEW.address, message, sig, signer, signame) === true)
    })

  })

})
