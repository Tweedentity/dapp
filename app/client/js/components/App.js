import createHistory from "history/createBrowserHistory"

const history = window.History = createHistory()
const config = require('../config')

const registryAbi = require(`../../../contracts/TweedentityRegistry`).abi
const storeAbi = require(`../../../contracts/Datastore`).abi

const managerAbi = require(`../../../contracts/StoreManager`).abi

const claimerAbi = require(`../../../contracts/OwnershipClaimer`).abi

const {Modal, Button} = ReactBootstrap

const Db = require('../utils/Db')

import Header from './Header'
import Footer from './Footer'
import Unconnected from "./Unconnected"
import Welcome from "./Welcome"
import WalletStats from "./WalletStats"
import GetUsername from './GetUsername'
import UserIdFound from './UserIdFound'
import Signed from './Signed'
import Set from './Set'
import SectionNotFound from './SectionNotFound'
import ManageAccount from './ManageAccount'
import Unset from './Unset'
import LandingPage from './LandingPage'
import Terms from './Terms'

class App extends React.Component {

  constructor(props) {
    super(props)

    const www = /^(www\.|)tweedentity\.com(\.localhost|)$/.test(location.host)

    this.db = new Db(data => {
      this.setState({
        data
      })
    })

    // this.db.reset()

    this.state = {
      connected: -1,
      connectionChecked: false,
      netId: null,
      err: null,
      loading: false,
      data: this.db.data,
      sections: {},
      www,
      config
    }

    for (let m of [
      'getNetwork',
      'watchAccounts0',
      'getAccounts',
      'setAppState',
      'getEthInfo',
      'getContracts',
      'callMethod',
      'handleClose',
      'handleShow'
    ]) {
      this[m] = this[m].bind(this)
    }

    if (!www) {
      this.getNetwork()
    }

  }

  componentDidMount() {
    history.listen(location => {
      this.setState({
        hash: location.hash
      })
    })
    if (!this.state.www) {
      document.title = 'Tweedentity ÐApp (BETA)'
    }
    this.historyPush({
      section: this.state.www ? 'home' : 'connecting'
    })
  }

  getNetwork() {

    this.setState({
      connectionChecked: false
    })

    if (typeof web3 !== 'undefined') {
      console.log('Using web3 detected from external source like MetaMask')

      this.web3js = new Web3(web3.currentProvider)
      this.web3js.eth.getTransactionReceiptMined = require("../utils/getTransactionReceiptMined")

      this.web3js.version.getNetwork((err, netId) => {

        let env

        switch (netId) {
          // case '1':
          //   env = 'main'
          //   break
          case '3':
            env = 'ropsten'
            break
          default:
            this.setState({
              netId: '0',
              connected: 0
            })
        }

        if (env) {

          this.setState({
            netId,
            connected: 1,
            env
          })

          const registry = this.web3js.eth.contract(registryAbi).at(config.registry.address[env])
          registry.getStore('twitter', (err, twitterStore) => {

            registry.getStore('reddit', (err, redditStore) => {

              this.contracts = {
                registry,
                twitterStore: this.web3js.eth.contract(storeAbi).at(twitterStore),
                redditStore: this.web3js.eth.contract(storeAbi).at(redditStore)
              }
              this.getEthInfo()
              this.watchAccounts0(true)
              setInterval(this.watchAccounts0, 1000)
              this.getContracts()
            })
          })
        } else {
          this.setState({
            connectionChecked: true
          })
        }
      })

    } else {
      this.state.connected = 0
      this.setState({
        connectionChecked: true
      })
    }

  }

  getContracts() {

    const registry = this.contracts.registry

    this.setState({
      ready: false
    })

    registry.isReady((err, ready) => {
      if (ready) {
        this.setState({
          ready: true
        })
        registry.manager((err, result) => {
          this.contracts.manager = this.web3js.eth.contract(managerAbi).at(result)
          registry.claimer((err, result) => {
            this.contracts.claimer = this.web3js.eth.contract(claimerAbi).at(result)
          })
        })

      }

    })
  }

  getEthInfo() {
    return fetch(window.location.origin + '/api/eth-info?r=' + Math.random(), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        network: this.state.netId
      })
    })
      .then((response) => response.json())
      .then((responseJson) => {
        this.setState(responseJson)
      })
      .catch(err => {
        if (!this.state.price) {
          this.setState({
            noEthInfo: true
          })
        }
      })
  }

  watchAccounts0(setConnection) {
    const wallet = this.web3js.eth.accounts[0]
    if (this.state.wallet !== wallet) {
      this.setState({
        wallet
      })
      let shortWallet = wallet.substring(0, 6)
      if (!this.state.data[shortWallet]) {
        this.db.put(shortWallet, {})
      }
      this.getAccounts()
      if (this.state.hash === '#/connecting') {
        this.historyPush({
          section: 'welcome',
          replace: true
        })
      }
      if (setConnection) {
        this.setState({
          connectionChecked: true
        })
      }
    }
  }

  getAccounts() {

    if (this.state.wallet) {

      let shortWallet = this.state.wallet.substring(0, 6)

      for (let appNickname of ['twitter', 'reddit']) {

        const store = appNickname + 'Store'

        this.contracts[store].getUid(this.state.wallet, (err, result) => {

          let data = {}
          data[appNickname] = {}

          if (result !== '') {

            let userId = typeof result === 'string' ? result : result.valueOf()
            if (userId !== '') {
              return fetch(window.location.origin + '/api/data/' + appNickname + '?r=' + Math.random(), {
                method: 'POST',
                headers: {
                  Accept: 'application/json',
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  network: this.state.netId,
                  userId
                })
              }).then(response => {
                return response.json()
              }).then(json => {
                const {name, username, avatar, userId} = json.result
                data[appNickname] = {
                  userId,
                  name,
                  username,
                  avatar
                }

                console.log(data)

                this.db.put(shortWallet, data)
              }).catch(function (ex) {
                console.log('parsing failed', ex)
              })
            }
          } else {
            this.db.put(shortWallet, data)
          }
        })
      }


    }
  }

  setAppState(states) {
    this.setState(states)
  }

  historyBack() {
    history.goBack()
  }

  historyPush(args) {
    const shortWallet = (this.state.wallet || '0x0000').substring(0, 6)
    const sections = this.state.sections
    if (!sections[shortWallet]) {
      sections[shortWallet] = {}
    }
    sections[shortWallet][args.section] = true
    this.setState({sections})
    history[
      args.replace ? 'replace' : 'push'
      ](`#/${args.section}`)
  }

  callMethod(method, args) {
    if ([
      'historyPush',
      'historyBack',
      'setAppState',
      'getEthInfo',
      'getAccounts'
    ].indexOf(method) !== -1) {
      this[method](args || {})
    } else {
      console.error(`Method ${method} not allowed.`)
    }
  }

  handleClose() {
    this.setState({show: false});
  }

  handleShow() {
    this.setState({show: true});
  }

  render() {

    const app = {
      appState: this.state,
      callMethod: this.callMethod,
      db: this.db,
      web3js: this.web3js,
      contracts: this.contracts,
      history
    }

    let section = this.state.hash ? this.state.hash.split('/')[1] : null
    let spec = section ? this.state.hash.split('/')[2] : null

    let header
    let component

    if (this.state.www) {

      component = <LandingPage app={app}/>


    } else {

      header = <Header app={app}/>
      component = <SectionNotFound app={app}/>

      if (!section || section === 'connecting') {
        component = <Unconnected app={app}/>
      } else if (this.state.wallet) {
        const sections = this.state.sections[this.state.wallet.substring(0, 6)] || {}
        if (section === 'welcome' || sections[section]) {
          if (section === 'welcome') {
            component = <Welcome app={app}/>
          } else if (section === 'wallet-stats') {
            component = <WalletStats app={app}/>
          } else if (section === 'get-username') {
            component = <GetUsername app={app}/>
          } else if (section === 'userid-found') {
            component = <UserIdFound app={app}/>
          } else if (section === 'signed') {
            component = <Signed app={app}/>
          } else if (section === 'set') {
            component = <Set app={app}/>
          } else if (section === 'manage-account') {
            component = <ManageAccount app={app}/>
          } else if (section === 'unset') {
            component = <Unset app={app}/>
          } else if (section === 'terms') {
            component = <Terms app={app}/>
          } else if (section === 'profile') {
            component = <Profile app={app} address={spec}/>
          }
        }
      }
    }

    return (
      <div>
        {header}
        {component}
        <Footer app={app}/>
        {this.state.show
          ? <Modal.Dialog>
            <Modal.Header>
              <Modal.Title>{this.state.modalTitle}</Modal.Title>
            </Modal.Header>

            <Modal.Body>{this.state.modalBody}</Modal.Body>

            <Modal.Footer>
              <Button onClick={() => {
                this.setState({show: false})
              }}>{this.state.modalClose || 'Close'}</Button>
              {
                this.state.secondButton
                  ? <Button onClick={() => {
                    this.state.modalAction()
                    this.setState({show: false})
                  }} bsStyle="primary">{this.state.secondButton}</Button>
                  : null
              }
            </Modal.Footer>
          </Modal.Dialog>
          : null}
      </div>
    )
  }
}

export default App
