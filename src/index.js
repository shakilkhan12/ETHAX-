import React from "react";
import ReactDOM from "react-dom";
import { Route, Switch, BrowserRouter, Redirect } from "react-router-dom";
import "./index.css";
import "./nft.css";
import i18n from "./components/i18next/i18n";
import { Provider } from "react-redux";
import store from "./store";
import { I18nextProvider } from "react-i18next";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// pages for this product
import Home from "./views/home.js";
import Audit from "./views/Audit.js";
import Farms from "./views/farms";
import Pools from "./views/pools";
import Exchange from "./views/exchange/exchange";
import Addliquidity from "./views/liquidity/addliquidity";
import Liquidity from "./views/liquidity/liquidity";
import RemoveLiquidity from "./views/liquidity/remove-liquidity";
import BuyToken from "./views/BuyToken/buytoken";
import { WagmiConfig, createConfig, configureChains, mainnet } from "wagmi";
// import { goerli } from '@wagmi/chains'
import { publicProvider } from "wagmi/providers/public";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
import { bsc, bscTestnet } from "@wagmi/chains";
// import { bsc, bscTestnet } from 'viem/chains'

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [bsc, bscTestnet],
  [publicProvider()]
);

// Set up wagmi config
const config = createConfig({
  autoConnect: true,
  connectors: [
    new WalletConnectConnector({
      chains,
      options: {
        projectId: "681700e231a5aef269b7fe4adb34981a",
        version: "2",
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
});

ReactDOM.render(
  <Provider store={store}>
    <I18nextProvider i18n={i18n}>
      <WagmiConfig config={config}>
        <BrowserRouter basename="/">
          <ToastContainer />
          <Switch>
            <Route path="/home" component={Home} />
            <Route path="/audit" component={Audit} />
            <Route path="/farms" component={Farms} />
            <Route path="/pools" component={Pools} />
            <Route path="/exchange" component={Exchange} />
            {/* <Route path="/buytoken" component={BuyToken} /> */}
            <Route path="/liquidity" component={Liquidity} />

            <Route path="/add-liquidity" component={Addliquidity} />
            <Route
              path="/remove-liquidity/:tokena/:tokenb"
              component={RemoveLiquidity}
            />
            <Route exact path="/*" component={Home}>
              <Redirect to="/home" />
            </Route>
          </Switch>
        </BrowserRouter>
      </WagmiConfig>
    </I18nextProvider>
  </Provider>,
  document.getElementById("root")
);
