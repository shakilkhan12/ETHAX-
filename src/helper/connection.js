import Web3 from "web3";
import config from "../config/config";
import Web3Modal from "web3modal";

import { providerOptions } from "../config/providerOptions"

import store from '../store';

const web3Modal = new Web3Modal({
  providerOptions, // required,
  cacheProvider: true, // optional
});

export async function connection() {
  var currentProvider = store.getState()

  var connect = {
    web3: "",
    address: "",
    network: 0,
    provider: "",
  };

  var provider = (currentProvider && currentProvider.web3Reucer &&
    currentProvider.web3Reucer.provider
    && currentProvider.web3Reucer.provider !== "") ? currentProvider.web3Reucer.provider : "";

  var isConnected = "no"
  var WEB3_CONNECT_CACHED_PROVIDER = localStorage.getItem("WEB3_CONNECT_CACHED_PROVIDER")

  var WEB3_CONNECT_CACHED_PROVIDER22 = localStorage.getItem("wagmi.wallet")
  if (WEB3_CONNECT_CACHED_PROVIDER22) {
    var connnector = JSON.parse(WEB3_CONNECT_CACHED_PROVIDER22)
    if (connnector === "walletConnect") {
      isConnected = "yes";
    }

    if ( provider && provider !== "" && connnector === "walletConnect") {
      provider = currentProvider.web3Reucer.provider
     

      //var provider = await web3Modal.connect();
      var web3 = new Web3(provider);
      if (typeof web3 !== "undefined") {

        var network = await web3.eth.net.getId();
        var result = await web3.eth.getAccounts();

        var currAddr = result[0];
        
        var bnbBalance = await web3.eth.getBalance(currAddr);
        bnbBalance = bnbBalance / 10 ** 18

        if (currAddr === undefined) currAddr = "";
        if (network === config.NetworkId) {
          connect.network = network;
          connect.web3 = web3;
          connect.address = currAddr;
          connect.provider = provider;
  
        }
        else if (network !== config.NetworkId) {
          connect.web3 = "";
          connect.address = "";
          connect.network = 0;
          connect.provider = "";
        }
        else {
          return connect;
        }

      }
    }
    return connect;

  }
  else if (WEB3_CONNECT_CACHED_PROVIDER) {
    var connnector = JSON.parse(WEB3_CONNECT_CACHED_PROVIDER)
    if (connnector === "injected" 
      || connnector === "binancechainwallet" || connnector === "walletlink") {
      isConnected = "yes";
    }
  }


  if ((connnector === "injected" 
  || connnector === "binancechainwallet" || connnector === "walletlink") && provider === "" && isConnected && web3Modal.cachedProvider) {
    provider = await web3Modal.connect();
  }

  if (provider && provider !== "" && (connnector === "injected" || connnector === "binancechainwallet"
  || connnector === "walletlink")) {
    //var provider = await web3Modal.connect();
    var web3 = new Web3(provider);
    if (typeof web3 !== "undefined") {

      var network = await web3.eth.net.getId();
      var result = await web3.eth.getAccounts();

      var currAddr = result[0];
      
      if (currAddr === undefined) currAddr = "";
      if (network === config.NetworkId) {
        connect.network = network;
        connect.web3 = web3;
        connect.address = currAddr;
        connect.provider = provider;
      }
    }
  }

  return connect;
}