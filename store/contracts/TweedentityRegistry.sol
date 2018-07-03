pragma solidity ^0.4.23;


import 'openzeppelin-solidity/contracts/ownership/HasNoEther.sol';


contract ManagerInterface {

  function paused()
  public
  constant returns (bool);


  function claimer()
  public
  constant returns (address);

  function totalStores()
  public
  constant returns (uint);


  function getStoreAddress(
    string _appNickname
  )
  external
  constant returns (address);


  function getStoreAddressById(
    uint _appId
  )
  external
  constant returns (address);


  function isStoreActive(
    uint _appId
  )
  public
  constant returns (bool);

}

contract ClaimerInterface {

  function manager()
  public
  constant returns (address);
}


contract StoreInterface {

  function appSet()
  public
  constant returns (bool);


  function manager()
  public
  constant returns (address);

}


/**
 * @title TweedentityRegistry
 * @author Francesco Sullo <francesco@sullo.co>
 * @dev It store the tweedentities contracts addresses to allows dapp to be updated
 */


contract TweedentityRegistry
is HasNoEther
{

  string public fromVersion = "1.1.0";

  address public manager;
  address public claimer;

  event ContractRegistered(
    bytes32 indexed key,
    string spec,
    address addr
  );


  function setManager(
    address _manager
  )
  public
  onlyOwner
  {
    require(_manager != address(0));
    manager = _manager;
    emit ContractRegistered(keccak256("manager"), "", _manager);
  }


  function setClaimer(
    address _claimer
  )
  public
  onlyOwner
  {
    require(_claimer != address(0));
    claimer = _claimer;
    emit ContractRegistered(keccak256("claimer"), "", _claimer);
  }


  function setManagerAndClaimer(
    address _manager,
    address _claimer
  )
  external
  onlyOwner
  {
    setManager(_manager);
    setClaimer(_claimer);
  }


  /**
   * @dev Gets the store managing the specified app
   * @param _appNickname The nickname of the app
   */
  function getStore(
    string _appNickname
  )
  public
  constant returns (address)
  {
    ManagerInterface theManager = ManagerInterface(manager);
    return theManager.getStoreAddress(_appNickname);
  }


  // error codes

  uint public allSet = 0;
  uint public managerUnset = 10;
  uint public claimerUnset = 20;
  uint public wrongClaimerOrUnsetInManager = 30;
  uint public wrongManagerOrUnsetInClaimer = 40;
  uint public noStoresSet = 50;
  uint public noStoreIsActive = 60;
  uint public managerIsPaused = 70;
  uint public managerNotSetInApp = 1000;

  /**
   * @dev Returns true if the registry looks ready
   */
  function isReady()
  external
  constant returns (uint)
  {
    if (manager == address(0)) {
      return managerUnset;
    }
    if (claimer == address(0)) {
      return claimerUnset;
    }
    ManagerInterface theManager = ManagerInterface(manager);
    ClaimerInterface theClaimer = ClaimerInterface(claimer);
    if (theManager.claimer() != claimer) {
      return wrongClaimerOrUnsetInManager;
    }
    if (theClaimer.manager() != manager) {
      return wrongManagerOrUnsetInClaimer;
    }
    uint totalStores = theManager.totalStores();
    if (totalStores == 0) {
      return noStoresSet;
    }
    bool atLeastOneIsActive;
    for (uint i = 1; i <= totalStores; i++) {
      StoreInterface theStore = StoreInterface(theManager.getStoreAddressById(i));
      if (theManager.isStoreActive(i)) {
        atLeastOneIsActive = true;
      }
      if (theManager.isStoreActive(i)) {
        if (theStore.manager() != manager) {
          return managerNotSetInApp + i;
        }
      }
    }
    if (atLeastOneIsActive == false) {
      return noStoreIsActive;
    }
    if (theManager.paused() == true) {
      return managerIsPaused;
    }
    return allSet;
  }

}
