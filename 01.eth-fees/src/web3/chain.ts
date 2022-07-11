export enum ChainID {
  MAINNET = 1,
  Ropsten = 3,
  RINKEBY = 4,
  GORLI = 5,
  LOCAL = 1337,
}

export type ChainInfo = {
  name: string;
  blockExplorerApiUrl: string | undefined;
};

export const CHAINS: Record<ChainID, ChainInfo> = {
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
  [ChainID.GORLI]: {
    name: "Görli",
    blockExplorerApiUrl: undefined,
  },
  [ChainID.LOCAL]: {
    name: "Local",
    blockExplorerApiUrl: undefined,
  },
};
