const sigUtil = require('eth-sig-util')

import LoadingButton from './extras/LoadingButton'
import Basic from './Basic'
import BigAlert from './extras/BigAlert'
import Account from './Account'

const {Panel, Grid, Row, Col, Button} = ReactBootstrap

// https://www.reddit.com/8u3ywj


class UserIdFound extends Basic {
  constructor(props) {
    super(props)

    for (let m of [
      'signString',
      'getValidationState',
      'useSig'
    ]) {
      this[m] = this[m].bind(this)
    }

    this.signKey = `${this.appState().wallet}:twitter:${this.getGlobalState('userId')}`
    this.validSig = this.appState().data[this.signKey]
  }

  getValidationState() {
    if (/^[a-zA-Z0-9_]{1,15}$/.test(this.getGlobalState('username'))) {
      return 'success'
    } else if (this.getGlobalState('username').length > 0) {
      return 'error'
    }
    return null
  }

  useSig() {
    const as = this.appState()
    const sig = this.validSig
    const webApp = this.getGlobalState('currentWebApp')

    let post = `tweedentity(${as.wallet.substring(0, 6).toLowerCase()},${this.getGlobalState('currentWebApp')}/${this.getGlobalState('userId')},${sig},3,web3;1) ${as.config.account[webApp]}`
    this.setGlobalState({
      post,
      sig: sig
    }, {
      loading: false
    })
    this.db.set(``, sig)
    this.historyPush('signed')
  }

  signString(from, sigStr) {

    this.setGlobalState({}, {
      loading: true,
      err: null
    })

    const msgParams = [
      {
        type: 'string',
        name: 'tweedentity',
        value: sigStr
      }
    ]

    this.web3js.currentProvider.sendAsync({
      method: 'eth_signTypedData',
      params: [msgParams, from],
      from: from,
    }, (err, result) => {
      if (err || result.error) {
        this.setGlobalState({}, {err: 'Message signature canceled', loading: false})
      } else {

        const recovered = sigUtil.recoverTypedSignature({
          data: msgParams,
          sig: result.result
        })

        if (recovered === from) {
          this.db.set(this.signKey, result.result)
          this.validSig = result.result
          this.useSig()
        } else {
          this.setGlobalState({}, {err: 'Failed to verify signer', loading: false})
        }
      }
    })
  }


  render() {

    const as = this.appState()
    const wallet = as.wallet

    const data = as.data[this.shortWallet()]
    const userUrl = `https://www.reddit.com/user/${data.sn}`
    const decorator = data.currentWebApp === 'twitter' ? '@' : 'u/'
    const webApp = data.currentWebApp === 'twitter' ? 'Twitter' : 'Reddit'

    const sigStr = `${data.currentWebApp}/${data.userId}`

    return (
      <Grid>
        <Row>
          <Col md={12}>
            <h4 style={{padding: '0 15px 8px'}}>Your {webApp} data</h4>
          </Col>
        </Row>
        <Row>
          <Col md={4}>
            <Account
              app={this.props.app}
              icon={data.currentWebApp}
              data={data}
              active={true}
              noSettings={true}
            />
          </Col>
          <Col md={8}>
            <Panel>
              <Panel.Body>
                <p><strong>Post your signature</strong></p>
                <p>To verify that you own this {webApp} account, you must publish a special post containing
                  the
                  cryptographic signature of the following string, using your current Ethereum address:</p>
                <p><code>{sigStr}</code></p>
                {
                  as.err
                    ? <BigAlert
                      message={as.err}
                    />
                    : ''
                }
                <p>
                  <LoadingButton
                    text="Sign it now"
                    loadingText="Waiting for signature"
                    loading={as.loading}
                    cmd={() => {
                      this.signString(as.wallet, sigStr)
                    }}
                    disabled={this.getValidationState() !== 'success'}
                  />
                </p>
                {
                  this.validSig
                  ? <div>
                    <p>A previous signature has been found in the local storage.</p>
                    <p><Button
                        bsStyle="warning"
                        onClick={this.useSig}
                    >Use it</Button></p>
                    </div>
                  : null
                }
              </Panel.Body>
            </Panel>
          </Col>
        </Row>
      </Grid>
    )
  }
}

export default UserIdFound
