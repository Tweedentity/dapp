
const RedditUidChecker = artifacts.require('./RedditUidChecker.sol')

contract('RedditUidChecker', accounts => {

  let checker

  async function getValue(what) {
    return (await store[what]()).valueOf()
  }

  before(async () => {
    checker = await RedditUidChecker.new()
  })

  it('should check the integrity of the uids', async () => {
    assert.isTrue(await checker.isUid('aabcdefghi_--'))
    assert.isTrue(await checker.isUid('____----___'))
    assert.isTrue(await checker.isUid('123'))
    // even if Reddit uses lower and upper case, the store accepts only lowercase
    assert.isFalse(await checker.isUid('UPPERcase'))
    assert.isFalse(await checker.isUid('asadsad['))
    assert.isFalse(await checker.isUid('__')) // too short
    assert.isFalse(await checker.isUid('abs___-trgdtegrtdget_')) // too long
  })

})
