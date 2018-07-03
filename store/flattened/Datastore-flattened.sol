pragma solidity ^0.4.23;

// File: contracts/UidCheckerInterface.sol

contract UidCheckerInterface {

  function isUid(
    string _uid
  )
  public
  pure returns (bool);

}

// File: openzeppelin-solidity/contracts/ownership/Ownable.sol

/**
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
contract Ownable {
  address public owner;


  event OwnershipRenounced(address indexed previousOwner);
  event OwnershipTransferred(
    address indexed previousOwner,
    address indexed newOwner
  );


  /**
   * @dev The Ownable constructor sets the original `owner` of the contract to the sender
   * account.
   */
  constructor() public {
    owner = msg.sender;
  }

  /**
   * @dev Throws if called by any account other than the owner.
   */
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  /**
   * @dev Allows the current owner to relinquish control of the contract.
   */
  function renounceOwnership() public onlyOwner {
    emit OwnershipRenounced(owner);
    owner = address(0);
  }

  /**
   * @dev Allows the current owner to transfer control of the contract to a newOwner.
   * @param _newOwner The address to transfer ownership to.
   */
  function transferOwnership(address _newOwner) public onlyOwner {
    _transferOwnership(_newOwner);
  }

  /**
   * @dev Transfers control of the contract to a newOwner.
   * @param _newOwner The address to transfer ownership to.
   */
  function _transferOwnership(address _newOwner) internal {
    require(_newOwner != address(0));
    emit OwnershipTransferred(owner, _newOwner);
    owner = _newOwner;
  }
}

// File: openzeppelin-solidity/contracts/ownership/HasNoEther.sol

/**
 * @title Contracts that should not own Ether
 * @author Remco Bloemen <remco@2π.com>
 * @dev This tries to block incoming ether to prevent accidental loss of Ether. Should Ether end up
 * in the contract, it will allow the owner to reclaim this ether.
 * @notice Ether can still be sent to this contract by:
 * calling functions labeled `payable`
 * `selfdestruct(contract_address)`
 * mining directly to the contract address
 */
contract HasNoEther is Ownable {

  /**
  * @dev Constructor that rejects incoming Ether
  * @dev The `payable` flag is added so we can access `msg.value` without compiler warning. If we
  * leave out payable, then Solidity will allow inheriting contracts to implement a payable
  * constructor. By doing it this way we prevent a payable constructor from working. Alternatively
  * we could use assembly to access msg.value.
  */
  constructor() public payable {
    require(msg.value == 0);
  }

  /**
   * @dev Disallows direct send by settings a default function without the `payable` flag.
   */
  function() external {
  }

  /**
   * @dev Transfer all Ether held by the contract to the owner.
   */
  function reclaimEther() external onlyOwner {
    owner.transfer(address(this).balance);
  }
}

// File: contracts/Datastore.sol

/**
 * @title Store
 * @author Francesco Sullo <francesco@sullo.co>
 * @dev It store the tweedentities related to the app
 */



contract Datastore
is HasNoEther
{

  string public fromVersion = "1.1.0";

  uint public appId;
  string public appNickname;

  uint public identities;

  address public manager;
  address public newManager;

  UidCheckerInterface public checker;

  struct Uid {
    string lastUid;
    uint lastUpdate;
  }

  struct Address {
    address lastAddress;
    uint lastUpdate;
  }

  mapping(string => Address) internal __addressByUid;
  mapping(address => Uid) internal __uidByAddress;

  bool public appSet;



  // events


  event AppSet(
    string appNickname,
    uint appId,
    address checker
  );


  event ManagerSet(
    address indexed manager,
    bool isNew
  );

  event ManagerSwitch(
    address indexed oldManager,
    address indexed newManager
  );


  event IdentitySet(
    address indexed addr,
    string uid
  );


  event IdentityUnset(
    address indexed addr,
    string uid
  );



  // modifiers


  modifier onlyManager() {
    require(msg.sender == manager || (newManager != address(0) && msg.sender == newManager));
    _;
  }


  modifier whenAppSet() {
    require(appSet);
    _;
  }



  // config


  /**
  * @dev Updates the checker for the store
  * @param _address Checker's address
  */
  function setNewChecker(
    address _address
  )
  external
  onlyOwner
  {
    require(_address != address(0));
    checker = UidCheckerInterface(_address);
  }


  /**
  * @dev Sets the manager
  * @param _address Manager's address
  */
  function setManager(
    address _address
  )
  external
  onlyOwner
  {
    require(_address != address(0));
    manager = _address;
    emit ManagerSet(_address, false);
  }


  /**
  * @dev Sets new manager
  * @param _address New manager's address
  */
  function setNewManager(
    address _address
  )
  external
  onlyOwner
  {
    require(_address != address(0) && manager != address(0));
    newManager = _address;
    emit ManagerSet(_address, true);
  }


  /**
  * @dev Sets new manager
  */
  function switchManagerAndRemoveOldOne()
  external
  onlyOwner
  {
    require(newManager != address(0));
    emit ManagerSwitch(manager, newManager);
    manager = newManager;
    newManager = address(0);
  }


  /**
  * @dev Sets the app
  * @param _appNickname Nickname (e.g. twitter)
  * @param _appId ID (e.g. 1)
  */
  function setApp(
    string _appNickname,
    uint _appId,
    address _checker
  )
  external
  onlyOwner
  {
    require(!appSet);
    require(_appId > 0);
    require(_checker != address(0));
    require(bytes(_appNickname).length > 0);
    appId = _appId;
    appNickname = _appNickname;
    checker = UidCheckerInterface(_checker);
    appSet = true;
    emit AppSet(_appNickname, _appId, _checker);
  }



  // helpers


  /**
   * @dev Checks if a tweedentity is upgradable
   * @param _address The address
   * @param _uid The user-id
   */
  function isUpgradable(
    address _address,
    string _uid
  )
  public
  constant returns (bool)
  {
    if (__addressByUid[_uid].lastAddress != address(0)) {
      return keccak256(abi.encodePacked(getUid(_address))) == keccak256(abi.encodePacked(_uid));
    }
    return true;
  }



  // primary methods


  /**
   * @dev Sets a tweedentity
   * @param _address The address of the wallet
   * @param _uid The user-id of the owner user account
   */
  function setIdentity(
    address _address,
    string _uid
  )
  external
  onlyManager
  whenAppSet
  {
    require(_address != address(0));
    require(isUid(_uid));
    require(isUpgradable(_address, _uid));

    if (bytes(__uidByAddress[_address].lastUid).length > 0) {
      // if _address is associated with an oldUid,
      // this removes the association between _address and oldUid
      __addressByUid[__uidByAddress[_address].lastUid] = Address(address(0), __addressByUid[__uidByAddress[_address].lastUid].lastUpdate);
      identities--;
    }

    __uidByAddress[_address] = Uid(_uid, now);
    __addressByUid[_uid] = Address(_address, now);
    identities++;
    emit IdentitySet(_address, _uid);
  }


  /**
   * @dev Unset a tweedentity
   * @param _address The address of the wallet
   */
  function unsetIdentity(
    address _address
  )
  external
  onlyManager
  whenAppSet
  {
    require(_address != address(0));
    require(bytes(__uidByAddress[_address].lastUid).length > 0);

    string memory uid = __uidByAddress[_address].lastUid;
    __uidByAddress[_address] = Uid('', __uidByAddress[_address].lastUpdate);
    __addressByUid[uid] = Address(address(0), __addressByUid[uid].lastUpdate);
    identities--;
    emit IdentityUnset(_address, uid);
  }



  // getters


  /**
   * @dev Returns the keccak256 of the app nickname
   */
  function getAppNickname()
  external
  whenAppSet
  constant returns (bytes32) {
    return keccak256(abi.encodePacked(appNickname));
  }


  /**
   * @dev Returns the appId
   */
  function getAppId()
  external
  whenAppSet
  constant returns (uint) {
    return appId;
  }


  /**
   * @dev Returns the user-id associated to a wallet
   * @param _address The address of the wallet
   */
  function getUid(
    address _address
  )
  public
  constant returns (string)
  {
    return __uidByAddress[_address].lastUid;
  }


  /**
   * @dev Returns the address associated to a user-id
   * @param _uid The user-id
   */
  function getAddress(
    string _uid
  )
  external
  constant returns (address)
  {
    return __addressByUid[_uid].lastAddress;
  }


  /**
   * @dev Returns the timestamp of last update by address
   * @param _address The address of the wallet
   */
  function getAddressLastUpdate(
    address _address
  )
  external
  constant returns (uint)
  {
    return __uidByAddress[_address].lastUpdate;
  }


  /**
 * @dev Returns the timestamp of last update by user-id
 * @param _uid The user-id
 */
  function getUidLastUpdate(
    string _uid
  )
  external
  constant returns (uint)
  {
    return __addressByUid[_uid].lastUpdate;
  }



  // utils


  function isUid(
    string _uid
  )
  public
  view
  returns (bool)
  {
    return checker.isUid(_uid);
  }

}
