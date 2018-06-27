const log = require('./helpers/log')
const assertRevert = require('./helpers/assertRevert')

const eventWatcher = require('./helpers/EventWatcher')

const TwitterUidChecker = artifacts.require('./TwitterUidChecker.sol')
const RedditUidChecker = artifacts.require('./RedditUidChecker.sol')
const TweedentityStore = artifacts.require('./TweedentityStore.sol')
const TweedentityStoreCaller = artifacts.require('./helpers/TweedentityStoreCaller')

const Wait = require('./helpers/wait')
const Counter = artifacts.require('./helpers/Counter')

function now() {
  console.log(parseInt('' + Date.now() / 1000, 10), 'now')
}

contract('TweedentityStore', accounts => {

  let twitterStore
  let storeCaller
  let twitterChecker
  let redditStore
  let redditChecker

  let manager = accounts[1]
  let bob = accounts[3]
  let alice = accounts[4]
  let rita = accounts[5]

  let id1 = '12345'
  let id2 = '23456'
  let id3 = '34567'

  let wait

  async function getValue(what) {
    return (await twitterStore[what]()).valueOf()
  }

  before(async () => {
    twitterChecker = await TwitterUidChecker.new()
    redditChecker = await RedditUidChecker.new()
    twitterStore = await TweedentityStore.new()
    redditStore = await TweedentityStore.new()
    storeCaller = await TweedentityStoreCaller.new()
    await storeCaller.setStore(twitterStore.address)
    wait = (new Wait(await Counter.new())).wait
  })

  it('should be empty', async () => {
    assert.equal(await twitterStore.identities(), 0)
  })

  it('should revert trying to add a new tweedentity', async () => {
    await assertRevert(twitterStore.setIdentity(rita, id1))
  })

  it('should authorize manager to handle the data', async () => {
    await twitterStore.setManager(manager)
    assert.equal((await twitterStore.manager()), manager)
  })

  it('should revert trying to add a new tweedentity because the store is not declared', async () => {
    await assertRevert(twitterStore.setIdentity(rita, id1))
  })

  it('should declare the store', async () => {
    await twitterStore.setApp('twitter', 1, twitterChecker.address)
    assert.equal(await twitterStore.getAppNickname(), web3.sha3('twitter'))
    assert.equal(await twitterStore.getAppId(), 1)
  })

  it('should add a new identity with uid id1 for rita', async () => {
    assert.equal(await twitterStore.getAddress(id1), 0)

    await twitterStore.setIdentity(rita, id1, {from: manager})
    assert.equal(await twitterStore.getAddress(id1), rita)
    assert.equal(await twitterStore.getUid(rita), id1)
    assert.equal(await twitterStore.identities(), 1)
  })

  it('should revert trying to associate accounts[5] to uid id3 using a not authorized owner', async () => {
    await assertRevert(twitterStore.setIdentity(accounts[5], id3))
  })

  it('should revert trying to associate bob with id1 since this is associated w/ rita', async () => {
    await assertRevert(twitterStore.setIdentity(bob, id1, {from: manager}))
  })

  it('should not revert trying to associate again id1 to rita', async () => {
    const lastUpdate = await twitterStore.getAddressLastUpdate(rita)
    wait()
    await twitterStore.setIdentity(rita, id1, {from: manager})
    assert.isTrue(await twitterStore.getAddressLastUpdate(rita) != lastUpdate)
  })

  it('should associate now rita with the uid id2 and reverse after 1 second', async () => {
    await twitterStore.setIdentity(rita, id2, {from: manager})
    assert.equal(await twitterStore.identities(), 1)
    assert.equal(await twitterStore.getUid(rita), id2)

    await twitterStore.setIdentity(rita, id1, {from: manager})
    assert.equal(await twitterStore.identities(), 1)
    assert.equal(await twitterStore.getUid(rita), id1)
  })

  it('should associate id2 to alice', async () => {
    await twitterStore.setIdentity(alice, id2, {from: manager})
    assert.equal(await twitterStore.identities(), 2)
  })

  it('should return rita if searching for id1 and viceversa', async () => {
    assert.equal(await twitterStore.getAddress(id1), rita)
    assert.equal(await twitterStore.getUid(rita), id1)
  })

  it('should allow manager to remove the identity for rita', async () => {

    assert.notEqual(await twitterStore.getUid(rita), 0)
    await twitterStore.unsetIdentity(rita, {from: manager})
    assert.equal(await twitterStore.getUid(rita), '')

  })

  it('should allow bob to be associated to id1', async () => {

    await twitterStore.setIdentity(bob, id1, {from: manager})

    assert.equal(await twitterStore.getUid(rita), 0)
    assert.equal(await twitterStore.getUid(bob), id1)
    assert.equal(await twitterStore.getAddress(id1), bob)

  })

  it('should verify that all the function callable from other contracts are actually callable', async () => {

    assert.equal(await storeCaller.getAddress(id1), bob)
    assert.equal(await storeCaller.getAddressLastUpdate(bob), (await twitterStore.getAddressLastUpdate(bob)).valueOf())
    assert.equal(await storeCaller.getUidLastUpdate(id1), (await twitterStore.getUidLastUpdate(id1)).valueOf())
  })

  it('should authorize manager to handle the reddit store', async () => {
    await redditStore.setManager(manager)
    assert.equal((await redditStore.manager()), manager)
  })

  it('should declare the reddit store', async () => {
    await redditStore.setApp('reddit', 2, redditChecker.address)
    assert.equal(await redditStore.getAppNickname(), web3.sha3('reddit'))
    assert.equal(await redditStore.getAppId(), 2)
  })

  it('should add a new identity with uid id1 for rita', async () => {
    assert.equal(await redditStore.getAddress(id1), 0)

    await redditStore.setIdentity(rita, id1, {from: manager})
    assert.equal(await redditStore.getAddress(id1), rita)
    assert.equal(await redditStore.getUid(rita), id1)
    assert.equal(await redditStore.identities(), 1)
  })

})
