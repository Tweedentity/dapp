pragma solidity ^0.4.18;


import '../StoreManager.sol';


// This contract is for testing the StoreManager's methods
// which are callable from other contracts

contract StoreManagerCaller {

  StoreManager public manager;

  function setManager(address _managerAddress) public {
    manager = StoreManager(_managerAddress);
  }

  // callable methods
  // Theoretically, there is no need to test them because the
  // compiler with produce an error when calling any getter that
  // tries to return not-allowed dynamic data

  function getUpgradability(uint _id, address _addr, string _uid) public constant returns (uint) {
    return manager.getUpgradability(_id, _addr, _uid);
  }

}
