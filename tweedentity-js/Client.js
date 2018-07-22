const ENS = require('ethereum-ens')

const config = require('./config')

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
          return this.loadRegistry()
              .then(() => {
                return this.loadStores()
              })
              .then(() => {
                return this.loadClaimerAndManager()
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

  loadRegistry() {
    const ens = new ENS(this.web3js)
    return ens.resolver('tweedentity.eth')
        .addr()
        .then(addr => {
          this.contracts.registry = this.web3js.eth.contract(config.abi.registry).at(addr)
          return Promise.resolve(addr)
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
        this.contracts.stores[appNickname] = this.web3js.eth.contract(config.abi.store).at(addr)
        return resolve()
      })
    })
  }

  loadClaimerAndManager() {
    return new Promise((resolve, reject) => {
      this.contracts.registry.isReady((err, ready) => {
        if (ready.valueOf() === '0') {
          this.contracts.registry.manager((err, result) => {
            this.contracts.manager = this.web3js.eth.contract(config.abi.manager).at(result)
            this.contracts.registry.claimer((err, result) => {
              this.contracts.claimer = this.web3js.eth.contract(config.abi.claimer).at(result)
              this.ready = true
              return resolve()
            })
          })
        } else {
          this.ready = false
          return reject()
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
        for (let appNickname of config.appNicknames) {
          promises.push(this.getIdentity(appNickname, address))
        }
        return Promise.all(promises)
            .then(results => {
              return Promise.resolve(this.profiles[address])
            })
      } else {
        return Promise.reject(new Error('Invalid address'))
      }

    }
    return Promise.reject(new Error('No address specified'))
  }

  getIdentity(appNickname, address) {
    return new Promise((resolve, reject) => {
      this.contracts.stores[appNickname].getUid(address, (err, result) => {

        if (err) {
          reject('Error')
        }

        let data = {}
        data[appNickname] = {}

        if (result !== '') {
          let userId = typeof result === 'string' ? result : result.valueOf()
          this.profiles[address][appNickname] = userId
        }
        resolve()
      })
    })
  }

}

module.exports = Client