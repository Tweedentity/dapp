const {Alert, Button} = ReactBootstrap

class BigAlert extends React.Component {

  render() {

    return (
    <Alert bsStyle={this.props.bsStyle || 'danger'}>
      {
        this.props.title
        ? <h4><i className="fa fa-exclamation-triangle mr4"></i>
            {this.props.title}</h4>
          : null
      }

      <p>
        {this.props.message}
      </p>
      {
        this.props.link
        ? <p>{
typeof this.props.link === 'string'
            ? <a href={this.props.link} target="_blank">
      <Button>{this.props.linkMessage}</Button>
    </a>
    : <Button onClick={this.props.link}>{this.props.linkMessage}</Button>

            }</p>
        : ''
      }
    </Alert>
    )
  }

}

export default BigAlert
