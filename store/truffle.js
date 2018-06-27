const HDWalletProvider = require("truffle-hdwallet-provider")
const mnemonic = process.env.MNEMONIC
const infuraKey = process.env.INFURA_KEY

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*",
      gas: 4000000
    },
    ganache: {
      host: "localhost",
      port: 7545,
      network_id: "*",
      gas: 4000000
    },
    private: {
      host: "localhost",
      port: 8546,
      network_id: "11",
      gas: 3200000
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(mnemonic, `https://ropsten.infura.io/${infuraKey}`)
      },
      network_id: 3,
      gas: 4612388,
      gasPrice: 23000000000
    },
    mainnet: {
      provider: function() {
        return new HDWalletProvider(mnemonic, `https://mainnet.infura.io/${infuraKey}`)
      },
      network_id: 1,
      gas: 2000000,
      gasPrice: 10000000000
    }
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
};
