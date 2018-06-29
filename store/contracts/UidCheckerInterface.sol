pragma solidity ^0.4.18;

interface UidCheckerInterface {

  function isUid(
    string _uid
  )
  public
  pure returns (bool);

}


