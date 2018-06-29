import LoadingButton from './extras/LoadingButton'
import Account from './Account'

const {Panel, Alert, Grid, Row, Col} = ReactBootstrap
import Basic from './Basic'


class Welcome extends Basic {
  constructor(props) {
    super(props)

    for (let m of [
      'getStats',
      'expandWallet'
    ]) {
      this[m] = this[m].bind(this)
    }

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

        return fetch(window.location.origin + '/api/wallet-stats?r=' + Math.random(), {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            network: this.appState().netId,
            address: state.wallet
          })
        })
          .then((response) => response.json())
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
                                         className="command fa fa-minus-circle"></i>
                  </span>

                  : <span>{as.wallet.substring(0, 6)} <i onClick={this.expandWallet}
                                                         className="command fa fa-plus-circle"></i>
                  </span>
              }</h4>
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
          {/*<Row>*/}
            {/*<Col md={4}>*/}
              {/*<Account*/}
                {/*app={this.props.app}*/}
                {/*webApp="facebook"*/}
                {/*icon="facebook"*/}
                {/*active={false}*/}
              {/*/>*/}
            {/*</Col>*/}
            {/*<Col md={4}>*/}
              {/*<Account*/}
                {/*app={this.props.app}*/}
                {/*icon="google"*/}
                {/*webApp="google"*/}
                {/*active={false}*/}
              {/*/>*/}
            {/*</Col>*/}
          {/*</Row>*/}
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
