const db = require('./db').redis
const _ = require('lodash')
const Web3 = require('web3')
const request = require('superagent')
const fs = require('./fs')
const path = require('path')
const cheerio = require('cheerio')

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
          return Promise.resolve(price)
        } else {
          return request
            .get('https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD')
            .then(res => {
              price = res.body.USD
              db.set('etherPrice', price, 'EX', 300)
              return Promise.resolve(price)
            })
        }
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

  saveHtml(src) {
    fs.writeFileSync(path.resolve(__dirname, '../../log/log' + Math.random() + ".html"), src)
  }

  scanTweets(username, sig) {
    let errorMessage
    return request
      .get(`https://twitter.com/${username}`)
      .then(tweet => {
        if (tweet.text) {

          const $ = cheerio.load(tweet.text)
          let data
          let someSigFound = false
          let signedBySomeoneElse = false

          $('div.tweet').each((index, elem) => {
            if (!data && $(elem).attr('data-screen-name') &&
              $(elem).attr('data-screen-name').toLowerCase() === username.toLowerCase()) {
              let tweetSig = $('p.TweetTextSize', $(elem)).text().split(' ')[0]
              if (tweetSig === sig.split(' ')[0]) {
                data = $(elem)
              } else {
                let deSig = this.deconstructTweet(tweetSig)
                if (deSig.sigver === '3') {
                  someSigFound = true
                }
              }
            } else {
              let tweetSig = $('p.TweetTextSize', $(elem)).text()
              if (tweetSig === sig) {
                signedBySomeoneElse = true
              }
            }
          })
          if (data) {
            return Promise.resolve({
              result: {
                tweetId: data.attr('data-tweet-id')
              }
            })
          } else {
            if (signedBySomeoneElse) {
              throw(errorMessage = 'Wrong user')
            } else if (someSigFound) {
              throw(errorMessage = 'Wrong signature')
            } else {
              throw(errorMessage = 'Wrong tweet')
            }
          }
        } else {
          if (/<h1>Account suspended<\/h1>/.test(tweet.text)) {
            throw(errorMessage = 'Account suspended')
          } else {
            throw(errorMessage = 'User not found')
          }
        }
      })
      .catch((err) => {
        console.log(err)
        return Promise.resolve({
          error: errorMessage || 'User not found'
        })
      })
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

  saveFile(fn, str) {
    fs.writeFileSync(path.resolve(__dirname, '../../log', fn), str)
  }

  getTwitterUserId(username) {
    let errorMessage
    return request
      .get(`https://twitter.com/${username}`)
      .then(tweet => {
        if (tweet.text) {
          const $ = cheerio.load(tweet.text)

          const name = $('.ProfileHeaderCard-name a').text()
          if (name) {

            const avatar = $('img.ProfileAvatar-image ').attr('src')
            const sn = $('.ProfileHeaderCard-screenname b').text()
            const userId = $('.ProfileNav').attr('data-user-id')

            return Promise.resolve({
              result: {
                userId,
                sn,
                name,
                avatar
              }
            })
          } else {

            if (/<h1>Account suspended<\/h1>/.test(tweet.text)) {
              throw(errorMessage = 'Account suspended')
            } else {
              throw(errorMessage = 'User not found')
            }
          }
        } else {
          throw(errorMessage = 'User not found')
        }
      })
      .catch((err) => {
        return Promise.resolve({
          error: errorMessage || 'User not found'
        })
      })
  }

  getRedditUserId(username) {
    let errorMessage
    return request
      .get(`https://www.reddit.com/user/${username}/about.json`)
      .set('Accept', 'application/json')
      .then(res => {

        let txs = res.body

        if (txs.error) {
          throw(errorMessage = 'User not found')
        } else if (txs.data) {
          const data = txs.data
          if (data.has_verified_email === false) {
            throw(errorMessage = `User's email not verified`)
          } else if (data.name) {
            const name = data.name.toLowerCase()
            if (name === username.toLowerCase()) {
              return Promise.resolve({
                userId: data.id,
                sn: data.name,
                avatar: data.icon_img.replace(/&amp;/g, '&')
              })
            } else {
              throw(errorMessage = 'User not found')
            }
          } else {
            throw(errorMessage = 'User not found')
          }
        }
      })
      .then(data => {

        return request
          .get(`https://www.reddit.com/user/${username}`)
          .then(redditor => {
            if (redditor.text) {
              const $ = cheerio.load(redditor.text)
              data.name = $('h4').text()
            }
            return Promise.resolve({
              result: data
            })
          })
      })
      .catch((err) => {
        console.log(err.statusCode)
        console.log(err.message)
        console.log(err)
        return Promise.resolve({
          error: errorMessage || 'User not found'
        })
      })

  }

  getDataFromUserId(userId) {
    let errorMessage
    return request
      .get(`https://twitter.com/intent/user?user_id=${userId}`)
      .then(tweet => {
        if (tweet.text) {

          const $ = cheerio.load(tweet.text)

          let title = $('title').text().split(' (@')
          let name = title[0]
          let username = title[1].split(')')[0]
          let avatar = $('img.photo').attr('src')

          return Promise.resolve({
            result: {
              name,
              username,
              avatar
            }
          })
        } else {
          throw(errorMessage = 'User not found')
        }
      })
      .catch((err) => {
        console.log(err)
        return Promise.resolve({
          error: 'User not found'
        })
      })
  }

  getGasInfo() {

    const gasUrl = 'https://ethgasstation.info/json/ethgasAPI.json'

    return db.getAsync('gasInfo')
      .then(gasinfo => {
        if (gasinfo && false) {
          return Promise.resolve(JSON.parse(gasInfo))
        } else {
          return request
            .get(gasUrl)
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
              } catch (e) {
              }
              db.set('gasInfo', JSON.stringify(gasInfo), 'EX', 300)
              return Promise.resolve(gasInfo)
            })
        }
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
