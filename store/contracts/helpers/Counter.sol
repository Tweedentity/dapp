pragma solidity ^0.4.18;


contract Counter {

  uint public counter;

  function incCounter()
  public
  {
    // we use this to mine a new block during tests
    counter++;
  }

}
