
class NetworkStatus extends React.Component {

  render() {


    const netId = this.props.appState.netId
    let connectedTo = '...'

    if (netId == null) {

      connectedTo = 'You are not connected to the Ethereum network'

    } else if (netId == '0') {

      connectedTo = <span><i className="fa fa-plug" style={{color: '#f66'}}></i> You are connected to an unsupported Ethereum network</span>

    } else if (netId == '1') {

      connectedTo = <span><i className="fa fa-plug" style={{color: '#f66'}}></i> You are connected to the main Ethereum network</span>

    } else {

      connectedTo = <span><i className="fa fa-plug" style={{color: '#8f6'}}></i> You are connected to the {netId === 1 ? 'main Ethereum' : 'Ropsten test'} network</span>
    }

    return (
    <div className="overHeader">
      THIS IS A BETA VERSION &nbsp; {connectedTo}
    </div>
    )
  }
}

export default NetworkStatus
