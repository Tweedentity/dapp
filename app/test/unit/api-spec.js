const assert = require('assert')
const express = require('express')

const db = require('../../src/lib/db')
const api = require('../../src/routes/api')

describe('api', function () {

  const app = express()
  app.use(api)
  // const testDir = path.resolve(process.cwd(), 'tmp/test')
  // fs.ensureDirSync(testDir)

  // after(function(done) {
  //     fs.removeAsync(testDir)
  //         .then(done)
  // })


  // describe('GET /', function() {
  //
  //   it('should subscribe the first time', function (done) {
  //
  //     request(app)
  //         .get('/')
  //         .expect(200)
  //         .expect(function (res) {
  //           assert.isDefined(res.body)
  //           assert(res.body.success === true)
  //           assert(res.body.message === 'Welcome!')
  //         })
  //         .end(done)
  //   })
  // })

  // describe('POST /subscribe', function () {
  //
  //   it('should subscribe the first time', function () {
  //
  //     return mailchimp.subscribe(db.getRandomString(8) + '@sameteam.co', 'subscribed')
  //         .then(response => {
  //           assert(response.success)
  //         })
  //   })
  // })
})
