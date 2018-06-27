const fs = require('bluebird').promisifyAll(require('fs-extra'))

fs.existsDir = filePath => {
  try {
    return fs.statSync(filePath).isDirectory()
  } catch (err) {
    return false
  }
}

module.exports = fs