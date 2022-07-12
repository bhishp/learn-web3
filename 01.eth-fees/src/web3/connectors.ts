import { initializeConnector } from "@web3-react/core";
import { MetaMask } from "@web3-react/metamask";
import { AddEthereumChainParameter } from "@web3-react/types";

export const [metaMask, metaMaskHooks] = initializeConnector<MetaMask>((actions) => new MetaMask({ actions }));

export const activateMetaMask = async ({
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
