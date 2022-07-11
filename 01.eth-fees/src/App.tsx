import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  VStack,
} from "@chakra-ui/react";
import { countTotalGasUsed, etherscanQuery, TX, TXListResponse } from "./lib/etherscan";
import { ChainID, CHAINS } from "./web3/chain";
import { metaMask, metaMaskHooks } from "./web3/connectors";

const { useIsActive, useAccounts, useChainId } = metaMaskHooks;

function App() {
  const [error, setError] = useState<Error | null>(null);
  const isActive = useIsActive();
  const accounts = useAccounts();
  const connectedChainId = useChainId() as ChainID | undefined;
  const connectedChainName =
    connectedChainId === undefined ? "-" : CHAINS[connectedChainId as ChainID]?.name || "Unknown Chain";

  const [accountTransactions, setAccountTransactions] = useState<TX[]>([]);

  const primaryAccount = accounts?.[0];

  const connectWallet = async () => {
    try {
      await metaMask.activate();
    } catch (e) {
      if (e instanceof Error) {
        setError(e);
      } else {
        setError(new Error("Unknown error"));
      }
    }
  };

  useEffect(() => {
    (async () => {
      if (!primaryAccount || !connectedChainId) {
        console.info("No primary account or chainId");
        return;
      }

      const queryResult: TXListResponse | undefined = await etherscanQuery(
        {
          module: "account",
          action: "txlist",
          address: primaryAccount,
          startblock: "0",
          endblock: "99999999",
          sort: "desc",
        },
        connectedChainId
      );

      setAccountTransactions(queryResult?.result || []);
    })();
  }, [primaryAccount, connectedChainId]);

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
            <StatNumber>{connectedChainName}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Connected Wallet</StatLabel>
            <StatNumber>{accounts?.toString() || "-"}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Number of Transactions</StatLabel>
            <StatNumber>{accountTransactions.length}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Total gas spent</StatLabel>
            <StatNumber>{countTotalGasUsed(accountTransactions).toLocaleString()}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Average gas price</StatLabel>
            <StatNumber>{"-"}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Total Spent</StatLabel>
            <StatNumber>{"Ξx / $y"}</StatNumber>
            <StatHelpText>At a rate of $x</StatHelpText>
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
