import { BigNumber } from "@ethersproject/bignumber";
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
  totalGasUsed: BigNumber;
  totalGasPrice: BigNumber;
  avgGasPrice: BigNumber;
  totalFeesPaid: BigNumber;
  // failed txs
  failedTxsCount: number;
  failedTotalGasUsed: BigNumber;
  failedTotalFeesPaid: BigNumber;
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
 * All ether values represented in wei
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
      const isError = tx.isError === "1";

      const fee = BigNumber.from(tx.gasUsed).mul(BigNumber.from(tx.gasPrice));

      return {
        count: acc.count + 1,
        totalGasUsed: acc.totalGasUsed.add(BigNumber.from(tx.gasUsed)),
        totalGasPrice: acc.totalGasPrice.add(BigNumber.from(tx.gasPrice)),
        totalFeesPaid: acc.totalFeesPaid.add(fee),
        // failed Txs
        failedTxsCount: acc.failedTxsCount + (isError ? 1 : 0),
        failedTotalGasUsed: acc.failedTotalGasUsed.add(isError ? BigNumber.from(tx.gasUsed) : 0),
        failedTotalFeesPaid: acc.failedTotalFeesPaid.add(isError ? fee : 0),
      };
    },
    {
      count: 0,
      totalGasUsed: BigNumber.from(0),
      totalGasPrice: BigNumber.from(0),
      totalFeesPaid: BigNumber.from(0),
      failedTxsCount: 0,
      failedTotalGasUsed: BigNumber.from(0),
      failedTotalFeesPaid: BigNumber.from(0),
    }
  );

  return {
    ...calcs,
    avgGasPrice: calcs.totalGasPrice.div(calcs.count || 1),
  };
};
