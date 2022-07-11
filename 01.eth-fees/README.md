A clone of [fees.wtf](fees.wtf) (before the airdrop). Connect your wallet and see how much you've spent in tx fees.

## Learnings

- intended learnings are:
  - use web3-react to connect metamask to the app
  - [bonus] use metamask's native interface to understand how web3-react works under-the-hood
  - understand ethereum transactions better and usage of etherscan's api
  - [bonus] get familiar with TheGraph's api for querying the chain
  - work with wei & gwei & ether

## Notes

- originally used web3 react for interacting with metamask and tracking wallet state, but followed-up with interacting
  with MM's api directly
  - you can see [metamask-native](./src/web3/metamask-native.ts) for code to interact with window.ethereum directly
  - metamask should conform to [eip-1193](https://eips.ethereum.org/EIPS/eip-1193), a JS API for Ethereum Providers
- the old fees.wtf source code is hosted here: https://github.com/Sigri44/fees.wtf/blob/main/js/main.js
