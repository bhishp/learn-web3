import { useEffect, useState } from "react";

// We have to use @ts-ignore throughout the code because we are trying to access
// window.ethereum, which is not accutally part of the window object according to
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

export const useRegisterMM = () => {
  const [account, setAccount] = useState<string | undefined>();
  const [chainId, setChainId] = useState<number | undefined>();

  useEffect(() => {
    // define handlers
    const handleConnect = (connectInfo: ConnectInfo) => {
      console.log("connectInfo", connectInfo);
    };
    const handleAccountsChanged = (accounts: string[]) => {
      console.log("accountsChanged");
      // console.log(accounts[0]);
      setAccount(accounts[0]);
    };
    const handleChainChanged = (cId: string) => {
      console.log("chainChanged");
      // console.log(cId);
      setChainId(parseInt(cId, 16));
    };

    // register handlers
    // @ts-ignore
    window.ethereum.on("connect", handleConnect);
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
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      // @ts-ignore
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, []);

  return {
    account,
    chainId,
  };
};
