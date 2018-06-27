const messages = {
  notConnected: 'You are not connected to the Ethereum network',
  installPlugin: 'In order to use the Tweedentity ÐApp you should install an extension like Metamask, or use a browser compatible with Ethereum like Mist, Parity or Brave.',
  unsupported: 'You are connected to an unsupported Ethereum network',
  unsupportedHint: 'In order to use the Tweedentity ÐApp you should connect to a supported network. This alpha version supports only Ropsten.',
  connectedToMain: 'You are connected to the main Ethereum network',
  connectToRopsten: 'In order to use the Tweedentity ÐApp you should connect to a supported network. This alpha version supports only Ropsten.',
  connectedToRopsten: 'You are connected to the Ropsten test network',
  welcomeBack: user => `Welcome back, ${user}`,
  looksGood: 'Your wallet looks good.',
  notGood: 'You did many transactions with this wallet.',
  veryBad: 'You did a lot of transactions with this wallet.',
  weSuggest: 'For your privacy, we suggest you use a wallet with almost no transactions to /from any other wallet. After that you have set your tweedentity, anyone could see all your transactions. The best practice is to create a new wallet and send a minimum amount of ether to it using an exchange like <a href="https://https://shapeshift.io/" target="_blank">ShapeShift</a>. Read more about privacy here.',
  lowBalance: minimum => `Balance too low. You need ${minimum} ether to activate your tweedentity.`,
  walletStats: 'Your wallet stats'
}

module.exports = messages