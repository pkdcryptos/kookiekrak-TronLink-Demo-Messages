require('babel-register')
require('babel-polyfill')

module.exports = {
  networks: {
    local: {
      host: 'localhost',
      port: 8545,
      network_id: '*',
      gas: 5000000
    }
  },
  mocha: {
    enableTimeouts: false
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 1000000
    },
  }
}
