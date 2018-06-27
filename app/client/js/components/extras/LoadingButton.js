const {Button} = ReactBootstrap

class LoadingButton extends React.Component {


  constructor(props) {
    super(props);
  }

  render() {

    return (
      <Button
        bsStyle="info"
        onClick={this.props.cmd}
        disabled={this.props.disabled || this.props.loading}
        ref={this.button}
      >{
        this.props.loading
          ?
          <span><img src="img/spinnerWhite.svg" width="12" style={{marginRight: 4}}/> {this.props.loadingText}</span>
          : this.props.text
      }</Button>
    )
  }

}

export default LoadingButton
