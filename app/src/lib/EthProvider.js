const db = require('./db').redis
const _ = require('lodash')
const Web3 = require('web3')
const request = require('superagent')
const fs = require('./fs')
const path = require('path')
const cheerio = require('cheerio')

const utils = require('./Utils')

const etherscanApiKey = process.env.ETHERSCAN_TWEEDENTITY_API_KEY

let web3

class Provider {

  constructor(network) {

    web3 = new Web3(new Web3.providers.HttpProvider(`https://${network === '3' ? 'ropsten' : 'mainnet'}.infura.io/${ process.env.INFURA_KEY}`))
  }

  getApiUrl(action, network, address, startBlock) {
    return `http://api${network == '3' ? '-ropsten' : ''}.etherscan.io/api?module=account&action=${action}&address=${address}&startblock=${startBlock || '0'}&endblock=99999999&sort=asc&apikey=${etherscanApiKey}`
  }

  gethEtherPrice() {
    return db.getAsync('etherPrice')
      .then(price => {
        if (price) {
          return Promise.resolve(JSON.parse(price))
        } else {
          const url = 'https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD'
          return request
            .get(url)
            .timeout(5000)
            .then(res => {
              price = {
                value: res.body.USD
              }
              db.set('etherPrice', JSON.stringify(price), 'EX', 300)
              price.lastUpdate = Date.now()
              db.set('etherLastPrice', JSON.stringify(price))
              return Promise.resolve(price)
            }, err => {
              return db.getAsync('etherLastPrice')
                .then(price => {
                  return Promise.resolve(JSON.parse(price))
                })
            })
        }
      })
      .catch(err => {
        console.error('error', err)
        return Promise.resolve({error: 'Fatal error.'})
      })
  }

  getGasInfo() {

    const gasUrl = 'https://ethgasstation.info/json/ethgasAPI.json'

    return db.getAsync('gasInfo')
      .then(gasInfo => {
        if (gasInfo) {
          return Promise.resolve(JSON.parse(gasInfo))
        } else {
          return request
            .get(gasUrl)
            .timeout(5000)
            .set('Accept', 'application/json')
            .then(info => {
              let gasInfo = {}
              try {
                gasInfo = {
                  safeLow: info.body.safeLow,
                  block_time: info.body.block_time,
                  safeLowWait: info.body.safeLowWait,
                  average: info.body.average,
                  avgWait: info.body.avgWait
                }
                db.set('gasInfo', JSON.stringify(gasInfo), 'EX', 300)
                gasInfo.lastUpdate = Date.now()
                db.set('gasLastInfo', JSON.stringify(gasInfo))
                return Promise.resolve(gasInfo)
              } catch (e) {
                return Promise.resolve({})
              }
            }, err => {
              return db.getAsync('gasLastInfo')
                .then(gasInfo => {
                  return Promise.resolve(JSON.parse(gasInfo))
                })
            })
        }
      })
      .catch(err => {
        console.error('error', err)
        return Promise.resolve({error: 'Fatal error'})
      })

  }

  scanTx(result, address) {

    let txs = 0
    let froms = {}
    let tos = {}
    let valueFrom = 0
    let valueTo = 0
    let execs = 0
    let deployes = 0

    for (let r of result) {
      txs++
      if (r.from == address) {
        if (r.value != '0') {
          valueTo += parseInt(r.value.replace(/\d{12}$/, ''), 10) / 1e6
          tos[r.to] = 1
        } else {
          if (r.to) {
            execs++
          } else {
            deployes++
          }
        }
      } else if (r.to == address) {
        if (r.value != '0') {
          froms[r.from] = 1
          valueFrom += parseInt(r.value.replace(/\d{12}$/, ''), 10) / 1e6
        }
      }
    }

    return {
      txs,
      froms: _.keys(froms).length,
      tos: _.keys(tos).length,
      valueFrom: valueFrom,
      valueTo: valueTo,
      execs,
      deployes
    }
  }

  walletStats(network, address) {

    const apiUrl = this.getApiUrl('txlist', network, address)
    const apiUrl2 = this.getApiUrl('balance', network, address)

    return this.gethEtherPrice()
      .then(price => {
        return request
          .get(apiUrl)
          .set('Accept', 'application/json')
          .then(res2 => {

            let stats = this.scanTx(res2.body.result, address)
            stats.price = price

            return Promise.resolve(stats)
          })
      })
      .then(result => {

        return request
          .get(apiUrl2)
          .set('Accept', 'application/json')
          .then(res3 => {
            result.balance = parseInt(res3.body.result.replace(/\d{12}$/, ''), 10) / 1e6
            return Promise.resolve(result)
          })

      })
      .catch(err => {
        console.error(err)
        Promise.reject(err)
      })

  }

  getTxs(body) {

    const apiUrl = this.getApiUrl('txlist', body.network, body.address, body.startBlock)

    return request
      .get(apiUrl)
      .set('Accept', 'application/json')
      .then(res => {

        let txs = res.body.result
        for (let tx of txs) {
          if (tx.gas === body.gas.toString()) {
            return Promise.resolve({
              isError: tx.isError
            })
          }
        }
        return Promise.resolve({})
      })
  }

  getAbi(network, address) {

    const key = `abi:${network}:${address}`
    return db.getAsync(key)
      .then(abiJson => {

        let abi
        try {
          abi = JSON.parse(abiJson)
        } catch (err) {
        }
        if (abi) {
          return Promise.resolve([address, abi])
        } else {

          const url = `http://api${network == '3' ? '-ropsten' : ''}.etherscan.io/api?module=contract&action=getabi&address=${address}&apikey=${etherscanApiKey}`

          return request
            .get(url)
            .then(res => {
              abiJson = res.body.result

              try {
                abi = JSON.parse(abiJson)
                db.set(key, abiJson)
                return Promise.resolve([address, abi])
              } catch (err) {
                return Promise.resolve([address, []])
              }
            })
        }
      })

  }
}

module.exports = Provider
