pragma solidity ^0.4.23;


import "../OwnershipClaimer.sol";

contract OwnershipClaimerMock
is OwnershipClaimer
{

  function callOraclizeToSetThePrice(
    string _appNickname,
    string _postId,
    uint _gasPrice,
    uint _gasLimit
  )
  public
  payable
  {

    string[6] memory str;
    str[0] = apiUrl;
    str[1] = _appNickname;
    str[2] = "/";
    str[3] = _postId;
    str[4] = "/0x";
    str[5] = __addressToString(msg.sender);
    string memory url = __concat(str);

    oraclize_setCustomGasPrice(_gasPrice);

    bytes32 oraclizeID = oraclize_query(
      "URL",
      url,
      _gasLimit
    );
    emit VerificationStarted(oraclizeID, msg.sender, _appNickname, _postId);
    __tempData[oraclizeID] = TempData(msg.sender, manager.getAppId(_appNickname));
  }

}
