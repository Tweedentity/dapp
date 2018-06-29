const {Alert, Button, ButtonToolbar} = ReactBootstrap

class BigAlert extends React.Component {

  render() {

    return (
      <Alert bsStyle={this.props.bsStyle || 'danger'}>
        {
          this.props.title
            ? <h4><i className="fas fa-exclamation-circle mr4"></i>
              {this.props.title}</h4>
            : null
        }

        <p>
          {this.props.message}
        </p>
        <p>
          <ButtonToolbar>
            {
              this.props.link
                ?
                typeof this.props.link === 'string'
                  ? <a href={this.props.link} target="_blank">
                    <Button>{this.props.linkMessage}</Button>
                  </a>
                  : <Button onClick={this.props.link}>{this.props.linkMessage}</Button>
                : ''
            }

            {
              this.props.link2
                ?
                typeof this.props.link2 === 'string'
                  ? <a href={this.props.link2} target="_blank">
                    <Button>{this.props.link2Message}</Button>
                  </a>
                  : <Button onClick={this.props.link2}>{this.props.link2Message}</Button>
                : ''
            }
          </ButtonToolbar>
        </p>
      </Alert>
    )
  }

}

export default BigAlert
