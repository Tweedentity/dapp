import Basic from './Basic'
const {Panel, Alert, Grid, Row, Col, Button} = ReactBootstrap

class WalletStats extends Basic {

  getColorClass(val, lim) {
    return val >= (lim || 4) ? 'danger' : val > 1 ? 'warning' : 'success'
  }

  getEtherscan(address, netId) {
    return `https://${netId === '3' ? 'ropsten.' : ''}etherscan.io/address/${address}`
  }

  formatStats(stats, netId, address) {
    return (
      <span>
      <span className="code success">Balance: {stats.balance} ether</span><br/>
      <span className={'code ' + this.getColorClass(stats.txs)}>{stats.txs} transactions <a
        href={this.getEtherscan(address, netId)} target="_blank"><i className="fa fa-link"></i></a></span><br/>
      <span
        className={'code ' + this.getColorClass(stats.valueFrom)}>{stats.valueFrom} ether received from {stats.froms} addresses</span><br/>
      <span
        className={'code ' + this.getColorClass(stats.tos)}>{stats.valueTo} ether sent to {stats.tos} addresses</span><br/>
      <span className={'code ' + this.getColorClass(stats.deployes, 1)}>{stats.deployes} contracts deployed</span><br/>
      <span className={'code ' + this.getColorClass(stats.execs)}>{stats.execs} contract functions executed</span>
    </span>
    )
  }

  render() {

    const as = this.appState()
    const state = as.data[this.shortWallet()]

    const nextStep = <strong>Your wallet looks good.</strong>
    const notGood = <strong>Whoops, you did many transactions with this wallet.</strong>
    const veryBad = <strong>Be careful, you did a lot of transactions with this wallet.</strong>

    let bestPractice = <span>The best
      practice is to set a new wallet and send a minimum amount of ether to it using an exchange like <a
        href="https://shapeshift.io/" target="_blank">ShapeShift</a> or a mixer like <a
        href="https://www.eth-mixer.com/" target="_blank">ETH-Mixer</a>.</span>

    if (as.env === 'ropsten') {
      bestPractice = <span>The best
      practice is to set a new wallet and requeste a few ether at <a
          href="https://faucet.metamask.io/" target="_blank">MetaMask Ether Faucet</a>.</span>
    }

    const weSuggest = <p>For your privacy, we suggest you use a wallet with almost no transactions to /from any
      other wallet. After that you have set your tweedentity, anyone could see all your transactions. {bestPractice}</p>

    const moreInfo = ''
    // <p>Read more about privacy issues and how to solve them <a href="#" target="_blank">here</a>.</p>


    const mainStats = state.stats.main
    const ropstenStats = state.stats.ropsten

    const score = mainStats.txs + mainStats.deployes + mainStats.execs
    const cls = score < 3 ? 'primary' : score < 5 ? 'warning' : 'danger'

    const minimum = '0.' + (1 / parseFloat(as.price, 10)).toString().split('.')[1].substring(0, 4)

    const lowBalance = <Alert bsStyle="danger">Balance too low. You need {minimum} ether to activate your
      tweedentity.</Alert>

    return (
      <Grid>
        <Row>
          <Col md={12}>
            <h4 style={{padding: '0 15px 8px'}}>Wallet Statistics</h4>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <Panel>
              <Panel.Body>
                <p><strong>Main Network</strong></p>
                <p>{this.formatStats(mainStats, '1', as.wallet)}</p>
              </Panel.Body>
            </Panel>
          </Col>
          <Col md={6}>
            <Panel>
              <Panel.Body>
                <p><strong>Ropsten Network</strong></p>
                <p>{this.formatStats(ropstenStats, '3', as.wallet)}</p>
              </Panel.Body></Panel>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            {
              (as.netId === '1' && mainStats.balance < minimum)
              || (as.netId === '3' && ropstenStats.balance < minimum)
                ? lowBalance : ''
            }
            <Alert bsStyle={score < 3 ? 'info' : score < 5 ? 'warning' : 'danger'}>
              <p>{
                score < 3
                  ? nextStep
                  : score < 5
                  ? notGood
                  : veryBad
              }</p>
              {weSuggest}
              {moreInfo}
            </Alert>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <Button bsStyle={score < 3 ? 'info' : score < 5 ? 'warning' : 'danger'}
                    onClick={() =>{
                      this.historyPush('get-username')
                    }}>
              {score < 3 ? 'Use this wallet' : 'Use this wallet, anyway. I know what I am doing'}
            </Button>
          </Col>
        </Row>
      </Grid>
    )
  }
}

export default WalletStats
