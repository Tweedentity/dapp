
class NetworkStatus extends React.Component {

  render() {


    const netId = this.props.appState.netId
    let connectedTo = '...'

    if (netId == '0') {

      connectedTo = <span><i className="fa fa-plug" style={{color: '#f66'}}></i> You are connected to an unsupported Ethereum network</span>

    } else if (netId == '1') {

      connectedTo = <span><i className="fa fa-plug" style={{color: '#8f6'}}></i> You are connected to the main Ethereum network</span>

    } else if (netId == '3') {

      connectedTo = <span><i className="fa fa-plug" style={{color: '#8f6'}}></i> You are connected to the Ropsten Testnet</span>

    } else {

      connectedTo = 'You are not connected to the Ethereum network'
    }

    return (
    <div className="overHeader">
      THIS IS A BETA VERSION &nbsp; {connectedTo}
    </div>
    )
  }
}

export default NetworkStatus
