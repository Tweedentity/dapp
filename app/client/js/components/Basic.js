

class Basic extends React.Component {
  constructor(props) {
    super(props)

    this.bindAll = this.bindAll.bind(this)
    this.bindAll([
      'setGlobalState',
      'getGlobalState',
      'shortWallet',
      'historyPush',
      'appState',
      'appNickname',
      'appName',
      'appId',
      'appUid',
      'getEtherscan'
    ])
    this.db = this.props.app.db
    this.web3js = this.props.app.web3js
  }

  bindAll(methods) {
    for (let m of methods) {
      this[m] = this[m].bind(this)
    }
  }

  appNickname() {
    return this.getGlobalState('appNickname')
  }

  appId(webApp) {
    if (!webApp) {
      webApp = this.appNickname()
    }
    return this.appState().config.appId[webApp]
  }

  capitalize(x) {
    return x.substring(0,1).toUpperCase() + x.substring(1)
  }

  getEtherscan(address, netId) {
    if (!netId) {
      netId = this.appState().netId
    }
    return `https://${netId === '3' ? 'ropsten.' : ''}etherscan.io/address/${address}`
  }

  appName() {
    return this.props.webApp
      ? this.capitalize(this.props.webApp)
      : this.capitalize(this.getGlobalState('appNickname'))
  }

  appUid(data, webApp) {
    if (!webApp) {
      webApp = this.appNickname()
    }
    if (webApp === 'twitter') {
      return data.userId
    } else {
      return data.username.toLowerCase()
    }
  }

  appState() {
    return this.props.app.appState
  }

  getGlobalState(prop) {
    const as = this.appState()
    if (as.wallet) {
      const shortWallet = this.shortWallet()
      return (as.data[shortWallet]||{})[prop]
    }
  }

  setGlobalState(pars, states = {}) {
    if (this.appState().wallet) {
      this.db.put(this.shortWallet(), pars)
    }
    this.props.app.callMethod('setAppState', states)
  }

  shortWallet() {
    return this.appState().wallet.substring(0, 6)
  }

  historyPush(section) {
    this.props.app.callMethod('historyPush', {section})
  }

  render() {
    return <div/>
  }
}

export default Basic
