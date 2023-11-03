let key = {
  netWorkUrl: "https://bsc-dataseed.binance.org",
  NetworkId: 56,
  Factory: "0xF83f344194C7EEC496ed9e9283b2edEedE34CB0d",
  ETHSYMBOL: "BNB"
};




if (process.env.NODE_ENV === "production") {
  key = {

    rpcurl: "https://bsc-dataseed.binance.org",

    liqutityfee: 0.25,
    FrontendUrl: "http://localhost:3000/",
    baseUrl: "http://localhost:2506/v1",//
    imageUrl: "https://www.ethax.io/images/question.svg",///
    BUSD: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
    NetworkId: 56,
    networkName: "Binance chain",
    toFixed: 8,
    txUrl: "https://bscscan.com/tx/",
    txUrlAddress: "https://bscscan.com/address/",
    walletlink: "https://mainnet-infura.wallet.coinbase.com",
    walletconnect: "------------",
    fortmatic: "-----------",
    portis: "------------",
    defaultLogo: "https://www.ethax.io/images/question.svg",
    netWorkUrl: "https://bsc-dataseed1.binance.org",
    limit: 6,
    ETHSYMBOL: "BNB",
    Router: "0x55216c7BF00A93f11cc7435D6FDC692E2d80Bc81",

    MasterChef: "0x1a8EE6994970F4967227cBBa3fB06ca2bbdD0aEc",
    Factory: "0xF83f344194C7EEC496ed9e9283b2edEedE34CB0d",
    EthaxAddress: "0x854F7Cd3677737241E3eED0dC3d7F33DFAF72Bc4",
    Ethax_Busd_LP: "0xEbCD635a395e2ecE39A7583fe8b6792DD79f02cA",
    Ethax_Bnb_LP: "0x1915ddEb50db91a50Ae9afad343fa75512fbf220",
    WBNB: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"

  };
} else {
  key = {
    rpcurl: "https://bsc-dataseed.binance.org",

    liqutityfee: 0.25,
    FrontendUrl: "http://localhost:3000/",
    baseUrl: "http://localhost:2506/v1",//
    imageUrl: "https://www.ethax.io/images/question.svg",///
    BUSD: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
    NetworkId: 56,
    networkName: "Binance chain",
    toFixed: 8,
    txUrl: "https://bscscan.com/tx/",
    txUrlAddress: "https://bscscan.com/address/",
    walletlink: "https://mainnet-infura.wallet.coinbase.com",
    walletconnect: "---------",
    fortmatic: "-----------",
    portis: "------------",
    defaultLogo: "https://www.ethax.io/images/question.svg",
    netWorkUrl: "https://bsc-dataseed1.binance.org",
    limit: 6,
    ETHSYMBOL: "BNB",
    Router: "0x55216c7BF00A93f11cc7435D6FDC692E2d80Bc81",

    MasterChef: "0x1a8EE6994970F4967227cBBa3fB06ca2bbdD0aEc",
    Factory: "0xF83f344194C7EEC496ed9e9283b2edEedE34CB0d",
    EthaxAddress: "0x854F7Cd3677737241E3eED0dC3d7F33DFAF72Bc4",
    Ethax_Busd_LP: "0xEbCD635a395e2ecE39A7583fe8b6792DD79f02cA",
    Ethax_Bnb_LP: "0x1915ddEb50db91a50Ae9afad343fa75512fbf220",
    WBNB: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"



  };
}

export default key;