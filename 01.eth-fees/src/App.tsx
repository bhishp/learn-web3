import React, { useState } from "react";
import { Box, Button, Container, Flex, Heading, Stat, StatLabel, StatNumber, VStack } from "@chakra-ui/react";
import { metaMask, metaMaskHooks } from "./web3/connectors";

enum ChainID {
  MAINNET = 1,
  Ropsten = 3,
  RINKEBY = 4,
  GÖRLI = 5,
  LOCAL = 1337,
}

const CHAINS = {
  [ChainID.MAINNET]: {
    name: "Mainnet",
  },
  [ChainID.Ropsten]: {
    name: "Ropsten",
  },
  [ChainID.RINKEBY]: {
    name: "Rinkeby",
  },
  [ChainID.GÖRLI]: {
    name: "Görli",
  },
  [ChainID.LOCAL]: {
    name: "Local",
  },
};

const { useIsActive, useAccounts, useChainId } = metaMaskHooks;

function App() {
  const [error, setError] = useState<Error | null>(null);
  const isActive = useIsActive();
  const accounts = useAccounts();
  const connectedChainId = useChainId();
  const connectedChainName =
    connectedChainId === undefined ? "-" : CHAINS[connectedChainId as ChainID]?.name || "Unknown Chain";

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

  return (
    <Container centerContent py="8">
      <VStack spacing="8">
        <header>
          <Heading as="h1" size="4xl">
            Eth Fees
          </Heading>
        </header>
        <VStack alignItems="start" spacing="2">
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
            {/*<StatHelpText>Feb 12 - Feb 28</StatHelpText>*/}
          </Stat>
          <Stat>
            <StatLabel>Number of Transactions</StatLabel>
            <StatNumber>-</StatNumber>
            {/*<StatHelpText>Feb 12 - Feb 28</StatHelpText>*/}
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
