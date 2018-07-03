const assertRevert = require('./helpers/assertRevert')
const eventWatcher = require('./helpers/EventWatcher')

const UidCheckerForTwitter = artifacts.require('./UidCheckerForTwitter.sol')
const Datastore = artifacts.require('./Datastore.sol')
const StoreManager = artifacts.require('./StoreManager.sol')
const OwnershipClaimer = artifacts.require('./mocks/OwnershipClaimerMock.sol')

const Wait = require('./helpers/wait')
const Counter = artifacts.require('./helpers/Counter')

const fixtures = require('./fixtures')
const tweet = fixtures.tweets[0]

const log = require('./helpers/log')


contract('OwnershipClaimer', accounts => {

  let twitterChecker
  let manager
  let store
  let claimer

  let ethPrice = 480

  let wait

  let appNickname = 'twitter'
  let appId = 1

  before(async () => {
    twitterChecker = await UidCheckerForTwitter.new()
    store = await Datastore.new()
    manager = await StoreManager.new()
    claimer = await OwnershipClaimer.new()

    await store.setManager(manager.address)
    await store.setApp(appNickname, appId, twitterChecker.address)
    await manager.setAStore(appNickname, store.address)

    wait = (new Wait(await Counter.new())).wait
  })

  it('should authorize the manager to handle the store', async () => {
    assert.equal(await claimer.owner(), accounts[0])
    const fromBlock = web3.eth.blockNumber
    await manager.setClaimer(claimer.address)
    await eventWatcher.watch(manager, {
      event: 'ClaimerSet',
      args: {
        claimer: claimer.address
      },
      fromBlock,
      toBlock: 'latest'
    })
    assert.equal(await manager.claimer(), claimer.address)
  })

  it('should revert trying to verify an account before setting the store', async () => {

    const gasPrice = 1e9
    const gasLimit = 30e4

    await assertRevert(
      claimer.claimAccountOwnership(
        appNickname,
        tweet.id,
        gasPrice,
        16e4,
        {
          from: accounts[1],
          value: gasPrice * gasLimit,
          gas: 40e4
        }))

  })

  it('should set the manager in the claimer', async () => {
    const fromBlock = web3.eth.blockNumber
    await claimer.setManager(manager.address)
    await eventWatcher.watch(claimer, {
      event: 'ManagerSet',
      args: {
        manager: manager.address
      },
      fromBlock,
      toBlock: 'latest'
    })
    assert.equal(await claimer.managerAddress(), manager.address)
  })


  it('should call Oraclize, recover the signature from the tweet and verify that it is correct', async () => {

    const oraclizeCost = Math.round(1e18 * 0.01 /ethPrice)
    const gasPrice = 4e9
    const gasLimit = 18e4

    await claimer.claimAccountOwnership(
      appNickname,
      tweet.id,
      gasPrice,
      gasLimit,
      {
        from: accounts[1],
        value: (gasPrice * gasLimit) + oraclizeCost,
        gas: 270e3
      })

    let timerId = setInterval(() => {
      console.log('Waiting for result')
    }, 1000)

    const result = await eventWatcher.watch(store, {
      event: 'IdentitySet',
      args: {},
      fromBlock: web3.eth.blockNumer,
      toBlock: 'latest'
    })

    clearTimeout(timerId)
    assert.isTrue(typeof result !== 'undefined')

  })

  it('should allow accounts[1] to unset its identity', async () => {

    await manager.unsetMyIdentity(1, {from: accounts[1]})
    assert.equal(await store.getUid(accounts[1]), '')

  })

  it('should call Oraclize, recover the signature from the tweet but be unable to update because the identity is not upgradable', async () => {

    const oraclizeCost = Math.round(1e18 * 0.01 /ethPrice)
    const gasPrice = 60e9
    const gasLimit = 17e4

    await claimer.claimAccountOwnership(
      appNickname,
      tweet.id,
      gasPrice,
      gasLimit,
      {
        from: accounts[1],
        value: (gasPrice * gasLimit) + oraclizeCost,
        gas: 270e3
      })

    let timerId = setInterval(() => {
      console.log('Waiting for result')
    }, 1000)

    const result = await eventWatcher.watch(manager, {
      event: 'IdentityNotUpgradable',
      args: {},
      fromBlock: web3.eth.blockNumer,
      toBlock: 'latest'
    })
    clearTimeout(timerId)
    assert.isTrue(typeof result !== 'undefined')

  })


})
