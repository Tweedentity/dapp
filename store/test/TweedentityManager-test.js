const assertRevert = require('./helpers/assertRevert')
const log = require('./helpers/log')
const eventWatcher = require('./helpers/EventWatcher')

const TwitterUidChecker = artifacts.require('./TwitterUidChecker.sol')
const RedditUidChecker = artifacts.require('./RedditUidChecker.sol')
const TweedentityStore = artifacts.require('./TweedentityStore.sol')
const TweedentityManager = artifacts.require('./TweedentityManager.sol')

const Wait = require('./helpers/wait')
const Counter = artifacts.require('./helpers/Counter')

const TweedentityManagerCaller = artifacts.require('./helpers/TweedentityManagerCaller')

contract('TweedentityManager', accounts => {

  let twitterChecker
  let redditChecker
  let twitterStore
  let redditStore
  let manager
  let newManager
  let managerCaller

  let claimer = accounts[1]
  let customerService = accounts[2]
  let bob = accounts[3]
  let alice = accounts[4]
  let rita = accounts[5]
  let mark = accounts[7]

  let id1 = '1'
  let id2 = '2'
  let id3 = '3'
  let id4 = '4'
  let id5 = '5'

  let rid1 = 'abc'

  let twitterNickname = 'twitter'
  let twitterId = 1

  let redditNickname = 'reddit'
  let redditId = 2

  let upgradable
  let notUpgradableInStore
  let addressNotUpgradable

  let wait

  async function getValue(what) {
    return (await manager[what]()).valueOf()
  }

  before(async () => {
    twitterChecker = await TwitterUidChecker.new()
    twitterStore = await TweedentityStore.new()

    redditChecker = await RedditUidChecker.new()
    redditStore = await TweedentityStore.new()

    manager = await TweedentityManager.new()

    managerCaller = await TweedentityManagerCaller.new()

    await twitterStore.setManager(manager.address)
    await twitterStore.setApp(twitterNickname, twitterId, twitterChecker.address)

    await redditStore.setManager(manager.address)
    await redditStore.setApp(redditNickname, redditId, redditChecker.address)

    await managerCaller.setManager(manager.address)

    upgradable = await getValue('upgradable')
    notUpgradableInStore = await getValue('notUpgradableInStore')
    addressNotUpgradable = await getValue('addressNotUpgradable')

    wait = (new Wait(await Counter.new())).wait
  })

  it('should configure the manager', async () => {

    await manager.setClaimer(claimer)
    assert.equal(await manager.claimer(), claimer)
    await manager.setCustomerService(customerService, true)
    const customerServiceAddress = (await manager.getCustomerServiceAddress()).valueOf()
    assert.isTrue(customerServiceAddress[0] == customerService)

  })

  it('should see that the twitterStore has not been set', async () => {
    assert.isFalse(await manager.isStoreSet(twitterNickname))
  })

  it('should set the twitterStore', async () => {
    assert.equal(await manager.getAppId(twitterNickname), 0)
    assert.isFalse(await manager.isStoreSet(twitterNickname))
    await manager.setAStore(twitterNickname, twitterStore.address)
    assert.isTrue(await manager.isStoreSet(twitterNickname))
    assert.equal(await twitterStore.manager(), manager.address)
    assert.equal(await manager.getStoreAddress(twitterNickname), twitterStore.address)
  })

  it('should revert trying to add a new tweedentity', async () => {
    await assertRevert(manager.setIdentity(twitterId, rita, id1))
  })

  it('should add a new identity with uid id1 for rita', async () => {
    assert.equal(await twitterStore.getAddress(id1), 0)
    assert.equal(await twitterStore.getUid(rita), 0)

    await manager.setIdentity(twitterId, rita, id1, {
      from: claimer
    })
    assert.equal(await twitterStore.getAddress(id1), rita)
    assert.equal(await twitterStore.getUid(rita), id1)
  })

  it('should show that minimumTimeBeforeUpdate is 1 days', async () => {
    assert.equal(await manager.minimumTimeBeforeUpdate(), 3600)
  })

  it('should refuse trying to update rita with the uid id2', async () => {

    manager.setIdentity(twitterId, rita, id2, {
      from: claimer
    })

    const result = await eventWatcher.watch(manager, {
      event: 'IdentityNotUpgradable',
      args: {
        addr: rita
      },
      fromBlock: web3.eth.blockNumer,
      toBlock: 'latest'
    })

    assert.equal(result.args.uid, id2)
  })

  it('should revert trying to associate mark to uid id3 using a not authorized owner', async () => {

    await assertRevert(manager.setIdentity(twitterId, mark, id3))

  })

  it('should change minimumTimeBeforeUpdate to 2 seconds', async () => {
    await manager.changeMinimumTimeBeforeUpdate(2)
    assert.equal(await manager.minimumTimeBeforeUpdate(), 2)
  })

  it('should wait 2 seconds', async () => {
    await wait(2)
    assert.isTrue(true)
  })

  it('should refuse trying to associate bob with id1 since this is associated w/ rita', async () => {

    assert.equal(await twitterStore.getUid(rita), id1)

    manager.setIdentity(twitterId, bob, id1, {
      from: claimer
    })

    const result = await eventWatcher.watch(manager, {
      event: 'IdentityNotUpgradable',
      args: {
        addr: bob
      },
      fromBlock: web3.eth.blockNumer,
      toBlock: 'latest'
    })

    assert.equal(result.args.uid, id1)

  })

  it('should associate again id1 to rita', async () => {
    manager.setIdentity(twitterId, rita, id1, {
      from: claimer
    })

    const result = await eventWatcher.watch(twitterStore, {
      event: 'IdentitySet',
      args: {
        addr: rita
      },
      fromBlock: web3.eth.blockNumer,
      toBlock: 'latest'
    })

    assert.equal(result.args.uid, id1)
  })

  it('should check upgradabilities', async () => {
    await manager.setIdentity(twitterId, mark, id4, {
      from: claimer
    })

    assert.equal(await manager.getUpgradability(twitterId, rita, id4), notUpgradableInStore)
    assert.equal(await manager.getUpgradability(twitterId, rita, id3), addressNotUpgradable)
    assert.equal(await manager.getUpgradability(twitterId, alice, id2), upgradable)
    assert.equal(await manager.getUpgradability(twitterId, alice, id1), notUpgradableInStore)
    assert.equal(await manager.getUpgradability(twitterId, rita, id1), addressNotUpgradable)

    await wait(2)
    assert.equal(await manager.getUpgradability(twitterId, rita, id1), upgradable)
    assert.equal(await manager.getUpgradability(twitterId, rita, id2), upgradable)
    assert.equal(await manager.getUpgradability(twitterId, rita, id4), notUpgradableInStore)

  })

  it('should associate after a second rita with the uid id2', async () => {

    assert.equal(await twitterStore.getAddress(id2), 0)

    await manager.setIdentity(twitterId, rita, id2, {
      from: claimer
    })
    assert.equal(await twitterStore.getUid(rita), id2)

  })

  it('should be able to reverse after 2 seconds', async () => {
    await wait(2)

    await manager.setIdentity(twitterId, rita, id1, {
      from: claimer
    })
    assert.equal(await twitterStore.getUid(rita), id1)
  })

  it('should associate id2 to alice', async () => {
    await manager.setIdentity(twitterId, alice, id2, {
      from: claimer
    })
    assert.equal(await twitterStore.getUid(alice), id2)
  })

  it('should return rita if searching for id1 and viceversa', async () => {
    assert.equal(await twitterStore.getAddress(id1), rita)
    assert.equal(await twitterStore.getUid(rita), id1)
  })

  it('should allow customerService to remove the identity for rita', async () => {

    assert.notEqual(await twitterStore.getUid(rita), 0)

    await manager.unsetIdentity(twitterId, rita, {
      from: customerService
    })
    assert.equal(await twitterStore.getUid(rita), '')
    assert.equal(await twitterStore.getUid(rita), 0)
  })

  it('should allow bob to be associated to id1 after 2 seconds', async () => {

    await wait(2)

    await manager.setIdentity(twitterId, bob, id1, {
      from: claimer
    })

    assert.equal(await twitterStore.getUid(bob), id1)
    assert.equal(await twitterStore.getAddress(id1), bob)

  })

  it('should verify that all the function callable from other contracts are actually callable', async () => {

    assert.equal(await managerCaller.getUpgradability(twitterId, bob, id1), addressNotUpgradable)
    assert.equal(await managerCaller.getUpgradability(twitterId, bob, id2), notUpgradableInStore)
  })


  it('should allow bob to remove their own identity', async () => {
    await manager.unsetMyIdentity(twitterId, {
      from: bob
    })
    assert.equal(await twitterStore.getUid(bob), '')
    assert.equal(await twitterStore.getAddress(id1), 0)
  })

  it('should update the system using newManager instead of the current manager', async () => {
    newManager = await TweedentityManager.new()
    assert.isFalse(await newManager.isStoreSet(twitterNickname))

    await newManager.setAStore(twitterNickname, twitterStore.address)
    assert.equal(await newManager.getStoreAddress(twitterNickname), twitterStore.address)

    await twitterStore.setNewManager(newManager.address)
    assert.equal(await twitterStore.newManager(), newManager.address)

    assert.equal(await newManager.claimer(), 0)

    await newManager.setClaimer(claimer)
    assert.equal(await newManager.claimer(), claimer)

    await newManager.changeMinimumTimeBeforeUpdate(1)
  })

  it('should switch between old and new manager', async () => {

    await twitterStore.switchManagerAndRemoveOldOne()
    assert.equal(await twitterStore.manager(), newManager.address)
    assert.equal(await twitterStore.newManager(), 0)

  })

  it('should revert trying to set a new tweedentity using manager', async () => {
    await assertRevert(manager.setIdentity(twitterId, bob, id1))
  })

  it('should set the redditStore', async () => {
    assert.equal(await manager.getAppId(redditNickname), 0)
    assert.isFalse(await manager.isStoreSet(redditNickname))
    await manager.setAStore(redditNickname, redditStore.address)
    assert.isTrue(await manager.isStoreSet(redditNickname))
    assert.equal(await redditStore.manager(), manager.address)
    assert.equal(await manager.getStoreAddress(redditNickname), redditStore.address)
  })


  it('should allow bob to be associated to reddit/rid1 using manager', async () => {

    await manager.setIdentity(redditId, bob, rid1, {
      from: claimer
    })

    assert.equal(await redditStore.getUid(bob), rid1)
    assert.equal(await redditStore.getAddress(rid1), bob)

  })


})
