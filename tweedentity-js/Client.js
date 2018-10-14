const ENS = require('ethereum-ens')
const sigUtil = require('eth-sig-util')
const _ = require('lodash')

const config = require('./config')

class Utils {

  constructor(web3js, contracts) {
    this.web3js = web3js
    this.contracts = contracts
  }

  loadRegistry() {
    const ens = new ENS(this.web3js)
    return ens.resolver('tweedentity.eth')
        .addr()
        .then(addr => {
          this.contracts.registry = this.web3js.eth.contract(config.abi.registry).at(addr)
          return new Promise(resolve => {
            this.contracts.registry.isReady((err, ready) => {
              return resolve(ready.valueOf() === '0')
            })
          })
        })
  }

  loadStores() {
    const promises = []
    for (let appNickname of config.appNicknames) {
      promises.push(this.loadStore(appNickname))
    }
    return Promise.all(promises)
  }

  loadStore(appNickname) {
    return new Promise((resolve, reject) => {
      this.contracts.registry.getStore(appNickname, (err, addr) => {
        if (err) {
          return reject(err)
        }
        this.contracts.stores[appNickname] = this.web3js.eth.contract(config.abi.store).at(addr.valueOf())
        return resolve()
      })
    })
  }

  loadClaimerAndManager(ready) {
    return new Promise((resolve, reject) => {
      if (ready) {
        this.contracts.registry.manager((err, result) => {
          this.contracts.manager = this.web3js.eth.contract(config.abi.manager).at(result.valueOf())
          this.contracts.registry.claimer((err2, result2) => {
            this.contracts.claimer = this.web3js.eth.contract(config.abi.claimer).at(result2.valueOf())
            return resolve()
          })
        })
      } else {
        return reject()
      }
    })
  }
}

class Client {

  constructor(web3js) {
    this.web3js = web3js
    this.ready = false
    this.profiles = {}
    this.contracts = {
      stores: {}
    }
    this.netId = '0'
  }

  load() {
    return new Promise((resolve, reject) => {
      this.web3js.version.getNetwork((err, netId) => {
        if (netId === '1' || netId === '3') {
          this.env = netId === '1' ? 'main' : 'ropsten'
          this.netId = netId
          const priv = new Utils(this.web3js, this.contracts)
          return priv.loadRegistry()
              .then(ready => {
                this.ready = ready
                return priv.loadStores()
              })
              .then(() => {
                return priv.loadClaimerAndManager(this.ready)
              })
              .then(() => {
                return resolve()
              })
              .catch(err => {
                return reject(new Error('Error loading the contracts'));
              })

        } else if (err) {
          return reject(new Error('Network error'))
        } else {
          return reject(new Error('Unsupported network'));
        }
      })
    })
  }

  getIdentities(address, reload) {
    if (address) {
      if (/^0x[0-9a-fA-F]{40}$/.test(address)) {
        if (!this.profiles[address]) {
          this.profiles[address] = {}
        } else if (!reload) {
          return Promise.resolve(this.profiles[address])
        }
        const promises = []
        const position = {}
        let count = 0
        for (let appNickname of config.appNicknames) {
          position[appNickname] = count++
          promises.push(this.getIdentity(appNickname, address))
        }
        return Promise.all(promises)
            .then(results => {
              for (let appNickname in position) {
                let identity = results[position[appNickname]]
                if (identity) {
                  this.profiles[address][appNickname] = identity
                }
              }
              return Promise.resolve(this.profiles[address])
            })
      } else {
        return Promise.reject(new Error('Invalid address'))
      }
    }
    return Promise.reject(new Error('No address specified'))
  }

  getIdentity(app, address) {
    const appNickname = Client.normalize(app)
    if (appNickname) {
      return new Promise(resolve => {
        this.contracts.stores[appNickname].getUid(address, (err, result) => {
          if (err) {
            resolve()
          }
          resolve(result.valueOf())
        })
      })
    } else {
      return Promise.reject(new Error('App not supported'))
    }
  }

  getFullIdentities(address, reload) {
    return this.getIdentities(address, reload)
        .then(result => {
          for (let appNickname of config.appNicknames) {
            result[appNickname] = Client.fullify(appNickname, result[appNickname])
          }
          return Promise.resolve(result)
        })
  }

  getFullIdentity(appNickname, address) {
    return this.getIdentity(appNickname, address)
        .then(result => {
          return Promise.resolve(Client.fullify(appNickname, result))
        })
  }

  totalIdentities() {
    const promises = []
    const position = {}
    let count = 0
    for (let appNickname of config.appNicknames) {
      position[appNickname] = count++
      promises.push(this.totalIdentitiesByApp(appNickname))
    }
    return Promise.all(promises)
        .then(results => {
          const totals = {
            total: 0
          }
          for (let appNickname in position) {
            let t = results[position[appNickname]]
            totals[appNickname] = t
            totals.total += t
          }
          return Promise.resolve(totals)
        })
  }

  totalIdentitiesByApp(app) {
    const appNickname = Client.normalize(app)
    if (appNickname) {
      return new Promise((resolve, reject) => {
        this.contracts.stores[appNickname].identities((err, result) => {
          resolve(parseInt(result.valueOf(), 10))
        })
      })
    } else {
      return Promise.reject(new Error('App not supported'))
    }
  }

  getSignedAuthToken(wallet, token) {
    if (!token) {
      token = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 12)
      // console.log(token)
    }
    const msgParams = [
      {
        type: 'string',
        name: 'auth',
        value: token
      }
    ]
    return this.web3js.currentProvider.sendAsync({
      method: 'eth_signTypedData',
      params: [
        msgParams,
        wallet
      ],
      from: wallet,
    }, (err, result) => {
      if (err || result.error) {
        return Promise.reject(new Error('Signature denied'))
      } else {
        const recovered = sigUtil.recoverTypedSignature({
          data: msgParams,
          sig: result.result
        })
        if (recovered === wallet) {
          return Promise.resolve({
            signature: result.result,
            token
          })
        } else {
          return Promise.reject(new Error('Wrong signature'))
        }
      }
    })
  }

  static fullify(appNickname, id) {
    if (id) {
      return `${config.appIds[appNickname]}/${id}`
    } else {
      return undefined
    }
  }

  static isSupported(app) {
    if (typeof app === 'number') {
      return config.appIds[app] !== undefined
    } else if (typeof app === 'string') {
      return config.appNicknames.indexOf(app) !== -1
    }
    return false
  }

  static normalize(app) {
    if (typeof app === 'number') {
      app = _.invert(config.app)[app]
    }
    if (app && Client.isSupported(app)) {
      return app
    }
  }

  static appByTID(tid) {
    return _.invert(config.appIds)[parseInt(tid.split('/')[0], 10)]
  }

}

module.exports = Client