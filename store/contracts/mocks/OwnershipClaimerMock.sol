pragma solidity ^0.4.23;


import '../OwnershipClaimer.sol';

contract OwnershipClaimerMock
is OwnershipClaimer
{

  function claimAccountOwnership(
    string _appNickname,
    string _postId,
    uint _gasPrice,
    uint _gasLimit
  )
  public
  payable
  {

    if (bytes(_postId).length < 1) {
      emit PostIdEmpty();
    } else if (manager.getAppId(_appNickname) == 0) {
      emit AppNotSet();
    }

    oraclize_setCustomGasPrice(_gasPrice);

    if (msg.value < _gasPrice * _gasLimit) {
      emit NotEnoughValueForCallback();
    } else {

      string[6] memory str;
      str[0] = apiUrl;
      str[1] = _appNickname;
      str[2] = "/";
      str[3] = _postId;
      str[4] = "/0x";
      str[5] = __addressToString(msg.sender);
      string memory url = __concat(str);

      emit ApiUrlBuilt();

      bytes32 oraclizeID = oraclize_query(
        "URL",
        url,
        _gasLimit
      );
      emit VerificationStarted(oraclizeID, msg.sender, _appNickname, _postId);
      __tempData[oraclizeID] = TempData(msg.sender, manager.getAppId(_appNickname));
    }
  }
}
