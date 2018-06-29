import Basic from './Basic'

const {Grid, Row, Col, Button, Badge} = ReactBootstrap


class LandingPage extends Basic {

  // componentDidMount () {
  //   document.title = "Tweedentity - A self-claimed identity system"
  // }

  goToApp() {
    location.href = `${location.protocol}//dapp.${location.host}/#/connecting`
  }

  render() {

    const as = this.appState()

    return (
      <div>
      <Grid>

        <Row>
          <Col md={12}>
            <p className="centered logo"><img src="/img/tweedentity-complete-logo.png" className="fulllogo" /></p>
          </Col>
        </Row>

        <Row>
          <Col md={12}>
            <blockquote>In the era of decentralized apps (ÐApps), people deserve a simpler way to identify
              themselves and log in.
            </blockquote>
          </Col>
        </Row>
      </Grid>

        <div className="thinline"><div></div></div>

        <Grid>
        <Row>
          <Col md={3}>
            <h3>What it is</h3>
            <p>Tweedentity is a secure identity solution that connects the centralized and
              the decentralized world, associating univocally a Twitter user-id to an Ethereum address.
            </p>
          </Col>
          <Col md={3}>
            <h3>What it allows</h3>
            <p>After setting up your <i>tweedentity</i>, anytime that you open a ÐApp, it will recognizes
              your Twitter user-id and authenticate yourself. Automatically.
            </p>
          </Col>
          <Col md={3}>
            <h3>Why it's great</h3>
            <p>No more username, email, and passwords. Who you are is incised in the blockchain.
            </p>
            <p className="smaller">You may just need
              to confirm your <i>tweedentity</i> signing a verification code with your wallet.</p>
          </Col>
          <Col md={3}>
            <p className="centered trynow">
              <Button bsStyle="info" bsSize="large"
            onClick={ this.goToApp}
            >Try the beta!</Button>
            </p>
          </Col>
        </Row>
        </Grid>

        <div className="thinline"><div></div></div>

        <Grid>

        <Row>
          <Col md={12}>
            <div className="centered">
            <h1>How it works</h1>
            </div>
          </Col>
        </Row>

        <Row>
          <Col md={3}>
            <div className="semicentered"><Badge>1</Badge></div>
            <p>The Tweedentity ÐApp asks your Twitter screen name, retrieves from
              Twitter your user-id (for example '12345') and starts Metamask to sign a string like
              'twitter/12345' with your wallet.
            </p>

          </Col>
          <Col md={3}>
            <div className="semicentered"><Badge>2</Badge></div>
            <p>After receiving the signature from Metamask, and verifying that it is correct (to avoid
              spending gas for nothing), the ÐApp will ask you to publish it on your Twitter feed.
            </p>
          </Col>
          <Col md={3}>
            <div className="semicentered"><Badge>3</Badge></div>
            <p>When you have done, the ÐApp reads your Twitter feed, detects the tweet containing the
              signature, and asks you to send a fraction of a dollar to the Tweedentity smart contract,
              passing the id of the tweet as data.
            </p>
          </Col>
          <Col md={3}>
            <div className="semicentered"><Badge>4</Badge></div>
            <p>The smart contract uses the fraction of a dollar to pay a third party call to an API which
              retrieves the tweet and verifies that the signature is correct. If so, the smart contract
              saves the new <i>tweedentity</i> in the blockchain. </p>
          </Col>
        </Row>
        </Grid>

        <div className="thinline"><div></div></div>

        <Grid>
        <Row>
          <Col md={6}>
            <h3>Privacy</h3>
            <p>
              The blockchain is public. If you set
              your <i>tweedentity</i> using a wallet which you usually use to
              send and receive coins, everyone will know all of your
              business.
            </p>
            <p>The best practice is to use a brand new wallet which has no connections with any of your
              other wallets. Though, you need a bit of ether to activate your <i>tweedentity</i>. The best
              way to transfer ether to your brand new identity wallet is to use an exchange like
              <a
                href="https://https://shapeshift.io/" target="_blank">ShapeShift</a> or a mixer like <a
                href="https://www.eth-mixer.com/" target="_blank">ETH-Mixer</a>.
            </p>
          </Col>
          <Col md={6}>
            <h3>Security</h3>
            <p>
              The blockchain is a very secure technology that nobody
              has
              been able to break in more than ten years from the appearance of Bitcoin. </p>
            <p className="mb9">Tweedentity uses a set of smart contracts in the Ethereum VM, paired with a
              minimal server API, to verify and save your identity. No one but you can set
              your <i>tweedentity</i>
              up. No one but you can remove it from the blockchain. </p>

            <p><a href="https://medium.com/0xnil/introducing-tweedentity-7b6a355c83fb" target="_blank">Read
              more about privacy and security in this intro post</a>
            </p>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <h3>Tweedentity vs uPort, Origin, Civic...</h3>
            <p>There are many projects who are working on identity in the Ethereum VM. Most of them adopts the great <a href="https://github.com/ethereum/EIPs/issues/725" target="_blank">EIP-725</a> standard, which allows wallets to do a claim, for example "I own a Twitter account", and issuers to verify and confirm the claim. While it is a good approach to decentralized identity, it still requires that we trust the issuers.</p>
            <p>Tweedentity differs from them because it is a self-claim system, which allows people to claim the ownership of a public account and verifies that the claim is true without the need for a trusted issuer.</p>
            <p>To do that it uses public smart contracts and a minimalistic Open Source, serverless API. The DApp itself is Open Source and can be forked and improved by the community.</p>
          </Col>

          <Col md={6}>
            <h3>Development</h3>
            <p><b>Tweedentity API</b><br/>A
              simple API to retrieve the tweet and verify the signature.<br/><em>Done.</em></p>
            <p><b>Tweedentity
              Store</b><br/>A set of smart contract to verify and save the <i>tweedentity</i>.<br/>
              <em>Done.</em></p>
            <p><b><a target="_blank" href="https://dapp.tweedentity.com">Tweedentity ÐApp</a></b><br/>A
              decentralized app to set a tweedentity and remove an existent
              one. <br/><em>Done.</em></p>
            <p><b>Tweedentity.js</b><br/>A Javascript library for ÐApp developers. <br/>
              <em>Coming soon.</em></p>
            <p>All the code is in our <a target="_blank" href="https://github.com/tweedentity/dapp">repository on Github</a>.</p>
          </Col>
        </Row>

      </Grid>
      </div>
    )
  }
}

export default LandingPage
