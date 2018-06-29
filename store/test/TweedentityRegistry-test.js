const log = require('./helpers/log')
const eventWatcher = require('./helpers/EventWatcher')

const UidCheckerForTwitter = artifacts.require('./UidCheckerForTwitter.sol')
const UidCheckerForReddit = artifacts.require('./UidCheckerForReddit.sol')
const Datastore = artifacts.require('./Datastore.sol')
const StoreManager = artifacts.require('./StoreManager.sol')
const OwnershipClaimer = artifacts.require('./OwnershipClaimer.sol')
const TweedentityRegistry = artifacts.require('./TweedentityRegistry.sol')


contract('TweedentityRegistry', accounts => {

  let manager
  let twitterChecker
  let redditChecker
  let twitterStore
  let redditStore
  let claimer
  let registry

  let allSet
  let claimerUnset
  let managerUnset
  let wrongClaimerOrUnsetInManager
  let wrongManagerOrUnsetInClaimer
  let noStoresSet
  let noStoreIsActive
  let managerIsPaused
  let managerNotSetInApp

  beforeEach(async () => {
    twitterChecker = await UidCheckerForTwitter.new()
    redditChecker = await UidCheckerForReddit.new()
    twitterStore = await Datastore.new()
    redditStore = await Datastore.new()
    manager = await StoreManager.new()
    claimer = await OwnershipClaimer.new()
    registry = await TweedentityRegistry.new()
    if (!claimerUnset) {
      async function val(v) {
        return parseInt((await (registry[v]())).valueOf(), 10)
      }
      allSet = await val('allSet')
      claimerUnset = await val('claimerUnset')
      managerUnset = await val('managerUnset')
      wrongClaimerOrUnsetInManager = await val('wrongClaimerOrUnsetInManager')
      wrongManagerOrUnsetInClaimer = await val('wrongManagerOrUnsetInClaimer')
      noStoresSet = await val('noStoresSet')
      noStoreIsActive = await val('noStoreIsActive')
      managerIsPaused = await val('managerIsPaused')
      managerNotSetInApp = await val('managerNotSetInApp')
    }
  })

  it('should return managerUnset', async () => {
    assert.equal(await registry.isReady(), managerUnset)
  })


  it('should return claimerUnset', async () => {
    await registry.setManager(manager.address)
    assert.equal(await registry.manager(), manager.address)
    assert.equal(await registry.isReady(), claimerUnset)
  })

  it('should return wrongClaimerOrUnsetInManager', async () => {
    await registry.setManager(manager.address)
    await registry.setClaimer(claimer.address)
    assert.equal(await registry.claimer(), claimer.address)
    assert.equal(await registry.isReady(), wrongClaimerOrUnsetInManager)
  })

  it('should return wrongManagerOrUnsetInClaimer', async () => {
    await registry.setManager(manager.address)
    await registry.setClaimer(claimer.address)
    await manager.setClaimer(claimer.address)
    assert.equal(await registry.isReady(), wrongManagerOrUnsetInClaimer)
  })

  it('should return noStoresSet', async () => {
    await registry.setManagerAndClaimer(manager.address, claimer.address)
    await manager.setClaimer(claimer.address)
    await claimer.setManager(manager.address)
    assert.equal(await registry.isReady(), noStoresSet)
  })


  it('should return managerNotSetInApp + 1', async () => {
    await registry.setManagerAndClaimer(manager.address, claimer.address)
    await manager.setClaimer(claimer.address)
    await claimer.setManager(manager.address)
    await twitterStore.setApp('twitter', 1, twitterChecker.address)
    await manager.setAStore('twitter', twitterStore.address)
    assert.equal(await registry.isReady(), managerNotSetInApp + 1)
  })

  it('should return allSet', async () => {
    await registry.setManager(manager.address)
    await registry.setClaimer(claimer.address)
    await manager.setClaimer(claimer.address)
    await claimer.setManager(manager.address)
    await twitterStore.setApp('twitter', 1, twitterChecker.address)
    await manager.setAStore('twitter', twitterStore.address)
    await twitterStore.setManager(manager.address)
    assert.equal(await registry.isReady(), allSet)
  })


  it('should return noStoreIsActive after disabling the store', async () => {
    await registry.setManager(manager.address)
    await registry.setClaimer(claimer.address)
    await manager.setClaimer(claimer.address)
    await claimer.setManager(manager.address)
    await twitterStore.setApp('twitter', 1, twitterChecker.address)
    await manager.setAStore('twitter', twitterStore.address)
    await twitterStore.setManager(manager.address)
    await manager.activateStore('twitter', false)
    assert.equal(await registry.isReady(), noStoreIsActive)
  })


  it('should return managerIsPaused after pausing the manager', async () => {
    await registry.setManager(manager.address)
    await registry.setClaimer(claimer.address)
    await manager.setClaimer(claimer.address)
    await claimer.setManager(manager.address)
    await twitterStore.setApp('twitter', 1, twitterChecker.address)
    await manager.setAStore('twitter', twitterStore.address)
    await twitterStore.setManager(manager.address)
    await manager.pause()
    assert.equal(await registry.isReady(), managerIsPaused)
  })


  it('should return allSet with 2 stores if 1 is inactive', async () => {
    await registry.setManager(manager.address)
    await registry.setClaimer(claimer.address)
    await manager.setClaimer(claimer.address)
    await claimer.setManager(manager.address)
    await twitterStore.setApp('twitter', 1, twitterChecker.address)
    await manager.setAStore('twitter', twitterStore.address)
    await twitterStore.setManager(manager.address)
    await redditStore.setManager(manager.address)
    await redditStore.setApp('reddit', 2, redditChecker.address)
    await manager.setAStore('reddit', redditStore.address)
    await manager.activateStore('twitter', false)
    assert.equal(await registry.isReady(), allSet)
  })

  it('should verify that the events are emitted correctly', async () => {
    registry.setManager(manager.address)
    await eventWatcher.watch(registry, {
      event: 'ContractRegistered',
      args: {
        addr: manager.address
      },
      fromBlock: web3.eth.blockNumber,
      toBlock: 'latest'
    })

    registry.setClaimer(claimer.address)
    await eventWatcher.watch(registry, {
      event: 'ContractRegistered',
      args: {
        addr: claimer.address
      },
      fromBlock: web3.eth.blockNumber,
      toBlock: 'latest'
    })
  })

})
