import { ChainID, CHAINS } from "../web3/chain";

const ETHERSCAN_API_KEY = process.env.REACT_APP_ETHERSCAN_API_KEY;

export type TX = {
  blockHash: string;
  blockNumber: string;
  confirmations: string;
  contractAddress: string;
  cumulativeGasUsed: string;
  from: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  hash: string;
  input: string;
  isError: string;
  nonce: string;
  timeStamp: string;
  to: string;
  transactionIndex: string;
  txreceipt_status: string;
  value: string;
};

export type TXListResponse = {
  message?: string; // OK
  status?: string; // 1
  result?: TX[];
};

export type TxStats = {
  count: number;
  totalGasUsed: number;
  avgGasPrice: number;
  // gasUsed * gasPrice?
};

export const etherscanQuery = async (params: Record<string, string>, chain: ChainID) => {
  if (!ETHERSCAN_API_KEY) {
    console.error("No ETHERSCAN_API_KEY set");
    return;
  }
  const urlString = CHAINS[chain].blockExplorerApiUrl;
  if (!urlString) {
    console.warn(`No block explorer API URL for chain ${chain}`);
    return;
  }
  const url = new URL(urlString);
  url.search = new URLSearchParams({ ...params, apikey: ETHERSCAN_API_KEY }).toString();
  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
  });
  return res.json();
};

export const countTotalGasUsed = (txs: TX[]): number =>
  txs.reduce((acc, tx) => {
    return acc + parseInt(tx.gasUsed, 10);
  }, 0);
