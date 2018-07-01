import Basic from './Basic'

const {Grid, Row, Col} = ReactBootstrap


class LoadingApp extends Basic {

  render() {

    return (
      <Grid>
        <Row>
          <Col md={12}>
            <p className="centered" style={{paddingTop: 160}}><img src="img/spinner.svg"/></p>
            <p className="centered" style={{paddingBottom: 160}}>{this.props.message}</p>
          </Col>
        </Row>
      </Grid>
    )

  }
}

export default LoadingApp
