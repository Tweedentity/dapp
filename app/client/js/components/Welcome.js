import LoadingButton from './extras/LoadingButton'
import Account from './Account'

const {Panel, Alert, Grid, Row, Col} = ReactBootstrap
import Basic from './Basic'

class Welcome extends Basic {
  constructor(props) {
    super(props)

    this.bindAll([
      'getStats',
      'expandWallet'
    ])

    this.state = {
      expandWallet: false
    }
  }


  getStats(state, walletAlreadyUsed) {

    const as = this.appState()
    const termsAccepted = as.data.profile && as.data.profile.termsAccepted

    if (termsAccepted) {

      if (walletAlreadyUsed) {

        this.historyPush('get-username')

      } else {

        this.setGlobalState({}, {
          loading: true
        })

        return this
          .fetch('wallet-stats', 'POST', {
            network: as.netId,
            address: state.wallet,
            claimer: this.props.app.contracts.claimer.address
          })
          .then((responseJson) => {
            this.setGlobalState({
              stats: responseJson
            }, {
              loading: false
            })
            this.historyPush('wallet-stats')
          })
      }
    } else {
      this.setGlobalState({}, {
        show: true,
        modalTitle: 'Whoops',
        modalBody: 'Before setting your tweedentity you must accept the term of usage and .',
        secondButton: 'Open the terms',
        modalAction: () => {
          this.historyPush('terms')
        }
      })
    }
  }

  expandWallet() {
    this.setState({
      expandWallet: !this.state.expandWallet
    })
  }

  render() {

    const as = this.appState()
    const wallet = as.wallet

    const state = as.data[this.shortWallet()]

    let walletAlreadyUsed = false

    if (state) {

      let twitterUserId
      let twitter = {}
      try {
        twitterUserId = state.twitter.userId
        twitter = state.twitter
        if (twitterUserId) {
          walletAlreadyUsed = true
        }
      } catch (e) {
      }

      let redditUserId
      let reddit = {}
      try {
        redditUserId = state.reddit.userId
        reddit = state.reddit
        if (redditUserId) {
          walletAlreadyUsed = true
        }
      } catch (e) {
      }

      return (
        <Grid>
          <Row>
            <Col md={12}>
              <h4 style={{
                textAlign: 'center',
                marginBottom: 48,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {
                  twitterUserId || redditUserId
                    ? 'Welcome back ' : 'Welcome '
                } {
                this.state.expandWallet
                  ? <span>{as.wallet} <i onClick={this.expandWallet}
                                         className="command fa fa-minus-circle" style={{cursor: 'pointer'}}></i>
                  </span>

                  : <span>{as.wallet.substring(0, 6)} <i onClick={this.expandWallet}
                                                         className="command fa fa-plus-circle" style={{cursor: 'pointer'}}></i>
                  </span>
              }</h4>
              {
                as.ready === 0
                  ? <p className="centered" style={{
                    paddingBottom: 16,
                    marginTop: -30
                  }}>
                    <span className="danger"><i className="fas fa-exclamation-circle"></i> The Tweedentity smart contracts are under maintainance and right now it is not possible to set or unset a tweedentity.</span>
                  </p>
                  : null
              }
            </Col>
          </Row>
          <Row>
            <Col md={4}>
              <Account
                app={this.props.app}
                icon="twitter"
                webApp="twitter"
                data={twitter}
                active={true}
                getStats={() => {
                  this.setGlobalState({
                    appNickname: 'twitter'
                  })
                  this.getStats(as, walletAlreadyUsed)
                }}
              />
            </Col>
            <Col md={4}>
              <Account
                app={this.props.app}
                icon="reddit"
                webApp="reddit"
                data={reddit}
                active={true}
                getStats={() => {
                  this.setGlobalState({
                    appNickname: 'reddit'
                  })
                  this.getStats(as, walletAlreadyUsed)
                }}
              />
            </Col>
            <Col md={4}>
              <Account
                app={this.props.app}
                icon="github"
                webApp="github"
                active={false}
              />
            </Col>
          </Row>
        </Grid>
      )

    }

    return (
      <Grid>
        <Row>
          <Col md={12}>
            <p><img src="img/spinner.svg"/></p>
            <p>Preparing the app...</p>
          </Col>
        </Row>
      </Grid>
    )
  }
}

export default Welcome
