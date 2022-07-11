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
  failedTxs: number;
  totalGasUsed: number;
  failedTotalGasUsed: number;
  totalGasPrice: number;
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

/**
 *
 * @param account
 * @param txs
 */
export const calculateTxStats = (account: string | undefined, txs: TX[]): TxStats | undefined => {
  if (!account) {
    return;
  }

  const calcs = txs.reduce(
    (acc, tx) => {
      // only interested in transactions originating from the account
      if (tx.from.toLowerCase() !== account.toLowerCase()) {
        return acc;
      }

      return {
        count: acc.count + 1,
        failedTxs: acc.failedTxs + (tx.isError === "1" ? 1 : 0),
        totalGasUsed: acc.totalGasUsed + parseInt(tx.gasUsed, 10),
        failedTotalGasUsed: acc.failedTotalGasUsed + (tx.isError === "1" ? parseInt(tx.gasUsed, 10) : 0),
        totalGasPrice: acc.totalGasPrice + parseInt(tx.gasPrice, 10),
      };
    },
    {
      count: 0,
      failedTxs: 0,
      totalGasUsed: 0,
      failedTotalGasUsed: 0,
      totalGasPrice: 0,
    }
  );

  return {
    ...calcs,
    avgGasPrice: calcs.totalGasPrice / calcs.count,
  };
};
