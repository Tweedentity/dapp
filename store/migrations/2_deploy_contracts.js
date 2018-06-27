const TweedentityStore = artifacts.require("./TweedentityStore")
const TweedentityManager = artifacts.require("./TweedentityManager")
const TweedentityClaimer = artifacts.require("./TweedentityClaimer")
const TweedentityRegistry = artifacts.require("./TweedentityRegistry")

module.exports = function(deployer) {
  deployer.deploy(TweedentityStore)
  deployer.deploy(TweedentityManager)
  deployer.deploy(TweedentityClaimer)
  deployer.deploy(TweedentityRegistry)
}
