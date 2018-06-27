const express = require('express')
const path = require('path')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const rfs = require('rotating-file-stream')
const api = require('./routes/api')
const fs = require('./lib/fs')
const Logger = require('./lib/Logger')

process.on('uncaughtException', function (error) {

  Logger.error(error.message)
  Logger.error(error.stack)

  // if(!error.isOperational)
  //   process.exit(1)
})

const app = express()

let logDirectory = '/var/log/tweedentity'
if (process.platform === 'darwin') {
  logDirectory = './log'
}

fs.ensureDirSync(logDirectory)
const accessLogStream = rfs('access.log', {
  interval: '1d', // rotate daily
  path: logDirectory
})
app.use(morgan('combined', {stream: accessLogStream}))

app.use(cookieParser())

app.get('/debug-index.html', function (req, res, next) {
  next()
})

app.use(express.static(path.resolve(__dirname, '../static')))

// app.use('/', index)
app.use('/api', api)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})

if (app.get('env') == 'development') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500)
    res.render('error', {
      title: 'Error',
      message: err.message,
      error: err
    })
  })
}

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.json({error: 'Error'})
})

module.exports = app
