const assert = require('assert')

const _ = require('lodash')
const Client = require('../Client')
const Web3 = require('web3')
const config = require('./helpers/config')
const web3jsMock = require('./mocks/webjs-mock')

let web3js
let tClient

describe('Client', function () {

  this.timeout(60 * 1000)

  const tweedentityWallet = '0x93a5b8fc1a951894361c4c35523e23ba6bf073b7'
  const twitterStore = '0x0de9ccba310161c06ae194f65965c309af167913'
  const redditStore = '0x26c30eb4d6f4e7a06dd00e1226c85c9260555b7a'
  const twitterId = '946957110411005953'
  const redditUsername = 'tweedentity'

  let twitterTotal

  describe('Unsupported network', function () {

    before(function () {
      web3js = new Web3(new Web3.providers.HttpProvider('https://rinkeby.infura.io'))
      tClient = new Client(web3js)
      return Promise.resolve()
    })

    it('should throw because rinkeby is not supported', async () => {

      return tClient.load()
          .catch(err => {
            assert(err.message === 'Unsupported network')
          })
    })

  })


  describe('Supported network', function () {

    before(function () {
      web3js = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io'))
      tClient = new Client(web3js)
      return Promise.resolve()
    })

    it('should load the contracts', async () => {
      await tClient.load()
      assert(_.keys(tClient.contracts).length === 4)
      assert(tClient.contracts.stores.twitter.address === twitterStore)
      assert(tClient.contracts.stores.reddit.address === redditStore)
      assert(tClient.netId === '3')
      assert(tClient.env === 'ropsten')
      assert(tClient.ready === true)
    })

    it('should recover a Twitter identity for @tweedentity', async () => {

      const result = await tClient.getIdentity('twitter',tweedentityWallet)
      assert(result === '946957110411005953')
    })

    it('should throw trying recover an unsupported MySpace identity for @tweedentity', async () => {

      try {
        await tClient.getIdentity('myspace', tweedentityWallet)
      } catch(err) {
        assert(err.message === 'App not supported')
      }
    })

    it('should recover an identity for @tweedentity', async () => {

      const result = await tClient.getIdentities(tweedentityWallet)
      assert(typeof result === 'object')
      assert(result.twitter === twitterId)
      assert(result.reddit === redditUsername)
    })

    it('should recover the full TID for @tweedentity', async () => {

      const result = await tClient.getFullIdentities(tweedentityWallet)
      assert(typeof result === 'object')
      assert(result.twitter === '1/946957110411005953')
      assert(result.reddit === '2/tweedentity')
    })

    it('should recover the full twitter TID for @tweedentity', async () => {

      const result = await tClient.getFullIdentity('twitter', tweedentityWallet)
      assert(result === '1/946957110411005953')
    })

    it('should recover the total number of tweedentities', async () => {

      const result = await tClient.totalIdentities()
      twitterTotal = result.twitter
      assert(result.twitter > 0)
      assert(result.reddit > 0)
      assert(result.total === result.twitter + result.reddit)
    })

    it('should recover the total number of twitter identities', async () => {

      const result = await tClient.totalIdentitiesByApp('twitter')
      assert(result === twitterTotal)
    })

    it('should throw trying recover the total identities for unsupported MySpace', async () => {

      try {
        await tClient.totalIdentitiesByApp('myspace')
      } catch(err) {
        assert(err.message === 'App not supported')
      }
    })

    it('should not recover any tweedentity for an unset wallet', async () => {

      const result = await tClient.getIdentities(tweedentityWallet.replace(/1/g, 'a'))
      assert(typeof result === 'object')
      assert(result.twitter === undefined)
    })

    it('should throw if address is not passed', async () => {

      return await tClient.getIdentities()
          .catch(err => {
            assert(true)
            assert(err.message === 'No address specified')
          })
    })

    it('should throw if address is invalid', async () => {

      return await tClient.getIdentities(tweedentityWallet.substring(2))
          .catch(err => {
            assert(true)
            assert(err.message === 'Invalid address')
          })

      return await tClient.getIdentities(tweedentityWallet.replace(/1/g, 'u'))
          .catch(err => {
            assert(true)
            assert(err.message === 'Invalid address')
          })

      return await tClient.getIdentities(tweedentityWallet + '00')
          .catch(err => {
            assert(true)
            assert(err.message === 'Invalid address')
          })

    })

    it('should return twitter if passing the TID `1/7867654`', async () => {
      assert(Client.appByTID('1/7867654'), 'twitter')
    })

  })

  describe.only('Authentication', function () {

    before(function () {
      web3js = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io'))
      web3js = new web3jsMock(web3js).web3js
      tClient = new Client(web3js)
      return Promise.resolve()
    })

    it('should sign a random token to be used to sign in server side', async () => {

      return tClient.getSignedAuthToken(config.address, config.token)
          .then(result => {
              console.log(result)
            assert(result.result === config.sig)
          })
          .catch(err => {

            console.log(err)
            //assert(err.message === 'Unsupported network')
          })
    })

  })


})