pragma solidity ^0.4.23;


import "../../ethereum-api/oraclizeAPI_0.5.sol";


contract Oraclized is usingOraclize {

  /**
   * @dev returns wei charged by next single oraclize query,
   *      assumes a constant prooftype, if not constant, amend as param
   * @param _gasPrice The gas price for the Oraclize query
   * @param _gasLimit The gas limit for the Oraclize query
   */
  function calcQueryCost(
    uint _gasPrice,
    uint _gasLimit
  )
  public
  view
  returns (uint)
  {

    oraclize_setCustomGasPrice(_gasPrice);
    uint fullPrice = oraclize_getPrice("URL", _gasLimit);
    if (fullPrice == 0 && _gasLimit < 200001) {
      uint price = oraclize_getPrice("URL", 200001) - _gasPrice * 200001;
      fullPrice = price + _gasPrice * _gasLimit;
    }
    return fullPrice;
  }


  /**
   * @dev returns the cost of the Oraclize fee
   */
  function getOraclizeFee()
  public
  view
  returns (uint)
  {
    oraclize_setCustomGasPrice(21e4);
    return oraclize_getPrice("URL", 200001) - 21e4 * 200001;
  }
}

