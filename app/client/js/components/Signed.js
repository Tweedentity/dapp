import LoadingButton from './extras/LoadingButton'
import BigAlert from './extras/BigAlert'
import Basic from './Basic'

const {Panel, Grid, Row, Col, FormGroup, Button, FormControl} = ReactBootstrap


class Signed extends Basic {
  constructor(props) {
    super(props)

    for (let m of [
      'handleFocus',
      'findPost'
    ]) {
      this[m] = this[m].bind(this)
    }
  }

  componentDidMount() {
    this.setGlobalState({
      started: false,
      step: 0
    })
  }

  handleFocus(event) {
    event.target.select()
  }

  findPost() {
    this.setGlobalState({}, {
      loading: true,
      err: null
    })
    return fetch(window.location.origin + `/api/scan-${this.getGlobalState('currentWebApp')}?r=` + Math.random(), {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        network: this.appState().netId,
        username: this.getGlobalState('username'),
        sig: this.getGlobalState('post')
      }),
    })
      .then((response) => response.json())
      .then((responseJson) => {
        if (responseJson.error) {
          throw new Error(responseJson.error)
        }
        const r = responseJson.result

        if (r.postId) {
          this.setGlobalState({
            postId: r.postId
          }, {
            loading: false
          })
          this.historyPush('set')
        } else {
          throw(new Error('Not found'))
        }
      })
      .catch(err => {
        this.setGlobalState({}, {
          err: err.message,
          loading: false
        })
      })
  }

  render() {

    const as = this.appState()
    const currentWebApp = this.getGlobalState('currentWebApp')
    const webApp = currentWebApp === 'twitter' ? 'Twitter' : 'Reddit'

    const state = as.data[this.shortWallet()]

    const webAppUrl = as.config.forPost[currentWebApp](state.post)

    const sentence = webApp === 'Twitter'
    ? <p>Please, click the button to open Twitter in a new
        tab. Tweedentity does not use the Twitter api, but you will be ready to post the signature using the Twitter intent.</p>

      : <p>Please, copy the signature and click the button to open Reddit in a new
        tab. It will redirect you to a special post by Tweedentity. You can comment with the signature. Though, if you don't find the post or prefer to do otherwise, just post the signature on Reddit wherever you like.</p>

    return (
      <Grid>
        <Row>
          <Col md={12}>
            <h4 style={{padding: '0 15px 8px'}}>Post and verify</h4>
            <Panel>
              <Panel.Body>
                <p><strong>Your signature is ready</strong></p>
                {sentence}
                <p>When you have done, come back here and continue.</p>
                <p><i>Notice that after the verification is completed, you can cancel the post, if you like.</i></p>
                <div style={{padding: 24}}>
                  <form>
                    <FormGroup
                      controlId="someText"
                    >
                      <FormControl
                        type="text"
                        value={state.post}
                        readOnly={true}
                        onFocus={this.handleFocus}
                      />
                      <FormControl.Feedback/>
                    </FormGroup>
                  </form>
                </div>
                {
                  as.err === 'User not found'
                    ? <BigAlert
                      title="Whoops"
                      message="The user has not been found. Very weird :-("
                      link={() => {
                        this.setGlobalState({}, {err: null})
                        this.historyPush('get-username')
                      }}
                      linkMessage="Input the username again"
                    />
                    : as.err === 'Wrong post'
                    ? <BigAlert
                      title="Whoops"
                      message="No post with a valid signature was found."
                      link={() => {
                        this.setGlobalState({}, {err: null})
                        this.historyPush('userid-found')
                      }}
                      linkMessage="Go back and post the signature"
                    />
                    : as.err === 'Wrong signature'
                      ? <BigAlert
                        title="Whoops"
                        message="A post was found but with a wrong signature."
                        link={() => {
                          this.setGlobalState({}, {err: null})
                          this.historyPush('get-username')
                        }}
                        linkMessage="Input the username again"
                      />
                      : as.err === 'Wrong user'
                        ? <BigAlert
                          title="Whoops"
                          message="A post with the right signature was found, but it was posted by someone else."
                          link={() => {
                            this.setGlobalState({}, {err: null})
                            this.historyPush('get-username')
                          }}
                          linkMessage="Input the username again"
                        />
                        : <p><a
                          href={webAppUrl}
                          target="_blank">
                          <Button bsStyle="primary">
                            Open {webApp} now
                          </Button></a>
                          <span className="spacer"></span>
                          <LoadingButton
                            text="I posted it, continue"
                            loadingText="Finding the post"
                            loading={as.loading}
                            cmd={this.findPost}
                          />
                        </p>

                }

              </Panel.Body>
            </Panel>
          </Col>
        </Row>
      </Grid>
    )
  }
}

export default Signed
