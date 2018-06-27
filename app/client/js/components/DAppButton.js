// import React from 'react'

class DAppButton extends React.Component {

  constructor(props) {
    super(props)
    this.runDapp = this.runDapp.bind(this);
  }

  componentDidMount() {
  }

  runDapp() {
    window.location = window.location.origin + '/dapp'
  }

  render() {
    return (
    <button className="button lato bigButton mt24"
            onClick={this.runDapp}
            ><div className="desktop">{this.props.value}</div><div className="mobile">{this.props.mValue || this.props.value}</div></button>
    )
  }
}

export default DAppButton