const assert = require('assert')

const server = require('../Server')

describe('Server', function () {

  this.timeout(20 * 1000)

  it('should recover the twitter data for @tweedentity', async () => {

    const nameId = '946957110411005953'
    const result = await server.getDataById('twitter', nameId)
    assert(result.userId === nameId)
    assert(result.username === 'tweedentity')
    assert(result.name === 'Tweedentity')
    assert(/\.jpg$/i.test(result.avatar))
  })

  it('should recover the reddit data for u/tweedentity', async () => {

    const nameId = 'tweedentity'
    const result = await server.getDataById('reddit', nameId)
    assert(result.userId === '1nihr8b3')
    assert(result.username === 'tweedentity')
    assert(result.name === 'Tweedentity')
    assert(/\.png\?/i.test(result.avatar))
  })


  it('should fail trying recovering the twitter data for a wrong id', async () => {

    let randomUserId = Math.random().toString().replace(/0\./, '').substring(0,20)
    const result = await server.getDataByTwitterUserId(randomUserId)
    assert(result.error === 'Not found')
  })

  it('should fail trying recovering the reddit data for a wrong username', async () => {

    let randomUsername = Math.random().toString().replace(/0\./, 'user').substring(0,20)
    const result = await server.getDataByRedditUsername(randomUsername)
    assert(result.error === 'Not found')
  })


})