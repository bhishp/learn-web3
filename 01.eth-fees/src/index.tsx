import React from "react";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { Web3ReactProvider } from "@web3-react/core";
import { Web3ReactProviderProps } from "@web3-react/core/dist/provider";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { metaMask, metaMaskHooks } from "./web3/connectors";

const colors = {
  brand: {
    900: "#1a365d",
    800: "#153e75",
    700: "#2a69ac",
  },
};

const theme = extendTheme({ colors });

//     "@ethersproject/bignumber": "^5.6.0",
//     "@ethersproject/experimental": "^5.6.0",
//     "@ethersproject/providers": "^5.6.0",
//     "@ethersproject/units": "^5.6.0",

const connectors: Web3ReactProviderProps["connectors"] = [[metaMask, metaMaskHooks]];

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <Web3ReactProvider connectors={connectors}>
        <App />
      </Web3ReactProvider>
    </ChakraProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
