const bluebird = require('bluebird')
const redis = require('redis')
const crypto = require('crypto')
const Logger = require('./Logger')

bluebird.promisifyAll(redis.RedisClient.prototype)
bluebird.promisifyAll(redis.Multi.prototype)

class Db {

  constructor() {
    try {
      this.redis = redis.createClient(6379, process.env.REDIS_PORT_6379_TCP_ADDR)
    } catch(e) {
      Logger.warn('Redis connection failed.')
    }
  }

  // now() {
  //   return Math.floor(new Date() / 1000)
  // }
  //
  // getRandomString(length) {
  //   return crypto.randomBytes(2 * length).toString('base64').replace(/\/|\+/g, '0').toUpperCase().substring(0, length)
  // }

}

module.exports = new Db

