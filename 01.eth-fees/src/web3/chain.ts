export enum ChainID {
  MAINNET = 1,
  Ropsten = 3,
  RINKEBY = 4,
  GOERLI = 5,
  LOCAL = 1337,
}

export type ChainInfo = {
  name: string;
  blockExplorerApiUrl: string | undefined;
};

export const CHAINS: Record<ChainID | number, ChainInfo> = {
  [ChainID.MAINNET]: {
    name: "Mainnet",
    blockExplorerApiUrl: "https://api.etherscan.io/api",
  },
  [ChainID.Ropsten]: {
    name: "Ropsten",
    blockExplorerApiUrl: undefined,
  },
  [ChainID.RINKEBY]: {
    name: "Rinkeby",
    blockExplorerApiUrl: "https://api-rinkeby.etherscan.io/api",
  },
  [ChainID.GOERLI]: {
    name: "Göerli",
    blockExplorerApiUrl: "https://api-goerli.etherscan.io/api",
  },
  [ChainID.LOCAL]: {
    name: "Local",
    blockExplorerApiUrl: undefined,
  },
};

export const getChainName = (id: ChainID | number | undefined): string =>
  id !== undefined && CHAINS[id]?.name !== undefined ? CHAINS[id].name : "Unknown Chain";

/**
 * Only support chains that have a block explorer
 */
export const checkChainSupported = (id: ChainID | number | undefined): boolean =>
  id !== undefined && id in CHAINS && CHAINS[id].blockExplorerApiUrl !== undefined;
