const HDWalletProvider = require('@truffle/hdwallet-provider');
const provider = new HDWalletProvider({
  privateKeys: ['a8e66db42afe6bf8dc92e88d4983697568b419be8bad9fdda2a8e318fca120a4'],
  providerOrUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
});

module.exports = {
  networks: {
    binanceTestnet: {
      provider: () => provider,
      network_id: '97',
      gas: 5000000,
    },
    ganache:{
      host: "127.0.0.1",
      port: 7545,
      network_id: 5777
    }
  },
  compilers: {
    solc: {
      version: '0.8.10', // Fetch exact version from solc-bin (default: truffle's version)
    },
  },
};
