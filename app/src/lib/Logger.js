var chalk = require('chalk')
var defaultLogLevel = 'trace'
var logLevel = defaultLogLevel

//
// Available level methods:
//
//      Logger.trace(label, object)
//      Logger.debug(label, object)
//      Logger.warn(label, object)
//      Logger.error(label, object)
//      Logger.fatal(label, object)
//      Logger.magic(label, object)
//
//      magic is supposed to be used in development to see specific logs and, if needed, only them
//

var LOG_LEVELS = 'trace.debug.info.warn.error.fatal.magic'.split('.')
var COLORS = 'gray.green.cyan.yellow.red.magenta.blue'.split('.')
var BOLDS = '.....+.+'.split('.')

function logIf(level) {
    return LOG_LEVELS.indexOf(logLevel) <= LOG_LEVELS.indexOf(level)
}

/* eslint-disable no-console */

function log(level, str, obj) {
    var l = LOG_LEVELS.indexOf(level)
    var c = chalk
    if (BOLDS[l]) {
        c = chalk.bold
    }
    if (obj && obj instanceof Error) {
        level = 'error'
    }
    str = level.toUpperCase() + ': ' + str
    var colorFn = c[COLORS[l]]
    console.log(colorFn(str))

    if (obj) {
        if (obj instanceof Error) {
            obj = JSON.stringify(obj, null, 2)
            console.log(colorFn('Error message: ' + obj.message))
            console.log(colorFn(obj.stack))
        } else {
            console.log(colorFn(JSON.stringify(obj, null, 2)))
        }
    }
}

var NodeLogger = {
    setLevel: function setLevel(level) {
        logLevel = level
    },
    resetLevel: function resetLevel() {
        logLevel = defaultLogLevel
    }
}

LOG_LEVELS.map(function (logLevel) {
    NodeLogger[logLevel] = function (str, obj) {
        if (logIf(logLevel)) {
            log(logLevel, str, obj)
        }
    }
})

module.exports = NodeLogger
