const AWS = require('aws-sdk')

const dynamoDb = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'})

class Db {

  constructor() {
    this.table = process.env.USERS_TABLE
  }

  get(userId, callback) {

    const params = {
      TableName: this.table,
      Key: {
        userId: userId
      }
    }

    dynamoDb.get(params, (error, result) => {
      if (error) {
        callback({error: 'Could not get user'})
      }
      if (result.Item) {
        callback(null, {
          screenName: result.Item.screenName,
          name: result.Item.name,
          address: result.Item.address,
          lastUpdate: result.Item.lastUpdate
        })
      } else {
        callback({error: 'User not found'})
      }
    })
  }

  put(userId, screenName, name, address, lastUpdate, callback) {

    const params = {
      TableName: this.table,
      Item: {
        userId,
        screenName,
        name,
        address,
        lastUpdate
      }
    }
    dynamoDb.put(params, (error) => {
      if (error) {
        callback(error)
      } else {
        callback(null, true)
      }
    })
  }

}

module.exports = new Db