const {Nav, NavItem, NavDropdown, MenuItem, Navbar} = ReactBootstrap
import NetworkStatus from './NetworkStatus'
import Basic from './Basic'

class Header extends Basic {


  constructor(props) {
    super(props)

    this.execCommand = this.execCommand.bind(this)
  }

  goHome() {
    location.href = `${location.protocol}//${location.host.replace(/(d|)app\./,'')}/#/home`
  }


  execCommand(key) {
    if (key === 2) {
      this.historyPush('profile')
    }
  }

  render() {

    let dropDown

    const ps = this.appState()
    const wallet = ps.wallet
    let twitter
    try {
      twitter = ps.data[wallet.substring(0,6)].twitter
    } catch (e) {
    }

    if (wallet) {

      if (twitter && twitter.name) {
        dropDown = <NavDropdown eventKey={3} title={<img src={twitter.avatar} className="tavatar circled"/>}
                                id="basic-nav-dropdown" onSelect={this.execCommand}>
          <li role="presentation">
            <span><b className="tname">{twitter.name}</b><br/>
              @{twitter.username}</span>
          </li>
          {/*<MenuItem divider/>*/}
          {/*<MenuItem eventKey={2}>Profile</MenuItem>*/}
        </NavDropdown>
      } else {
        dropDown = <Nav>
          <NavItem eventKey={1} href="#">
            {'Wallet ' + this.appState().wallet.substring(0, 6) + ' (anonymous)'}
          </NavItem>
        </Nav>
      }
    }

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
          </Navbar.Header>
          <Navbar.Collapse>
            <Nav pullRight>
              {dropDown}
            </Nav>
          </Navbar.Collapse>
        </Navbar>
      </div>
    )
  }
}

export default Header
