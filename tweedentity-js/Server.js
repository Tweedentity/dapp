const request = require('superagent')
const cheerio = require('cheerio')

class Server {

  getDataById(webApp, nameId) {
    if (webApp === 'twitter') {
      return this.getDataByTwitterUserId(nameId)
    } else if (webApp === 'reddit') {
      return this.getDataByRedditUsername(nameId)
    } else {
      throw(new Error('App not supported'))
    }
  }

  getDataByTwitterUserId(userId) {
    return request
        .get(`https://twitter.com/intent/user?user_id=${userId}`)
        .then(tweet => {
          if (tweet.text) {
            const $ = cheerio.load(tweet.text)
            let title = $('title').text().split(' (@')
            if (title.length === 2) {
              let name = title[0]
              let username = title[1].split(')')[0]
              let avatar = $('img.photo').attr('src')

              const userData = {
                userId,
                name,
                username,
                avatar
              }
              return Promise.resolve(userData)
            } else {
              throw(new Error('Not found'))
            }
          } else {
            throw(new Error('Not found'))
          }
        })
        .catch(err => {
          return Promise.resolve({
            error: 'Not found'
          })
        })
  }

  getDataByRedditUsername(username) {
    let userData = {}
    return request
        .get(`https://www.reddit.com/user/${username}/about.json`)
        .set('Accept', 'application/json')
        .then(res => {
          let data = res.body && res.body.data || {}
          if (data.name) {
            const name = data.name.toLowerCase()
            if (name === username.toLowerCase()) {
              userData = {
                userId: data.id,
                username: data.name,
                avatar: data.icon_img.replace(/&amp;/g, '&')
              }
              return Promise.resolve()
            } else {
              throw(new Error('Not found'))
            }
          } else {
            throw(new Error('Not found'))
          }
        })
        .then(() => {
          return request
              .get(`https://www.reddit.com/user/${username}`)
              .then(redditor => {
                if (redditor.text) {
                  const $ = cheerio.load(redditor.text)
                  userData.name = $('h4').text()
                }
                return Promise.resolve(userData)
              })
        })
        .catch(err => {
          if (userData.userId) {
            return Promise.resolve(userData)
          } else {
            return Promise.resolve({
              error: 'Not found'
            })
          }
        })
  }

}


module.exports = new Server