

class Basic extends React.Component {
  constructor(props) {
    super(props)

    for (let m of [
      'setGlobalState',
      'getGlobalState',
      'shortWallet',
      'historyPush',
      'appState',
      'appNickname',
      'appName',
      'appId',
      'appUid'
    ]) {
      this[m] = this[m].bind(this)
    }
    this.db = this.props.app.db
    this.web3js = this.props.app.web3js
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

  appName() {
    return this.getGlobalState('appNickname') === 'twitter' ? 'Twitter' : 'Reddit'
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
