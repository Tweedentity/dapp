

class Basic extends React.Component {
  constructor(props) {
    super(props)

    for (let m of [
      'setGlobalState',
      'getGlobalState',
      'shortWallet',
      'historyPush',
      'appState'
    ]) {
      this[m] = this[m].bind(this)
    }
    this.db = this.props.app.db
    this.web3js = this.props.app.web3js
  }

  appState() {
    return this.props.app.appState
  }

  getGlobalState(prop) {
    const as = this.appState()
    const shortWallet = this.shortWallet()
    if (as.wallet) {
      return as.data[shortWallet][prop]
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
