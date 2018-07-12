const {Nav, NavItem, NavDropdown, MenuItem, Navbar} = ReactBootstrap
import NetworkStatus from './NetworkStatus'
import Basic from './Basic'

class Header extends Basic {


  constructor(props) {
    super(props)

    this.execCommand = this.execCommand.bind(this)
  }

  goHome() {
    location.href = `${location.protocol}//${location.host.replace(/(d|)app\./, '')}/#/home`
  }


  execCommand(key) {
    if (key === 2) {
      this.historyPush('profile')
    }
  }

  render() {

    let dropDown = {
      anonymous: null,
      twitter: null,
      reddit: null
    }

    const as = this.appState()
    const wallet = as.wallet

    let exists = false

    if (wallet) {

      for (let webApp in dropDown) {
        let data = this.getGlobalState(webApp)
        if (data && data.username) {

          let avatar = <i className={`fab fa-${webApp}`} style={{
            fontSize: '180%',
            color: '#ddd'
          }}>
            <img src={data.avatar} className="tavatar circled" style={{
              marginLeft: 5
            }}/>
          </i>

          dropDown[webApp] = <NavDropdown eventKey={3} title={avatar}
                                          id="basic-nav-dropdown" onSelect={this.execCommand}>
            <li role="presentation">
            <span><b className="tname">{data.name || data.username}</b><br/>
              <a href={this.appState().config.profileOnApp[webApp](data.username)}
                 target="_blank">{this.appState().config.decoration[webApp]}{data.username}</a></span>
            </li>
            {/*<MenuItem divider/>*/}
            {/*<MenuItem eventKey={2}>Profile</MenuItem>*/}
          </NavDropdown>
          exists = true
        }
      }
      if (!exists) {
        dropDown.anonymous = <Nav>
          <NavItem eventKey={1} href="#">
            <span style={{color: '#888'}}>{'Wallet ' + this.appState().wallet.substring(0, 6) + ' (anonymous)'}</span>
          </NavItem>
        </Nav>
      }
    }

    const section = as.hash ? as.hash.split('/')[1] : null
    const dashboard =
      section && section !== 'unconnected' && section !== 'welcome'
      ? <Nav onSelect={() => {
      this.historyPush('welcome')
    }}>
      <NavItem eventKey={1}>
        <i className="fas fa-th"></i> Dashboard
      </NavItem>
    </Nav>
      : null

    const publicProfile =
      exists && section != 'profile'
        ? <Nav onSelect={() => {
          this.historyPush(`profile/${wallet}`)
        }}>
          <NavItem eventKey={1}>
            <i className="fas fa-user-circle"></i> Public profile
          </NavItem>
        </Nav>
        : null

    return (
      <div>
        <NetworkStatus appState={this.props.app.appState}/>
        <Navbar
          staticTop
          componentClass="header"
          className="bs-docs-nav"
          role="banner"
        >
          <Navbar.Header>
            <Navbar.Brand>
              <img src="img/tweedentity-full-logo-w-ico.png" className="logo-header"
                   onClick={this.goHome}
              />
            </Navbar.Brand>
            <Navbar.Toggle/>
            {dashboard}
            {publicProfile}
          </Navbar.Header>
          <Navbar.Collapse>
            <Nav pullRight>

              {dropDown.twitter}
              {dropDown.reddit}
              {dropDown.anonymous}
            </Nav>
          </Navbar.Collapse>
        </Navbar>
      </div>
    )
  }
}

export default Header
