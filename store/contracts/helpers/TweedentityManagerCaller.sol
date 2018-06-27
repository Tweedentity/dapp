pragma solidity ^0.4.18;


import '../TweedentityStore.sol';
import '../TweedentityManager.sol';


// This contract is for testing the TweedentityManager's methods
// which are callable from other contracts

contract TweedentityManagerCaller {

  TweedentityManager public manager;

  function setManager(address _managerAddress) public {
    manager = TweedentityManager(_managerAddress);
  }

  // callable methods
  // Theoretically, there is no need to test them because the
  // compiler with produce an error when calling any getter that
  // tries to return not-allowed dynamic data

  function getUpgradability(uint _id, address _addr, string _uid) public constant returns (uint) {
    return manager.getUpgradability(_id, _addr, _uid);
  }

}
