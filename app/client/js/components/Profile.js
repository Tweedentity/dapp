import BigAlert from "./extras/BigAlert";

const lodash = require('lodash')

import LoadingApp from './LoadingApp'
import Account from './Account'

const {Alert, Grid, Row, Col} = ReactBootstrap
import Basic from './Basic'


class Profile extends Basic {
  constructor(props) {
    super(props)

  }

  render() {

    const as = this.appState()

    if (as.invalidProfileAddress) {
      return (
        <Grid>
          <Row>
            <Col md={12}>
              <BigAlert
                title="Whoops"
                message={`The address ${as.profileAddress} is not valid`}
              />
            </Col>
          </Row>
        </Grid>
      )
    }

    const wallet = as.profileAddress
    const profiles = as.profiles[wallet]

    if (profiles && profiles.loaded) {

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
                <a href={this.getEtherscan(wallet)} target="_blank">{wallet}</a>'s profile {
                wallet === as.wallet
                  ? <span className="danger"> (this is you)</span> : null
              }
              </h4>
            </Col>
          </Row>
          <Row>
              <Col md={4}>
                  <Account
                    app={this.props.app}
                    icon="twitter"
                    webApp="twitter"
                    data={profiles.twitter}
                    active={true}
                    noSettings={wallet === as.wallet}
                    profile={true}
                  />
                </Col>
              <Col md={4}>
                  <Account
                    app={this.props.app}
                    icon="reddit"
                    webApp="reddit"
                    data={profiles.reddit}
                    active={true}
                    noSettings={wallet === as.wallet}
                    profile={true}
                  />
                </Col>
            {/*<Col md={4}>*/}
              {/*<Account*/}
                {/*app={this.props.app}*/}
                {/*icon="github"*/}
                {/*webApp="github"*/}
                {/*active={false}*/}
              {/*/>*/}
            {/*</Col>*/}
          </Row>
        </Grid>
      )

    }

    return <LoadingApp
      app={this.props.app}
      message="Loading the profile..."
    />
  }
}

export default Profile
