
const UidCheckerForTwitter = artifacts.require('./UidCheckerForTwitter.sol')

contract('UidCheckerForTwitter', accounts => {

  let checker

  async function getValue(what) {
    return (await store[what]()).valueOf()
  }

  before(async () => {
    checker = await UidCheckerForTwitter.new()
  })

  it('should check the integrity of the uids', async () => {
    assert.isTrue(await checker.isUid('6924928'))
    assert.isTrue(await checker.isUid('9812635291969249283'))
    assert.isFalse(await checker.isUid('239812635291969249282')) // too long
    assert.isFalse(await checker.isUid(''))
    assert.isFalse(await checker.isUid('8963746asa'))
  })

})
