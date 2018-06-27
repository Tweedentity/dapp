import EventWatcher from "../utils/EventWatcher";

const sigUtil = require('eth-sig-util')

import LoadingButton from './extras/LoadingButton'
import Basic from './Basic'
import Account from './Account'

const {Panel, Grid, Row, Col, Alert} = ReactBootstrap


class ManageAccount extends Basic {
  constructor(props) {
    super(props)

    for (let m of [
      'checkUpgradability'
    ]) {
      this[m] = this[m].bind(this)
    }

    this.state = {}
    this.checkUpgradability()
  }

  checkUpgradability() {
    const wallet = this.appState().wallet
    const userId = this.getGlobalState('twitter').userId

    this.props.app.contracts.manager.getUpgradability(1, wallet, userId, (err, result) => {
      let upgradability = parseInt(result.valueOf(), 10)

      if (upgradability === 2) {

        this.props.app.contracts.twitterStore.getAddressLastUpdate(wallet, (err, result) => {
          const addressLastUpdate = parseInt(result.valueOf(), 10)
          this.props.app.contracts.twitterStore.getUidLastUpdate(userId, (err, result) => {
            const uidLastUpdate = parseInt(result.valueOf(), 10)
            this.props.app.contracts.manager.minimumTimeBeforeUpdate((err, result) => {
              const minimumTimeBeforeUpdate = parseInt(result.valueOf(), 10)
              const lastUpdate = addressLastUpdate > uidLastUpdate ? addressLastUpdate : uidLastUpdate
              const now = Math.round(Date.now()/1000)
              const timeNeed = lastUpdate + minimumTimeBeforeUpdate - now
              this.setState({
                timeNeed
              })

            })
          })
        })
      }
    })
  }

  componentDidMount() {
    this.setGlobalState({
      started: false,
      step: 0
    })
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

  render() {

    const as = this.appState()

    const twitter = as.data[this.shortWallet()].twitter

    return (
      <Grid>
        <Row>
          <Col md={12}>
            <h4 style={{paddingLeft: 15, paddingBottom: 16}}>Your data</h4>
          </Col>
        </Row>
        <Row>
          <Col md={4}>
            <Account
              app={this.props.app}
              icon="twitter"
              data={twitter}
              active={true}
              noSettings={true}
              getStats={() => {
                this.getStats(as)
              }}
            />
          </Col>
          <Col md={8}>
            <Panel>
              <Panel.Body>
                <p><strong>Manage your  tweedentity</strong></p>

                <p>Either if you want to delete your tweedentity or if you like to associate your wallet to another account, you must unset the current tweedentity.</p>
                  { this.state.timeNeed && this.state.timeNeed > 10
                  ? <p><Alert bsStyle="warning">
                      Be careful because if you unset your tweedentity now, you can not set it again because you have set it recently and, for security reason, you have to wait {this.state.timeNeed} seconds before updating it.
                    </Alert></p>
                    : null }

                <p>
                  <LoadingButton
                    text="Unset my tweedentity"
                    loadingText="Waiting for the transaction"
                    loading={as.loading}
                    cmd={() => {
                      this.historyPush('unset')
                    }}
                  />
                </p>
              </Panel.Body>
            </Panel>
          </Col>
        </Row>
      </Grid>
    )
  }
}

export default ManageAccount
