import Basic from './Basic'

const {Grid, Row, Col, Checkbox, Button} = ReactBootstrap


class Terms extends Basic {

  constructor(props) {
    super(props)

    for (let m of [
      'handleTerms'
    ]) {
      this[m] = this[m].bind(this)
    }
  }

  handleTerms(e) {

    this.props.app.db.put('profile', {
      termsAccepted: e.target.checked
    })
  }


  render() {

    const as = this.appState()
    const termsAccepted = as.data.profile && as.data.profile.termsAccepted

    return (<div>
      <Grid>

        <Row>
          <Col md={12}>
            <h3>SIMPLE TERMS OF USE AND PRIVACY</h3>
            <p>Revised: June 26, 2018</p>
          </Col>
        </Row>
      </Grid>

      <div className="thinline">
        <div></div>
      </div>

      <Grid>

        <Row>
          <Col md={12}>


            <p className="centered"><h4>INTRODUCTION</h4></p>
            <p>

              A <i>tweedentity</i> is a public association in the Ethereum Blockchain (i.e., “the Blockchain”), between
              an
              Ethereum Wallet (a “Wallet”) and a user-id of a publicly-accessible account on a social network (a
              “UserID”).</p>
            <p>

              Tweedentity.com (the "DApp") is a decentralized app, which acts as a pure interface to allow anyone who
              owns a Wallet and a publicly-accessible account on a social network to set a <i>tweedentity</i>. In order
              to do so,
              the DApp offers an interface to prepare the data and, when the data are ready, to control their integrity
              and
              execute specific methods of a set of smart contracts on the Blockchain to save the <i>tweedentity</i>. Those
              smart
              contracts are accessible by any other tool which aims to offer the same service to wallet’s owners.
            </p>
            <p></p>
          </Col>
        </Row>
      </Grid>

      <div className="thinline">
        <div></div>
      </div>

      <Grid>

        <Row>
          <Col md={12}>
            <p className="centered"><h4>IN ORDER TO USE APP.TWEEDENTITY.COM YOU MUST KNOW AND AGREE WITH THE FOLLOWING
              POINTS:</h4></p>

            <h5>PRIVACY</h5>
            <p>
              Since the Blockchain is public, any data saved in the Blockchain is public, and will be public forever.
              This means that any <i>tweedentity</i> is public. After that a <i>tweedentity</i> has been set, unsetting it does not
              remove the historical data that can be anyway recovered from the past blocks.
              In other words, privacy does not exist in a public blockchain.</p>
            <p>Only who has a clear understanding of the public nature of
              the Blockchain and of a <i>tweedentity</i>, and agrees to set a public <i>tweedentity</i> on the public
              Blockchain can use
              the DApp. Anyone else must not use the DApp.
            </p>
            <p>In the blockchain, the data are public and only the Wallet's owner can set/unset their <i>tweedentity</i>.
              They can use the DApp or any other compatible tool in order to do so.</p>
            <h5>DATA</h5>
              <p>The tweedentities are saved in the Blockchain, which means that they are stored and maintained by the
              Ethereum VM. This also means that the Wallet’s owner can directly access the smart contracts and use any
              compatible tool to set/unset its <i>tweedentity</i> (for example, the section Write Contract, in the
              Etherscan page of to the contract).
            </p>
          <h5>COSTS</h5>
            <p>
              Setting a <i>tweedentity</i>, despite if the user uses DApp or any other compatible interface, has a cost.
              This
              cost depends on the price of the gas requested by miners to handle the transactions. Since the gas price
              fluctuates heavily on an hourly basis, the price to set a <i>tweedentity</i> can vary from a few cents of
              a dollar
              to many dozens of dollars. It is the sole responsibility of the Wallet's owner to decide the best moment
              to
              set a <i>tweedentity</i>, depending on their willingness of spending money. In any case, the DApp does not
              receive
              any money. Its sole role is to prepare the transaction setting value and gas to exactly cover the required
              costs, making the transaction possible (for example, setting a gas price too low would cause that the
              transaction would never be mined).
            </p>
            <h5>NETWORKS</h5>
            <p>
              The DApp works only on the Main Ethereum Network and, for test purposes, on the Ropsten Testnet. In
              order
              to use the DApp, you must own a Wallet and use a compatible browser with a compatible wallet app.
            </p>
            <h5>LIABILITY</h5>
            <p>
            The Blockchain is not under the control of the DApp. The DApp cannot be considered liable for anything
            would happen in the Blockchain, nor if someone uses the <i>tweedentity</i> for identity theft and/or any
            other
            illegal activities.
            You agree that the DApp is a pure tool and setting/unsetting a <i>tweedentity</i>, and/or whatever happens
            to a
            <i>tweedentity</i>, and/or however a <i>tweedentity</i> is used in the future, is under your own
            responsibility. If you
            disagree, you MUST not use the DApp.
          </p>
            <h5>UPGRADABILITY</h5>
            <p>
            This Terms can be improved and changed at any moment. Accepting them, you accept also all the future
            versions of the Terms.
          </p>
          </Col>
        </Row>
      </Grid>

      <div className="thinline">
        <div></div>
      </div>

      <Grid>

        <Row>
          <Col md={12}>

            <Checkbox inline
                      checked={termsAccepted}
                      onChange={this.handleTerms}
            >I have read the terms of use and the privacy policy above and I agree on everything.</Checkbox>
            <p style={{paddingTop: 12}}>
              <Button
                bsStyle="primary"
                onClick={() => {
                  this.props.app.callMethod('historyBack')
                }}
              >Go back</Button>
            </p>
          </Col>
        </Row>
      </Grid>
    </div>)
  }
}

export default Terms
