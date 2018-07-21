module.exports = {

  appNicknames: [
    'twitter',
    'reddit'
  ],

  appIds: {
    twitter: 1,
    reddit: 2
  },

  abi: {
    registry: require(`./TweedentityRegistry`),
    store: require(`./Datastore`),
    manager: require(`./StoreManager`),
    claimer: require(`./OwnershipClaimer`)
  }

}
