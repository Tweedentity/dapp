const TwitterUidChecker = artifacts.require('./TwitterUidChecker.sol')
const RedditUidChecker = artifacts.require('./RedditUidChecker.sol')
const TweedentityStore = artifacts.require('./TweedentityStore.sol')
const TweedentityManager = artifacts.require('./TweedentityManager.sol')
const TweedentityClaimer = artifacts.require('./TweedentityClaimer.sol')
const TweedentityRegistry = artifacts.require('./TweedentityRegistry.sol')


contract('TweedentityRegistry', accounts => {

  let manager
  let twitterChecker
  let redditChecker
  let twitterStore
  let redditStore
  let claimer
  let registry

  before(async () => {
    twitterChecker = await TwitterUidChecker.new()
    redditChecker = await RedditUidChecker.new()

    twitterStore = await TweedentityStore.new()
    redditStore = await TweedentityStore.new()
    manager = await TweedentityManager.new()
    claimer = await TweedentityClaimer.new()

    await twitterStore.setManager(manager.address)
    await twitterStore.setApp('twitter', 1, twitterChecker.address)
    await manager.setAStore('twitter', twitterStore.address)

    await redditStore.setManager(manager.address)
    await redditStore.setApp('reddit', 2, redditChecker.address)
    await manager.setAStore('reddit', redditStore.address)

    await manager.setClaimer(claimer.address)
  })


  beforeEach(async () => {
    registry = await TweedentityRegistry.new()
  })

  it('should set the store for Twitter', async () => {
    await registry.setAStore('twitter', twitterStore.address)
    assert.equal(await registry.getStore('twitter'), twitterStore.address)
  })

  it('should set the store for Github', async () => {
    await registry.setAStore('reddit', redditStore.address)
    assert.equal(await registry.getStore('reddit'), redditStore.address)
  })

  it('should set the manager', async () => {
    await registry.setManager(manager.address)
    assert.equal(await registry.manager(), manager.address)
  })

  it('should set the claimer', async () => {
    await registry.setClaimer(claimer.address)
    assert.equal(await registry.claimer(), claimer.address)
  })

  it('should set manager and claimer', async () => {
    await registry.setManagerAndClaimer(manager.address, claimer.address)
    assert.equal(await registry.manager(), manager.address)
    assert.equal(await registry.claimer(), claimer.address)
  })

  it('should set all and be ready', async() => {
    await registry.setAStore('twitter', twitterStore.address)
    await registry.setAStore('reddit', redditStore.address)
    await registry.setManagerAndClaimer(manager.address, claimer.address)
    assert.isTrue(await registry.isReady())
  })

  it('should set all and be ready', async() => {
    await registry.setAStore('twitter', twitterStore.address)
    await registry.setAStore('reddit', redditStore.address)
    await registry.setManagerAndClaimer(manager.address, claimer.address)
    assert.isTrue(await registry.isReady())
  })

  it('should set all but be not ready because manager is paused', async() => {
    await registry.setAStore('twitter', twitterStore.address)
    await registry.setAStore('reddit', redditStore.address)
    await registry.setManagerAndClaimer(manager.address, claimer.address)
    await manager.pause()
    assert.isFalse(await registry.isReady())
  })


})
