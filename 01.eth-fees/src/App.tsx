import React, { useEffect, useState } from "react";
import { Button, Container, Heading, Stat, StatHelpText, StatLabel, StatNumber, VStack } from "@chakra-ui/react";
import { Select } from "@chakra-ui/react";
import { AddEthereumChainParameter } from "@web3-react/types";
import { calculateTxStats, etherscanQuery, TX, TXListResponse } from "./lib/etherscan";
import { ChainID, CHAINS } from "./web3/chain";
import { metaMask, metaMaskHooks } from "./web3/connectors";
import { weiToGwei } from "./web3/utils";

const { useIsActive, useAccounts, useChainId } = metaMaskHooks;

const activateMetaMask = async ({
  desiredChainIdOrChainParameters,
  onError,
}: {
  desiredChainIdOrChainParameters?: number | AddEthereumChainParameter;
  onError(e: Error | undefined): void;
}): Promise<void> => {
  try {
    await metaMask.activate(desiredChainIdOrChainParameters);
  } catch (e) {
    if (e instanceof Error) {
      onError(e);
      return;
    }
    if ("message" in (e as any)) {
      onError(new Error((e as any).message));
      return;
    }
    onError(new Error("Unknown error"));
  }
  onError(undefined);
  console.log("Connected to chain", desiredChainIdOrChainParameters);
};

const SelectNetwork = ({ setError }: { setError: React.Dispatch<React.SetStateAction<Error | undefined>> }) => {
  const connectedChainId = useChainId() as ChainID | undefined;
  const placeholder = "__placeholder";

  return (
    <Select
      size="lg"
      value={connectedChainId || placeholder}
      onChange={async (e) => {
        const newChain = parseInt(e.target.value, 10);
        if (connectedChainId === newChain) {
          console.info("Already connected to this chain, do nothing");
          return;
        }
        await activateMetaMask({
          desiredChainIdOrChainParameters: newChain,
          onError: setError,
        });
      }}
    >
      <option value={placeholder}>Select Chain</option>
      {Object.entries(CHAINS).map(([id, { name }]) => (
        <option key={id} value={id}>
          {name}
        </option>
      ))}
    </Select>
  );
};

function App() {
  const [error, setError] = useState<Error | undefined>(undefined);

  const isActive = useIsActive();
  const accounts = useAccounts();
  const account = accounts?.[0];
  const connectedChainId = useChainId() as ChainID | undefined;

  const connectWallet = async () => {
    await activateMetaMask({
      onError: setError,
    });
  };

  const [accountTransactions, setAccountTransactions] = useState<TX[]>([]);
  const [ethUsdPrice, setEthUsdPrice] = useState<number>();

  useEffect(() => {
    type PriceResponse = {
      ethereum: {
        usd: number;
      };
    };

    (async () => {
      const coingeckoRes = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd`, {
        headers: {
          Accept: "application/json",
        },
      });
      const coingeckoJson: PriceResponse = await coingeckoRes.json();

      if (!coingeckoJson?.ethereum?.usd) {
        console.warn("No ETHUSD price found");
        return;
      }

      setEthUsdPrice(coingeckoJson.ethereum.usd);
    })();

    (async () => {
      if (!account || !connectedChainId) {
        console.info("No primary account or chainId");
        return;
      }

      const queryResult: TXListResponse | undefined = await etherscanQuery(
        {
          module: "account",
          action: "txlist",
          address: account,
          startblock: "0",
          endblock: "99999999",
          sort: "desc",
        },
        connectedChainId
      );

      setAccountTransactions(queryResult?.result || []);
    })();
  }, [account, connectedChainId]);

  const txStats = calculateTxStats(account, accountTransactions);
  const { count, failedTxs, totalGasUsed, avgGasPrice, totalFeesPaid, failedTotalFeesPaid } = txStats || {};

  return (
    <Container centerContent py="8">
      <VStack spacing="8">
        <header>
          <Heading as="h1" size="4xl">
            Eth Fees
          </Heading>
        </header>
        <VStack alignItems="start" spacing="4">
          <Stat>
            <StatLabel>Connection</StatLabel>
            <StatNumber>
              {error ? `Error 🔴 ${error.message}` : isActive ? "Connected 🟢" : "Not connected ⚪"}️
            </StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Chain</StatLabel>
            <StatNumber>
              <SelectNetwork setError={setError} />
            </StatNumber>
            <StatHelpText>You can switch networks from here or via your wallet</StatHelpText>
          </Stat>
          <Stat>
            <StatLabel>Connected Wallet</StatLabel>
            <StatNumber>{account || "-"}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Number of Transactions</StatLabel>
            <StatNumber>{count}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Failed Transactions</StatLabel>
            <StatNumber>{failedTxs}</StatNumber>
            {failedTotalFeesPaid && (
              <StatHelpText textColor="red.600">
                This wasted <b>Ξ{(failedTotalFeesPaid / 1e18).toFixed(5)}</b>
              </StatHelpText>
            )}
          </Stat>
          <Stat>
            <StatLabel>Total gas spent</StatLabel>
            <StatNumber>{totalGasUsed?.toLocaleString()}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Average gas price</StatLabel>
            <StatNumber>{avgGasPrice ? weiToGwei(avgGasPrice).toLocaleString() : "-"}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Total Spent</StatLabel>
            {totalFeesPaid && ethUsdPrice ? (
              <>
                <StatNumber>{`Ξ${(totalFeesPaid / 1e18).toFixed(5)} / $${(
                  (totalFeesPaid * ethUsdPrice) /
                  1e18
                ).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}</StatNumber>
                <StatHelpText>At today's rate of ${ethUsdPrice?.toLocaleString()}</StatHelpText>
              </>
            ) : (
              <StatNumber>{`Ξ- / $-`}</StatNumber>
            )}
          </Stat>
        </VStack>
        <Button disabled={isActive} colorScheme="blue" onClick={connectWallet}>
          Connect Wallet
        </Button>
      </VStack>
    </Container>
  );
}

export default App;
