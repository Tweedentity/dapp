const ls = require('local-storage')

class Db {

  constructor(setState) {
    this.setState = setState
    this.data = JSON.parse(ls('db') || "{}")
  }

  put(key, val) {

    try {
      let db = this.data
      let data
      if (typeof key === 'object') {
        data = key
      } else {
        data = val
        if (!this.data[key]) {
          this.data[key] = {}
        }
        db = this.data[key]
      }
      let save = false
      for (let d in data) {
        db[d] = data[d]
        save = true
      }
      if (save) {
        ls('db', JSON.stringify(this.data))
        this.setState(this.data)
      }
    } catch (err) {
      console.error(err.message)
    }
  }

  set(key, val) {
    try {
      if (this.data[key]) {
        delete this.data[key]
      }
      if (val) {
        this.data[key] = val
      }
      ls('db', JSON.stringify(this.data))
      this.setState(this.data)
    } catch (err) {
      console.error(err.message)
    }
  }

  reset() {
    this.data = {}
    ls('db', '{}')
  }

}

module.exports = Db
