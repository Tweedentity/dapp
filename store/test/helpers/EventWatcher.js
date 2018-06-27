class EventWatcher {

  watch(contract, filter, logResult) {
    return new Promise((resolve, reject) => {
      this.event = contract[filter.event](filter.args, {fromBlock: filter.fromBlock, toBlock: filter.toBlock})
      this.event.watch((error, result) => {
        if (result) {
          if (logResult) console.log(result)
          resolve(result)
        } else {
          reject('Failed to find events for ' + this.event)
        }
        this.stop()
      })
    })
  }

  stop() {
    if (this.event) {
      this.event.stopWatching()
      this.event = null
    }
  }
}

module.exports = new EventWatcher
