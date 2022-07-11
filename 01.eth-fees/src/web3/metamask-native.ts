import { useEffect, useState } from "react";

// We have to use @ts-ignore throughout the code because we are trying to access
// window.ethereum, which is not actually part of the window object according to
// the dom spec. It would be nice to define the ethereum object with the correct
// typings on thw window, and ethers provides us a nice type to leverage (ExternalProvider),
// however, the @metamask/detect-provider package also includes an index.d.ts file,
// which defines the ethereum object on the window for. The type used here is
// limited, and typescript won't let us define clashing declarations, therefore
// we are stuck with the MM one
// import { ExternalProvider } from "@ethersproject/providers";
//
// declare global {
//   interface Window {
//     ethereum?: ExternalProvider;
//   }
// }

export const mmIsInstalled = (): boolean => {
  return typeof window.ethereum !== "undefined" && !!window.ethereum.isMetaMask;
};

export const mmConnect = async (): Promise<void> => {
  // @ts-ignore
  return window.ethereum.request({ method: "eth_requestAccounts" });
};

export const mmGetAccount = async (): Promise<string> => {
  // @ts-ignore
  const accounts = await window.ethereum.request({ method: "eth_accounts" });
  return accounts[0];
};

export const mmGetChainId = async (): Promise<number> => {
  // @ts-ignore
  const chainId = await window.ethereum.request({ method: "eth_chainId" });
  return parseInt(chainId, 16);
};

interface ConnectInfo {
  chainId: string;
}

const computeIsActive = ({ account, chainId }: { account: string | undefined; chainId: number | undefined }): boolean =>
  !!account && !!chainId;

// See the ethereum wallet JS API spec here: https://eips.ethereum.org/EIPS/eip-1193
export const useRegisterMM = () => {
  // web3-react's concept is "isActive" is computed from chainId,accounts,activating. See here: https://github.com/Uniswap/web3-react/blob/d0def622d46e93a1ea2295a08be121260c612397/packages/core/src/hooks.ts#L277
  const [isActive, setIsActive] = useState<boolean>(false);
  const [account, setAccount] = useState<string | undefined>();
  const [chainId, setChainId] = useState<number | undefined>();

  useEffect(() => {
    // define handlers
    const handleConnect = (connectInfo: ConnectInfo) => {
      console.log("connect", connectInfo);
    };
    const handleDisconnect = (disconnectInfo: unknown) => {
      console.log("disconnect", disconnectInfo);
    };
    const handleAccountsChanged = (accounts: string[]) => {
      console.log("accountsChanged");
      setAccount(accounts[0]);
    };
    const handleChainChanged = (cId: string) => {
      console.log("chainChanged");
      setChainId(parseInt(cId, 16));
    };

    // register handlers
    // @ts-ignore
    window.ethereum.on("connect", handleConnect);
    // @ts-ignore
    window.ethereum.on("disconnect", handleDisconnect);
    // @ts-ignore
    window.ethereum.on("accountsChanged", handleAccountsChanged);
    // @ts-ignore
    window.ethereum.on("chainChanged", handleChainChanged);

    // initialise state
    (async () => {
      setAccount(await mmGetAccount());
      setChainId(await mmGetChainId());
    })();

    // cleanup handlers
    return () => {
      // @ts-ignore
      window.ethereum.removeListener("connect", handleConnect);
      // @ts-ignore
      window.ethereum.removeListener("disconnect", handleDisconnect);
      // @ts-ignore
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      // @ts-ignore
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  // recompute isActive when chainId or account changes
  useEffect(() => {
    setIsActive(computeIsActive({ account, chainId }));
  }, [account, chainId]);

  return {
    isActive,
    account,
    chainId,
  };
};
