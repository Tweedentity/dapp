import LoadingButton from './extras/LoadingButton'
import LoadingBadge from './extras/LoadingBadge'
import Basic from './Basic'
import EventWatcher from '../utils/EventWatcher'
import BigAlert from './extras/BigAlert'
import GasPrice from './GasPrice'

const {Panel, Grid, Row, Col, Button, Alert} = ReactBootstrap

class Set extends Basic {
  constructor(props) {
    super(props)

    for (let m of [
      'watchOracleTransactions',
      'startTransaction',
      'goToProfile',
      'checkUpgradability',
      'investigateNotUpgradability',
      'setCost',
      'handlePrice'
    ]) {
      this[m] = this[m].bind(this)
    }
    this.state = {
      upgradability: 0
    }
    this.checkUpgradability()
  }

  investigateNotUpgradability() {
    const upgradability = this.state.upgradability
    const wallet = this.appState().wallet
    const userId = this.getGlobalState('userId')

    if (upgradability === 1) {
      this.props.app.contracts.twitterStore.getAddress(this.getGlobalState('userId'), (err, result) => {
        const address = result.valueOf()
        if (address.toLowerCase() != wallet.toLowerCase()) {
          this.setState({
            upgradabilityMessage: `the userId ${userId} is currently associated with the wallet ${address}.`
          })
        }
      })
    } else {

      this.props.app.contracts.twitterStore.getAddressLastUpdate(wallet, (err, result) => {
        const addressLastUpdate = parseInt(result.valueOf(), 10)
        this.props.app.contracts.twitterStore.getUidLastUpdate(this.getGlobalState('userId'), (err, result) => {
          const uidLastUpdate = parseInt(result.valueOf(), 10)
          this.props.app.contracts.manager.minimumTimeBeforeUpdate((err, result) => {
            const minimumTimeBeforeUpdate = parseInt(result.valueOf(), 10)
            const lastUpdate = addressLastUpdate > uidLastUpdate ? addressLastUpdate : uidLastUpdate
            const now = Math.round(Date.now() / 1000)
            const timeNeed = lastUpdate + minimumTimeBeforeUpdate - now
            this.setState({
              timeNeed,
              upgradabilityMessage: `you have set it recently and, as an anti-spam limitation, you have to wait ${timeNeed} seconds before updating it.`
            })
          })
        })
      })
    }

  }

  checkUpgradability() {
    const as = this.appState()
    const wallet = as.wallet
    this.props.app.contracts.manager.getUpgradability(1, wallet, this.getGlobalState('userId'), (err, result) => {
      const upgradability = parseInt(result.valueOf(), 10)
      this.setState({
        upgradability
      })
      if (upgradability === 0) {
        const average = this.formatFloat(as.gasInfo.average / 10, 1)
        this.setCost(parseFloat(average, 10))
      }

    })
  }

  goToProfile() {
    this.db.set(this.shortWallet(), {})
    this.props.app.callMethod('getAccounts')
    this.historyPush('welcome')
  }

  componentDidMount() {
    if (this.web3js) {
      this.watcher = new EventWatcher(this.web3js)
      const checkState = () => {
        if (this.appState().wallet) {
          if (this.appState().hash === 'set') {
            this.historyPush('signed')
          }
        } else {
          setTimeout(checkState, 100)
        }
      }
      checkState()
    }
    this.props.app.callMethod('getEthInfo')
  }

  watchOracleTransactions(network, address, startBlock, gas, callback) {
    return fetch(window.location.origin + '/api/get-txs?r=' + Math.random(), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        network: this.appState().netId,
        address,
        startBlock,
        gas
      })
    })
      .then((response) => response.json())
      .then(tx => {
        callback(tx)
      })
  }

  startTransaction(appState) {

    this.setGlobalState({
      step: 0
    }, {
      loading: true,
      err: null
    })

    this.watcher.stop()

    const as = this.appState()
    const ethPrice = as.price.value
    const gasInfo = as.gasInfo

    if (ethPrice && gasInfo) {

      let contracts = this.props.app.contracts

      const oraclizeCost = Math.round(1e7 / ethPrice)
      const gasPrice = this.state.price * 1e9
      const gasLimitBase = 170e3 + oraclizeCost
      const gasLimit = gasLimitBase + Math.round(100 * Math.random())

      this.web3js.eth.getBlockNumber((err, blockNumber) => {

        let count = 0

        let timerId
        let watchTxs = () => {
          this.watchOracleTransactions(
            appState.netId,
            as.claimer,
            blockNumber,
            gasLimit,
            tx => {
              if (tx && tx.isError) {
                if (tx.isError === "1") {
                  this.setGlobalState({}, {err: 'The transaction from the oracle failed.', warn: null})
                  this.watcher.stop()
                }
              } else {
                timerId = setTimeout(watchTxs, 30000)
                if (count > 5) {
                  this.setGlobalState({}, {warn: 'The oracle sometimes takes time. Please wait.'})
                }
                count++
              }
            })
        }

        let callbackEvents = [
          {
            event: contracts.twitterStore.IdentitySet,
            filter: {addr: appState.wallet},
            callback: () => {
              this.setGlobalState({step: 3}, {warn: null})
              this.watcher.stop()
              clearTimeout(timerId)
            },
            fromBlock: blockNumber
          },
          {
            event: contracts.claimer.VerificatioFailed,
            filter: {addr: appState.wallet},
            callback: () => {
              this.setGlobalState({}, {err: 'The transaction failed.', warn: null})
              this.watcher.stop()
              clearTimeout(timerId)
            },
            fromBlock: blockNumber
          },
          {
            event: contracts.manager.IdentityNotUpgradable,
            filter: {addr: appState.wallet},
            callback: () => {
              this.setGlobalState({}, {err: 'Identity not upgradable.', warn: null})
              this.watcher.stop()
              clearTimeout(timerId)
            },
            fromBlock: blockNumber
          }
        ]


        let startEvents = [
          {
            event: contracts.claimer.VerificationStarted,
            filter: {addr: appState.wallet},
            callback: () => {
              this.setGlobalState({step: 2})
              this.watcher.stop()
              this.watcher.watch(callbackEvents)
              timerId = setTimeout(watchTxs, 30000)
            },
            fromBlock: blockNumber
          }
        ]

        contracts.claimer.claimAccountOwnership(
          this.getGlobalState('currentWebApp'),
          this.getGlobalState('postId'),
          gasPrice,
          gasLimit,
          {
            value: gasPrice * gasLimit,
            gas: 290e3,
            gasPrice
          }, (err, txHash) => {
            if (err) {
              this.setGlobalState({}, {
                err: 'The transaction has been denied',
                errMessage: 'If you like to set your tweedentity, click the button above to start the transaction.',
                loading: false
              })
            }
            else {
              this.setGlobalState({
                txHash,
                started: true,
                step: 1
              }, {
                loading: false
              })
              this.watcher.watch(startEvents)
              this.watcher.waitFor(
                txHash,
                (receipt) => {
                  return receipt.gasUsed > 16e4
                },
                null,
                () => {
                  this.setGlobalState({}, {
                    err: 'The transaction has been reverted',
                    errMessage: 'If you like to set your tweedentity, click the button above to try again.',
                  })
                }
              )
            }
          })
      })
    } else {
      this.props.getEthInfo()
      this.setGlobalState({}, {
        err: 'No ether and gas info found.',
        errMessage: 'Reloading them. Try again in a moment.',
        loading: false
      })
    }
  }

  formatFloat(f, d) {
    f = f.toString().split('.')
    return f[0] + (f[1] ? '.' + f[1].substring(0, d) : '')
  }

  setCost(price) {
    const as = this.appState()
    if (as.price.value) {
      const gasPrice = price * 1e8
      const ethPrice = parseFloat(as.price.value, 10)
      const oraclizeCost = Math.round(1e7 / ethPrice)
      const gasLimitTx = 290e3
      const gasLimitOraclize = oraclizeCost + 170e3
      const gasLimit = gasLimitTx + gasLimitOraclize

      this.setState({
        price,
        eth: this.formatFloat(gasPrice * gasLimit / 1e17, 6),
        usd: this.formatFloat(ethPrice * gasPrice * gasLimit / 1e17, 3)
      })
    }
    else {
      this.props.getEthInfo()
      this.setGlobalState({}, {
        err: 'No ether and gas info found.',
        errMessage: 'Reloading them. Try again in a moment.',
        loading: false
      })
    }
  }

  handlePrice(price) {
    this.setCost(price)
  }

  render() {

    const as = this.appState()

    const state = as.data[this.shortWallet()]
    const webApp = as.currentWebApp

    if (!state.started) {

      const safeLow = this.formatFloat(as.gasInfo.safeLow / 10, 1)
      const sl = parseFloat(safeLow, 10)
      const average = this.formatFloat(as.gasInfo.average / 10, 1)
      const a = parseFloat(average, 10)

      let userIdBlock =
        webApp === 'twitter'
          ? <span><span className="code">Uid:</span> <span
            className="code success">{state.userId}</span></span>
          : <span><span className="code">Uid:</span> <span
            className="code success">{state.username}</span></span>

      let note = webApp === 'twitter'
        ? null
        : <p>
          <span style={{fontSize: '80%'}}>NOTE: For Reddit we are going to save the username in the blockchain instead of the user-id. This is fine because in Reddit the username is immutable.</span>
        </p>

      return (
        <Grid>
          <Row>
            <Col md={12}>
              <h4 style={{padding: '0 15px 8px'}}>Set your <em>tweedentity</em></h4>
              <Panel>
                <Panel.Body>
                  <p><strong>All is ready</strong></p>
                  <p>In the next step, you will send a bit of ether to the Tweedentity Smart Contract to
                    cover the gas necessary to set your <em>tweedentity</em> in the Ethereum Blockchain.</p>
                  <p>Be
                    adviced, after than you have created it, your Twitter user-id and your wallet will be publicly
                    associated.
                  </p>
                  <p>
                    {userIdBlock}<br/>
                    <span className="code">Wallet:</span> <span
                    className="code success">{as.wallet}</span>
                  </p>
                  {note}
                </Panel.Body>
              </Panel>
            </Col>
          </Row>

          {
            this.state.upgradability === 0 || (typeof this.state.timeNeed !== 'undefined' && this.state.timeNeed < 10)
              ?
              <div style={{paddingTop: 24}}>
                <Row>
                  <Col md={12}>
                    <p><strong>Choose how much you like to spend</strong></p>
                    <p>Based on <a href="https://ethgasstation.info" target="_blank">ETH Gas Station</a>, currently {
                      sl != a
                        ? <span>the safe low price is <strong>{safeLow} Gwei</strong> while the
                      average price is <strong>{average} Gwei</strong></span>
                        : <span>safe low and average price are <strong>{safeLow} Gwei</strong></span>
                    }.
                    </p>
                    <p>Usually the average price is the best choice. Going lower than the safe low price can require
                      hours to complete the set up. Prices higher than the average should complete the set up in a
                      couple of minutes. Going too higher than the average is not very useful.</p>
                    {
                      a > 4
                        ?
                        <p>If you aren't in a rush and can wait a better moment to set up your tweedentity, you can save
                          money because often the gas price is around 1 or 2 Gwei.</p>
                        : null
                    }
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <p>
                      <GasPrice
                        handlePrice={this.handlePrice}
                        safeLow={sl}
                        average={a}
                      />
                    </p>
                    <p>Total cost: {this.state.eth} ETH ( ~${this.state.usd} )</p>
                  </Col>
                </Row>
                <Row>
                  <Col md={12}>
                    {
                      as.err
                        ? <p style={{paddingTop: 12}}><BigAlert
                          title={as.err}
                          message={as.errMessage}
                        /></p>
                        : ''
                    }
                    <p><LoadingButton
                      text={as.err ? 'Try again' : 'Set it now!'}
                      loadingText="Starting transaction"
                      loading={as.loading}
                      cmd={() => {
                        this.startTransaction(as)
                      }}
                    /></p>
                  </Col>
                </Row>
              </div>
              :
              this.state.upgradabilityMessage
                ? <Row>
                  <Col md={12}>
                    <p><BigAlert
                      bsStyle="warning"
                      message={`The tweedentity is not upgradable because ${this.state.upgradabilityMessage}`}
                    /></p>
                  </Col>
                </Row>
                : <Row>
                  <Col md={12}>
                    <p><BigAlert
                      bsStyle="warning"
                      title="Whoops"
                      message="The tweedentity looks not upgradable"
                      link={this.investigateNotUpgradability}
                      linkMessage="Find why"
                    /></p>
                  </Col>
                </Row>
          }

        </Grid>
      )
    } else {

      let transaction = <a
        href={'https://' + (as.netId === '3' ? 'ropsten.' : '') + 'etherscan.io/tx/' + state.txHash}
        target="_blank">transaction</a>

      return (
        <Grid>
          <Row>
            <Col md={12}>
              <h4 style={{padding: '0 15px 8px'}}>Verification started
              </h4>
              <p><span className="mr12">
          <LoadingBadge
            text="1"
            loading={false}
          />
          </span>
                The transaction has been requested.</p>
              <p><span className="mr12">
          <LoadingBadge
            text="2"
            loading={state.step < 2 && !as.err}
          />
          </span>
                {
                  state.step === 2
                    ? <span>The {transaction} has been successfully confirmed.</span>
                    : state.step === 1
                    ? <span>The {transaction} has been included in a block. Waiting for confirmations.</span>
                    : <span>Waiting for the transaction to be included in a block.</span>

                }
              </p>
              {
                state.step > 1
                  ? <p><span className="mr12">
                      <LoadingBadge
                        text="3"
                        loading={state.step < 3 && !as.err}
                      />
                      </span>
                    {
                      state.step === 3
                        ? <span>The oracle has confirmed the ownership.</span>
                        : <span>Waiting for the oracle which is verifying the ownership.</span>
                    }</p>
                  : null
              }
              {
                state.step === 3
                  ?
                  <p><Button style={{marginTop: 6}} bsStyle="success" onClick={this.goToProfile}>Go to your
                    profile</Button>
                  </p>
                  : ''
              }
              {
                as.err
                  ?
                  <BigAlert
                    title="Whoops"
                    message={as.err}
                    link={() => {
                      this.setGlobalState({}, {err: null})
                      this.setGlobalState({
                        started: false,
                        step: 0
                      })
                      this.historyPush('signed')
                    }}
                    linkMessage="Go back"
                  />
                  : as.warn
                  ? <Alert bsStyle="warning">{as.warn}</Alert>
                  : ''
              }
            </Col>
          </Row>
        </Grid>
      )
    }

  }
}

export default Set
