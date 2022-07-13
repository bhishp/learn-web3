import React, { useEffect, useState } from "react";
import { Box, Button, Container, Heading, Stat, StatHelpText, StatLabel, StatNumber, VStack } from "@chakra-ui/react";
import { BigNumber } from "@ethersproject/bignumber";
import { formatEther, formatUnits } from "@ethersproject/units";
import { SelectNetwork } from "./components/select-network";
import { calculateTxStats, etherscanQuery, TX, TXListResponse } from "./lib/etherscan";
import { checkChainSupported, getChainName } from "./web3/chain";
import { activateMetaMask, metaMaskHooks } from "./web3/connectors";
import { roundTo } from "./web3/utils";

const { useIsActive, useAccounts, useChainId } = metaMaskHooks;

function App() {
  const [error, setError] = useState<Error | undefined>(undefined);

  const isActive = useIsActive();
  const accounts = useAccounts();
  const account = accounts?.[0];
  const connectedChainId = useChainId();
  const isChainSupported = checkChainSupported(connectedChainId);

  const connectWallet = async () => {
    await activateMetaMask({
      onError: setError,
    });
  };

  const [accountTransactions, setAccountTransactions] = useState<TX[]>([]);
  const [ethCentsPrice, setEthCentsPrice] = useState<BigNumber>();

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

      // arrives as a 2dp number, e.g. 1080.63
      const cents = (coingeckoJson.ethereum.usd * 100).toFixed(0);
      setEthCentsPrice(BigNumber.from(cents));
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
  const { count, failedTxsCount, totalGasUsed, avgGasPrice, totalFeesPaid, failedTotalFeesPaid } = txStats || {};

  return (
    <Box w="full" overflowX="hidden">
      <Container centerContent py="8">
        <VStack w="full" spacing="8">
          <header>
            <Heading as="h1" size="4xl">
              Eth Fees
            </Heading>
          </header>
          <VStack w="full" alignItems="start" spacing="4">
            <Stat>
              <StatLabel>Connection</StatLabel>
              <StatNumber>
                {!isChainSupported
                  ? `🔴 ${getChainName(connectedChainId)} not supported, please switch chains`
                  : error
                  ? `🔴 Error ${error.message}`
                  : isActive
                  ? "🟢 Connected"
                  : "⚪ Not connected"}
                ️
              </StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Chain</StatLabel>
              <StatNumber>
                <SelectNetwork setError={setError} />
              </StatNumber>
              <StatHelpText>You can switch networks from here or via your wallet</StatHelpText>
            </Stat>
            <Stat w="full">
              <StatLabel>Connected Wallet</StatLabel>
              <StatNumber>{account || "-"}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Number of Transactions</StatLabel>
              <StatNumber>{count}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Failed Transactions</StatLabel>
              <StatNumber>{failedTxsCount}</StatNumber>
              {!!failedTotalFeesPaid && (
                <StatHelpText textColor="red.600">
                  <>
                    This wasted <b>Ξ{roundTo(formatEther(failedTotalFeesPaid), 5)}</b>
                  </>
                </StatHelpText>
              )}
            </Stat>
            <Stat>
              <StatLabel>Total gas spent</StatLabel>
              <StatNumber>{totalGasUsed?.toLocaleString()}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Average gas price</StatLabel>
              <StatNumber>{avgGasPrice ? roundTo(formatUnits(avgGasPrice, "gwei"), 3) + " gwei" : "-"}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Total Spent</StatLabel>
              {totalFeesPaid && ethCentsPrice ? (
                <>
                  <StatNumber>{`Ξ${roundTo(formatEther(totalFeesPaid), 5)} / $${roundTo(
                    formatEther(ethCentsPrice.mul(totalFeesPaid).div(100)),
                    2
                  )}
                    `}</StatNumber>
                  <StatHelpText>At today's rate of ${ethCentsPrice?.toLocaleString()}</StatHelpText>
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
    </Box>
  );
}

export default App;
