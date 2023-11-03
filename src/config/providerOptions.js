import WalletConnect from "@walletconnect/web3-provider";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import Fortmatic from 'fortmatic';
import Portis from "@portis/web3";

import config from "./config"

export const providerOptions = {
    walletlink: {
        package: CoinbaseWalletSDK,
        options: {
            appName: "Ethax",
            infuraId: config.walletlink
        }
    },
    walletconnect: {
        package: WalletConnect,
        options: {
            infuraId: config.walletconnect
        }
    },
    fortmatic: {
        package: Fortmatic,
        options: {
            key: config.fortmatic
        }
    },
    portis: {
        package: Portis,
        options: {
            id: config.portis
        }
    },
    binancechainwallet: {
        package: true,
        options: {
            rpc: {
                56: "https://bsc-dataseed.binance.org/",
                97: "https://data-seed-prebsc-2-s3.binance.org:8545/"
            }
        },
    },
};
