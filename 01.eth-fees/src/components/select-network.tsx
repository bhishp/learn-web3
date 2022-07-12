import React from "react";
import { Select } from "@chakra-ui/react";
import { ChainID, CHAINS } from "../web3/chain";
import { activateMetaMask, metaMaskHooks } from "../web3/connectors";

const { useChainId } = metaMaskHooks;

export const SelectNetwork = ({ setError }: { setError: React.Dispatch<React.SetStateAction<Error | undefined>> }) => {
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
