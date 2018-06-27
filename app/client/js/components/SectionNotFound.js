import BigAlert from './extras/BigAlert'
import Basic from './Basic'

const {Grid, Row, Col} = ReactBootstrap

class SectionNotFound extends Basic {

  constructor(props) {
    super(props)

    this.goWelcome = this.goWelcome.bind(this)
  }

  goWelcome() {
    this.historyPush('welcome')
  }

  render() {

    return (
      <Grid>
        <Row>
          <Col md={12}>
            <BigAlert
              title="Whoops"
              message="Section not found or not applicable to the current wallet."
              link={this.goWelcome}
              linkMessage="Ok"
            />
          </Col>
        </Row>
      </Grid>
    )

  }
}

export default SectionNotFound
