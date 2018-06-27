const {Badge} = ReactBootstrap

class LoadingBadge extends React.Component {

  render() {

    return (
      <span className="bitmr">{
        this.props.loading
          ? <img src="img/spinner.svg" width="20" style={{marginRight: 2}}/>
          : <Badge bsClass={this.props.bsClass}>{this.props.text}</Badge>
      }</span>
    )
  }

}

export default LoadingBadge
