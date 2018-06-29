const Datastore = artifacts.require("./Datastore")
const StoreManager = artifacts.require("./StoreManager")
const OwnershipClaimer = artifacts.require("./OwnershipClaimer")
const TweedentityRegistry = artifacts.require("./TweedentityRegistry")

module.exports = function(deployer) {
  deployer.deploy(Datastore)
  deployer.deploy(StoreManager)
  deployer.deploy(OwnershipClaimer)
  deployer.deploy(TweedentityRegistry)
}
