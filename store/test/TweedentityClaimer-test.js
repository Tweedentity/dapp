const assertRevert = require('./helpers/assertRevert')
const eventWatcher = require('./helpers/EventWatcher')

const TwitterUidChecker = artifacts.require('./TwitterUidChecker.sol')
const TweedentityStore = artifacts.require('./TweedentityStore.sol')
const TweedentityManager = artifacts.require('./TweedentityManager.sol')
const TweedentityClaimer = artifacts.require('./TweedentityClaimer.sol')

const Wait = require('./helpers/wait')
const Counter = artifacts.require('./helpers/Counter')

const fixtures = require('./fixtures')
const tweet = fixtures.tweets[0]

const log = require('./helpers/log')

function logValue(...x) {
  for (let i = 0; i < x.length; i++) {
    console.log(x[i].valueOf())
  }
}


contract('TweedentityClaimer', accounts => {

  let twitterChecker
  let manager
  let store
  let claimer

  let wait

  let appNickname = 'twitter'
  let appId = 1

  before(async () => {
    twitterChecker = await TwitterUidChecker.new()
    store = await TweedentityStore.new()
    manager = await TweedentityManager.new()
    claimer = await TweedentityClaimer.new()

    await store.setManager(manager.address)
    await store.setApp(appNickname, appId, twitterChecker.address)
    await manager.setAStore(appNickname, store.address)

    wait = (new Wait(await Counter.new())).wait
  })

  it('should authorize the manager to handle the store', async () => {
    assert.equal(await claimer.owner(), accounts[0])
    await manager.setClaimer(claimer.address)
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
    await claimer.setManager(manager.address)
    assert.equal(await claimer.managerAddress(), manager.address)
  })

  it('should revert if the tweet id is empty', async () => {

    const gasPrice = 4e9
    const gasLimit = 20e4

    await assertRevert(claimer.claimAccountOwnership(
      appNickname,
      '',
      21e9,
      16e4,
      {
        from: accounts[1],
        value: gasPrice * gasLimit,
        gas: 300e3
      }))
  })

  it('should call Oraclize, recover the signature from the tweet and verify that it is correct', async () => {


    const gasPrice = 4e9
    const gasLimit = 18e4

    await claimer.claimAccountOwnership(
      appNickname,
      tweet.id,
      gasPrice,
      gasLimit,
      {
        from: accounts[1],
        value: gasPrice * gasLimit,
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

    const gasPrice = 4e9
    const gasLimit = 17e4

    await claimer.claimAccountOwnership(
      appNickname,
      tweet.id,
      gasPrice,
      gasLimit,
      {
        from: accounts[1],
        value: gasPrice * gasLimit * 100,
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

  it('should recover ether sent to the contract by mistake', async () => {

    const balanceBefore = (await web3.eth.getBalance(accounts[0])).valueOf()
    await claimer.reclaimEther()
    const balanceAfter = (await web3.eth.getBalance(accounts[0])).valueOf()
    assert.isTrue(balanceAfter > balanceBefore)

  })


})
