const assert = require('assert')

const _ = require('lodash')
const Client = require('../Client')
const Web3 = require('web3')
let web3js
let tClient

describe('Client', function () {

  this.timeout(20 * 1000)

  const tweedentityWallet = '0x93a5b8fc1a951894361c4c35523e23ba6bf073b7'

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
      assert(tClient.contracts.stores.twitter.address === '0x0de9ccba310161c06ae194f65965c309af167913')
      assert(tClient.contracts.stores.reddit.address === '0x26c30eb4d6f4e7a06dd00e1226c85c9260555b7a')
      assert(tClient.netId === '3')
      assert(tClient.env === 'ropsten')
      assert(tClient.ready === true)
    })


    it('should recover a TID for @tweedentity', async () => {

      const result = await tClient.getIdentities(tweedentityWallet)
      assert(typeof result === 'object')
      assert(result.twitter === '946957110411005953')
      assert(result.reddit === 'tweedentity')
    })

    it('should not recover any tweedentity for an unset wallet', async () => {

      const result = await tClient.getIdentities('0x000000fc1a951894361c4c35523e23ba6bf073b7')
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

  })


})