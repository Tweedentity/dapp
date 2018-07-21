const request = require('superagent')
const cheerio = require('cheerio')

class Server {

  getDataById(webApp, nameId) {
    if (webApp === 'twitter') {
      return this.getDataByTwitterUserId(nameId)
    } else if (webApp === 'reddit') {
      return this.getDataByRedditUsername(nameId)
    } else {
      throw('App not supported')
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
              return Promise.resolve({
                userData
              })
            } else {
              throw('User not found')
            }
          } else {
            throw('User not found')
          }
        })
  }

  getDataByRedditUsername(username) {
    return request
        .get(`https://www.reddit.com/user/${username}/about.json`)
        .set('Accept', 'application/json')
        .then(res => {
          let userData = {}
          let data = res.body && res.body.data || {}
          if (data.name) {
            const name = data.name.toLowerCase()
            if (name === username.toLowerCase()) {
              userData = {
                userId: data.id,
                username: data.name,
                avatar: data.icon_img.replace(/&amp;/g, '&')
              }
            } else {
              throw('User not found')
            }
          } else {
            throw('User not found')
          }
          return Promise.resolve(userData)
        })
        .then(userData => {
          return request
              .get(`https://www.reddit.com/user/${username}`)
              .then(redditor => {
                if (redditor.text) {
                  const $ = cheerio.load(redditor.text)
                  userData.name = $('h4').text()
                }
                return Promise.resolve({
                  userData
                })
              })
        })
  }

}


module.exports = new Server