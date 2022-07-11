import { useEffect, useState } from "react";

// "exclude": [
//       "node_modules/@metamask/detect-provider/dist/index.d.ts"
//   ],

// import { ExternalProvider } from "@ethersproject/providers";
//
// declare global {
//   interface Window {
//     ethereum: ExternalProvider;
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
