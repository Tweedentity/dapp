const fs = require('./fs')
const Log = require('log')
const rfs = require('rotating-file-stream')

let logDirectory = '/var/log/tweedentity'
if (process.platform === 'darwin') {
  logDirectory = '../../log'
}

fs.ensureDirSync(logDirectory)

const accessLogStream = rfs('debug.log', {
  interval: '1d', // rotate daily
  path: logDirectory
})

const log = new Log('debug', accessLogStream)

module.exports = log