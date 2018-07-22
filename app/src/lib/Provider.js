const db = require('./db').redis
const _ = require('lodash')
const request = require('superagent')
const fs = require('./fs')
const path = require('path')
const cheerio = require('cheerio')
const utils = require('./Utils')

const tweedentity = require('tweedentity')

class Provider {

  constructor() {
    this.tServer = tweedentity.Server
  }

  saveHtml(src) {
    fs.writeFileSync(path.resolve(__dirname, '../../log/log' + Math.random() + ".html"), src)
  }

  scan(webApp, username, sig) {
    if (webApp === 'twitter') {
      return this.scanTweets(username, sig)
    } else {
      return this.scanRedditPosts(username, sig)
    }
  }

  scanTweets(username, sig) {
    sig = sig.split(' ')[0]
    let errorMessage
    return request
      .get(`https://twitter.com/${username}`)
      .then(tweet => {
        if (tweet.text) {

          const $ = cheerio.load(tweet.text)
          let data
          let someSigFound = false
          let signedBySomeoneElse = false

          $('div.tweet').each((index, elem) => {
            let tweetSig = $('p.TweetTextSize', $(elem)).text().split(' ')[0]
            if (!data && $(elem).attr('data-screen-name') &&
              $(elem).attr('data-screen-name').toLowerCase() === username.toLowerCase()) {
              if (tweetSig === sig) {
                data = $(elem)
              } else {
                let deSig = utils.deconstructSignature(tweetSig)
                if (deSig.sigver === '3') {
                  someSigFound = true
                }
              }
            } else {
              if (tweetSig === sig) {
                signedBySomeoneElse = true
              }
            }
          })
          if (data) {
            return Promise.resolve({
              result: {
                postId: data.attr('data-tweet-id')
              }
            })
          } else {
            if (signedBySomeoneElse) {
              throw(errorMessage = 'Wrong user')
            } else if (someSigFound) {
              throw(errorMessage = 'Wrong signature')
            } else {
              throw(errorMessage = 'Post not found')
            }
          }
        } else {
          if (/<h1>Account suspended<\/h1>/.test(tweet.text)) {
            throw(errorMessage = 'Account suspended')
          } else {
            throw(errorMessage = 'User not found')
          }
        }
      })
      .catch((err) => {
        console.log(err)
        return Promise.resolve({
          error: errorMessage || 'User not found'
        })
      })
  }

  saveFile(fn, str) {
    fs.writeFileSync(path.resolve(__dirname, '../../log', fn), str)
  }

  getUserId(webApp, username) {
    if (webApp === 'twitter') {
      return this.getTwitterUserId(username)
    } else {
      return this.getDataByTID('reddit', username)
    }
  }

  getTwitterUserId(username) {
    let errorMessage

    const key = `twitter:${username}`
    return db.getAsync(key)
      .then(data => {
        if (data) {
          return Promise.resolve({
            result: JSON.parse(data)
          })
        } else {
          return request
            .get(`https://twitter.com/${username}`)
            .then(tweet => {

              if (tweet.text) {
                const $ = cheerio.load(tweet.text)
                const name = $('.ProfileHeaderCard-name a').text()
                if (name) {
                  const avatar = $('img.ProfileAvatar-image ').attr('src')
                  username = $('.ProfileHeaderCard-screenname b').text()
                  const userId = $('.ProfileNav').attr('data-user-id')

                  const data = {
                    userId,
                    username,
                    name,
                    avatar
                  }
                  db.set(key, JSON.stringify(data), 'EX', 3600)
                  return Promise.resolve({
                    result: data
                  })
                } else {

                  if (/<h1>Account suspended<\/h1>/.test(tweet.text)) {
                    throw(errorMessage = 'Account suspended')
                  } else {
                    throw(errorMessage = 'User not found')
                  }
                }
              } else {
                throw(errorMessage = 'User not found')
              }
            })
            .catch((err) => {
              return Promise.resolve({
                error: errorMessage || 'User not found'
              })
            })
        }
      })
  }

  getRedditUserAbout(username) {
    const key = `reddit:${username}`
    return db.getAsync(key)
      .then(user => {
        if (user) {
          return Promise.resolve(JSON.parse(user))
        } else {
          return this.tServer.getDataByRedditUsername(username)
            .then(data => {
              db.set(key, JSON.stringify(data), 'EX', 3600)
              return Promise.resolve(data)
            })
        }
      })
  }

  scanRedditPosts(username, sig) {
    sig = sig.split(' ')[0]
    let errorMessage

    return this.getRedditUserAbout(username)
      .then(data => {
        return request
          .get(`https://reddit.com/user/${username}/comments.json`)
          .set('Accept', 'application/json')
          .then(res => {
            let userData = res.body
            if (userData.error) {
              throw(errorMessage = 'Post not found')
            } else if (userData.data && Array.isArray(userData.data.children)) {

              let data
              let someSigFound = false

              for (let elem of userData.data.children) {
                if (elem.data && elem.data.body && elem.data.author.toLowerCase() === username.toLowerCase()) {
                  let body = elem.data.body.split(' ')[0]
                  if (body === sig) {
                    return Promise.resolve({
                      result: {
                        postId: elem.data.name
                      }
                    })
                  } else {
                    let deSig = utils.deconstructSignature(body)
                    if (deSig.sigver === '3') {
                      someSigFound = true
                    }
                  }
                }
              }
              if (someSigFound) {
                throw(errorMessage = 'Wrong signature')
              }
            }
            throw(errorMessage = 'Post not found')
          })
      })
      .catch((err) => {
        console.log(err)
        return Promise.resolve({
          error: errorMessage || 'Post not found'
        })
      })
  }

  getDataByTID(webApp, userId) {
    const key = `${tweedentity.config.appIds[webApp]}/${userId}`
    return db.getAsync(key)
      .then(user => {
        if (user) {
          return Promise.resolve({
            result: JSON.parse(user)
          })
        } else {
          return this.tServer.getDataById(webApp, userId)
            .then(result => {
              db.set(key, JSON.stringify(result.userData), 'EX', 3600)
              return Promise.resolve({
                result: result.userData
              })
            })
        }
      })
  }

}

module.exports = Provider
