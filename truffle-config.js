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
      gas: 3000000,
    }
    // development: {
    //   provider: new HDWalletProvider({
    //     providerOrUrl: 'http://127.0.0.1:8545',
    //     privateKeys: ['0xa7eb5a1ee0f2af4c4e511909a3f3fbc8c6217280b23086aa2a82ba0157dbaab3'],
    //   }),
    //   network_id: '1689801624516',
    //   gas: 30000000
    // }
  },
  compilers: {
    solc: {
      version: '0.8.10', // Fetch exact version from solc-bin (default: truffle's version)
    },
  },
};
