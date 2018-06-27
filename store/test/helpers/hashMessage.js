
module.exports = web3 => {
  return msg => {
    return web3.sha3(`\u0019Ethereum Signed Message:\n${msg.length}${msg}`)
  }
}