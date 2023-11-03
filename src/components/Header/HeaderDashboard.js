/*eslint-disable*/
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import styles from "../../assets/jss/material-kit-react/components/headerLinksStyle.js";
import { useTranslation } from "react-i18next";
import { Hidden, Button } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { setWeb3, setTheme } from "../../ContractActions/Actions";
import { connection } from "../../helper/connection";
import { divideDecimal, formatAddress } from "../../helper/custommath";
import config from "../../config/config";
import { NavLink } from "react-router-dom";
import { getbalance } from "../../ContractActions/bep20Actions";
import SlippageModal from "../../components/SlippageModal";
import { providerOptions } from "../../config/providerOptions";
import Web3Modal from "web3modal";
// import axios from "axios";
import {
  PublicClient,
  WalletClient,
  useWalletClient,
  useAccount,
  usePublicClient,
  useDisconnect,
  useNetwork,
  useSwitchNetwork,
} from "wagmi";
import { useEthersSigner, walletClientToSigner } from "../ethersconnect.js";
import Web3 from "web3";
import { getBusdTokenPricee, transactionFunction } from "../../ContractActions/MasterChefAction.js";
import { toastAlert } from "../../helper/toastAlert.js";
import MasterChef from '../../ABI/MasterChef.json'
import { isEmpty } from "lodash";

const useStyles = makeStyles(styles);
let arr = [
  { value: "en", label: "English" },
  { value: "sv", label: "svenska" },
  { value: "sw", label: "Kiswahili" },
  { value: "tr", label: "Türkçe" },
  { value: "uk", label: "Український" },
  { value: "vi", label: "Tiếng Việt" },
  { value: "zhCNT", label: "简体中文" },
  { value: "zhTWT", label: "繁体中文" },
  { value: "es", label: "Español" },
  { value: "fi", label: "suomi" },
  { value: "fr", label: "français" },
  { value: "iw", label: "עִברִית" },
  { value: "hu", label: "Magyar" },
  { value: "ms", label: "bahasa Indonesia" },
  { value: "it", label: "Italiano" },
  { value: "ja", label: "日本語" },
  { value: "ko", label: "한국어" },
  { value: "nl", label: "Nederlands" },
  { value: "no", label: "norsk" },
  { value: "pl", label: "Polskie" },
  { value: "pt", label: "português" },
  { value: "ro", label: "Română" },
  { value: "ru", label: "русский" },
  { value: "sr", label: "Српски" },
  { value: "af", label: "Afrikaans" },
  { value: "ar", label: "العربية" },
  { value: "ca", label: "Català" },
  { value: "cs", label: "čeština" },
  { value: "da", label: "dansk" },
  { value: "de", label: "Deutsch" },
  { value: "el", label: "ελληνικά" },
];
export default function HeaderDashboard(props) {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  const getConnection = useSelector((state) => state.walletConnection);
  const web3Reducer = useSelector((state) => state.web3Reucer);
  const location = useLocation();
  const [price, setprice] = useState(0);

  const [balance, setbalance] = React.useState("");
  const [webloader, setwebloader] = React.useState(0);
  const [showaddress, setshowaddress] = React.useState("");
  const [tokenbalance, settokenbalance] = React.useState("0");
  const [Transctiondetails, setTransctiondetails] = useState([])
  const [modaltype, setmodaltype] = useState()
  const [lang, setLang] = React.useState("en");
  const theme = useSelector((state) => state.theme);
  const { disconnect, isSuccess, status } = useDisconnect();
  const { chain } = useNetwork();
  let chainId = config.NetworkId;
  const { data: walletClient } = useWalletClient({ chainId });
  const network = useSwitchNetwork();





  // function childSettingClick(value) {
  //   if (value && value.settings) {
  //     setslippageValue(value.settings);
  //   }
  //   if (value && value.deadline) {
  //     //settransdeadline(value.deadline);
  //   }
  // }


  useAccount({
    onDisconnect: () => {
      localStorage.clear();
      // console.log('Disconnected')
      dispatch(
        setWeb3({
          network: web3Reducer.network,
          web3: "",
          address: "",
          provider: "",
          connect: "no",
        })
      );
    },
  });
  useEffect(() => {
    if (isSuccess == true) {
      setTimeout(() => {
        localStorage.clear();
        window.location.reload(false);
      }, 500);
    }
  }, [isSuccess]);

  useEffect(() => {
    if (chain && chain.id !== config.NetworkId) {
      dispatch(
        setWeb3({
          network: "",
          web3: "",
          address: "",
          provider: "",
          connect: "",
          isChange: "true",
        })
      );
    } else {
      dispatch(
        setWeb3({
          network: chainId,
          web3: web3Reducer.web3,
          address: web3Reducer.address,
          provider: web3Reducer.provider,
          connect: "yes",
          isChange: "false",
        })
      );
      // window.location.reload(false)
    }
  }, [walletClient, chain?.network]);

  useEffect(() => {
    getuserBalance();
    getTransactiondetails()
  }, [web3Reducer, getConnection, walletClient]);

  useEffect(() => {
    try {
      window.ethereum.on("accountsChanged", async function (accounts) {
        localStorage.setItem("bgtyjsuihf", accounts[0]);
        var get = await connection();
        dispatch(setWeb3(get));
        if (webloader === 0) {
          setwebloader(1);
        }
      });
    } catch (err) {
      console.log("error in accounts changed: ", err.message);
    }

    try {
      window.ethereum.on("networkChanged", async function (networkId) {
        var get = await connection();
        dispatch(setWeb3(get));
      });
    } catch (err) {
      console.log("error in network changed: ", err.message);
    }
  }, []);

  React.useEffect(() => {
    changeLanguageFunction();
  }, []);

  const changeLanguageFunction = () => {
    let getLang = localStorage.getItem("code");
    if (!getLang) {
      localStorage.setItem("code", "en");
      setLang(localStorage.getItem("code"));
      i18n.changeLanguage(lang);
    } else {
      setLang(getLang);
      i18n.changeLanguage(getLang);
    }
  };
  async function selectlanguage(language) {
    // let language = event.target.value;
    localStorage.setItem("code", language);
    i18n.changeLanguage(language);
  }


  async function getTransactiondetails() {
    if (web3Reducer && web3Reducer.web3 && web3Reducer.address && web3Reducer.address !== "") {

      let data = await transactionFunction(web3Reducer.address, setTransctiondetails)



      // let datas = localStorage.getItem(web3Reducer.address)


      // // console.log('datasdatasdatasdatatatatatttttttt: ', datas);
      // let getdatas = JSON.parse(datas)
      // console.log('getdatasgetdatasgetdatasgetdatas: ', getdatas);
      // if (!isEmpty(getdatas)) {
      //   if (getdatas && getdatas.length > 10) {
      //     const existingEntries = JSON.parse(localStorage.getItem(web3Reducer.address));
      //     existingEntries.splice(0, 1);
      //     localStorage.setItem(web3Reducer.address, JSON.stringify(existingEntries));
      //     setTransctiondetails(getdatas)
      //   }
      //   // let removedata = getdatas.splice(0, 1);
      //   // let removedata = localStorage.removeItem(getdatas[0])
      //   // console.log('removedddata: ', removedata);
      //   // setTransctiondetails(getdatas)
      //   else {
      //     setTransctiondetails(getdatas)
      //   }
      // }
      // else {
      //   setTransctiondetails([])
      // }
    }
  }





  async function getuserBalance() {
    // if (chain && chain.id != config.NetworkId ) {
    //   toastAlert("error", "please select Ethereum on your wallet", 'err')
    //   setTimeout(function () {
    //     disconnect()
    //   }, 1000);
    // }
    if (
      web3Reducer &&
      web3Reducer.web3 &&
      web3Reducer.address &&
      web3Reducer.address !== ""
    ) {
      var web3 = web3Reducer.web3;
      var getBalance = await web3.eth.getBalance(web3Reducer.address);
      var bal = await divideDecimal(getBalance, 18);
      setbalance(bal);

      var tokenBal = await getbalance(config.EthaxAddress, "ethax");
      tokenBal =
        tokenBal && tokenBal.balance
          ? parseFloat(tokenBal.balance).toFixed(3)
          : 0;
      settokenbalance(tokenBal);

      var address = await formatAddress(web3Reducer.address);
      setshowaddress(address);
    }
  }

  async function setConnection() {
    var WEB3_CONNECT_CACHED_PROVIDER = localStorage.getItem(
      "WEB3_CONNECT_CACHED_PROVIDER"
    );
    if (WEB3_CONNECT_CACHED_PROVIDER) {
      var connnector = JSON.parse(WEB3_CONNECT_CACHED_PROVIDER);
      if (
        connnector == "injected" ||
        connnector == "binancechainwallet" ||
        // connnector == "walletconnect" ||
        connnector == "walletlink"
      ) {
        var get = await connection();
        dispatch(setWeb3(get));
      }
    } else if (walletClient && chain && chain.id == config.NetworkId) {
      var { signer, transport } = walletClientToSigner(walletClient);
      var web3 = new Web3(transport);

      dispatch(
        setWeb3({
          network: config.NetworkId,
          web3: web3,
          address: walletClient.account.address,
          provider: transport,
          connect: "yes",
          isChange: "false",
        })
      );
      var get = await connection();
    }
  }
  useEffect(() => {
    setConnection();
    getBusdPricee();
  }, [web3Reducer.network, walletClient]);

  useEffect(() => {
    loadScript();
  }, []);

  const getBusdPricee = async () => {
    var { busdprice } = await getBusdTokenPricee();
    setprice(busdprice);
  };

  const setThemeFunction = () => {
    localStorage.setItem("setuserTheme", theme.value);
  };

  function loadScript() {
    $(".theme_button").off("click");
    let gettheme = localStorage.getItem("setuserTheme");

    if (gettheme == "dark" || !gettheme) {
      $("body").addClass("dark_theme");
      $(".theme_button i").toggleClass("d-none");
    }

    $(".theme_button").on("click", function () {
      $("body").toggleClass("dark_theme");
      $(".theme_button i").toggleClass("d-none");
      var className = $("body").attr("class");

      let position = className.search("dark_theme");
      var data = {
        value: position > 0 ? "dark" : "white",
      };
      dispatch(setTheme(data));
    });
  }

  const disconnectWeb3Wallet = async () => {
    try {
      const web3Modal = new Web3Modal({
        providerOptions, // required,
        cacheProvider: false, // optional
      });

      dispatch(
        setWeb3({
          network: "",
          web3: "",
          address: "",
          provider: "",
        })
      );
      localStorage.clear();

      var cookies = document.cookie.split(";");

      for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }

      await web3Modal.clearCachedProvider();

      setTimeout(function () {
        window.location.reload(false);
      }, 800);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (web3Reducer && web3Reducer.provider?.on) {
      const handleAccountsChanged = (accounts) => {
        //setAccounts(accounts);
        // console.log("accounts-accounts", accounts);
        dispatch(
          setWeb3({
            network: web3Reducer.network,
            web3: web3Reducer.web3,
            address: accounts[0],
            provider: web3Reducer.provider,
          })
        );
      };

      const handleChainChanged = (chainId) => {
        // setChainId(chainId);
        // console.log("chainId-chainId", chainId);
        dispatch(
          setWeb3({
            network: chainId,
            web3: web3Reducer.web3,
            address: web3Reducer.address,
            provider: web3Reducer.provider,
          })
        );
      };

      web3Reducer.provider.on("accountsChanged", handleAccountsChanged);
      web3Reducer.provider.on("chainChanged", handleChainChanged);
      web3Reducer.provider.on("disconnect", disconnectWeb3Wallet);

      return () => {
        if (web3Reducer.provider.removeListener) {
          web3Reducer.provider.removeListener(
            "accountsChanged",
            handleAccountsChanged
          );
          web3Reducer.provider.removeListener(
            "chainChanged",
            handleChainChanged
          );
          web3Reducer.provider.removeListener(
            "disconnect",
            disconnectWeb3Wallet
          );
        }
      };
    }
  }, [web3Reducer]);

  const copyToClipboard = async (textToCopy) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      toastAlert('success', 'Copied Successfully!')
    } catch (error) {
      console.error('Unable to copy to clipboard:', error);
    }
  };

  async function settypeoffunction(type) {
    setmodaltype(type)
  }
  const classes = useStyles();
  return (
    <div className="dash_menu">
      <Hidden lgUp>
        <List className={classes.list + " main_navbar"}>
          <ListItem className={classes.listItem}>
            <a href="exchange" color="transparent" className={classes.navLink}>
              {t("EXCHANGE")}
            </a>
          </ListItem>
          {/* <ListItem className={classes.listItem}>
            <a href="/liquidity" color="transparent" className={classes.navLink}>{t("LIQUIDITY")}</a>
          </ListItem> */}
          <ListItem className={classes.listItem}>
            <a href="/farms" color="transparent" className={classes.navLink}>
              {t("FARMS")}
            </a>
          </ListItem>
          <ListItem className={classes.listItem}>
            <a href="/pools" color="transparent" className={classes.navLink}>
              {t("POOLS")}
            </a>
          </ListItem>
          {/* <ListItem className={classes.listItem}>
            <a href="https://ethax.com/buy-ethax/" color="transparent" className={classes.navLink} target="_blank">
              {t("Buy Ethax")}
            </a>
          </ListItem> */}
          {/* <ListItem className={classes.listItem}>
            <Link to="why" spy={true} smooth={true} offset={-100} duration={250} color="transparent" className={classes.navLink}>Features</Link>
          </ListItem>

          <ListItem className={classes.listItem}>
            <Link to="product" spy={true} smooth={true} offset={-100} duration={250} color="transparent" className={classes.navLink}>Product & Services</Link>
          </ListItem>

          <ListItem className={classes.listItem}>
            <Link to="token" spy={true} smooth={true} offset={-100} duration={250} color="transparent" className={classes.navLink}>Token Details</Link>
          </ListItem>

          <ListItem className={classes.listItem}>
            <Link to="roadmap" spy={true} smooth={true} offset={-100} duration={250} color="transparent" className={classes.navLink}>Road Map</Link>
          </ListItem> */}

          {/* <ListItem className={classes.listItem + " menu_dropdown"}>
            <CustomDropdown
              noLiPadding
              buttonText="Contract"
              dropdownList={[
                <a href="https://github.com/" target="_blank" className={classes.dropdownLink}>
                  GitHub
                </a>,
                <a href="https://bscscan.com/" target="_blank" className={classes.dropdownLink}>
                  BscScan
                </a>,
                <a href="https://etherscan.io/tokens" target="_blank" className={classes.dropdownLink}>
                  Token Tracker
                </a>,
              ]}
            />
          </ListItem> */}

          {/* <ListItem className={classes.listItem}>
            <Link to="contact" spy={true} smooth={true} offset={-100} duration={250} color="transparent" className={classes.navLink}>Contact Us</Link>
          </ListItem> */}

          {/* <ListItem className={classes.listItem}>
            <Button className="primary_btn"><Link to="/buy" color="transparent" className="nav-link p-0">Launch App</Link></Button>
          </ListItem> */}
        </List>
      </Hidden>
      <List className="dash_right_menu">
        <ListItem className={classes.listItem}>
          <a
            href="https://ethax.com/buy-ethax/"
            color="transparent"
            className="buy_btn"
            rel="noopener noreferrer"
            target="_blank"
          >
            Buy ETHAX{" "}
            <svg
              viewBox="0 0 24 24"
              color="#000"
              width="20px"
              xmlns="http://www.w3.org/2000/svg"
              class="sc-bdnxRM folqZJ"
            >
              <path d="M5 13H16.17L11.29 17.88C10.9 18.27 10.9 18.91 11.29 19.3C11.68 19.69 12.31 19.69 12.7 19.3L19.29 12.71C19.68 12.32 19.68 11.69 19.29 11.3L12.71 4.7C12.32 4.31 11.69 4.31 11.3 4.7C10.91 5.09 10.91 5.72 11.3 6.11L16.17 11H5C4.45 11 4 11.45 4 12C4 12.55 4.45 13 5 13Z"></path>
            </svg>
          </a>
        </ListItem>
        <ListItem className={classes.listItem}>
          {/* <Button className="home_primary_btn home_primary_btn_no_hover mr-2">{tokenbalance} {t("ONE80")}</Button> */}
          <Button className="price_btn">
            <img
              src={require("../../assets/images/logo_icon.png")}
              width="22px"
              alt="User"
              className="img-fluid"
            />
            &nbsp;&nbsp;${price && parseFloat(price).toFixed(3)}{" "}
          </Button>
        </ListItem>
        {/*Multi Language */}
        <ListItem className={classes.listItem}>
          <div class="dropdown lang-drop-down">
            <a
              class="lang_button"
              href="#"
              role="button"
              id="dropdownMenuLink"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              <i class="fas fa-globe"></i>
            </a>

            <div
              class="dropdown-menu dropdown-menu-right"
              aria-labelledby="dropdownMenuLink"
            >
              {arr &&
                arr.length > 0 &&
                arr.map((item, index) => {
                  return (
                    <a
                      class="dropdown-item"
                      href="#"
                      onClick={() => selectlanguage(item.value)}
                    >
                      {/* {item.value} */}
                      {item.label}
                    </a>
                  );
                })}
            </div>
          </div>
        </ListItem>
        <ListItem className={classes.listItem}>
          <a
            class="lang_button"
            href="#settings_modal"
            role="button"
            data-toggle="modal"
          >
            <i class="fas fa-cog"></i>
          </a>
        </ListItem>
        <ListItem className={classes.listItem}>
          <a
            href="javascript:void(0)"
            className="theme_button"
            onClick={setThemeFunction}
          >
            <i className={theme && theme.value === "dark" ? "d-none" : ""}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            </i>
            <i className={theme && theme.value === "dark" ? "" : "d-none"}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            </i>
          </a>
        </ListItem>
        {/* <ListItem className={classes.listItem}>
          <label className="network_type mr-2">Ethereum</label>
        </ListItem> */}

        {web3Reducer &&
          web3Reducer.address &&
          web3Reducer.address !== "" &&
          web3Reducer.network == config.NetworkId ? (
          <ListItem className={classes.listItem + " dropdown"}>
            <div className="wallet_address_btn">
              {/* <span>{balance} ETH</span> */}
              <Button
                id="dropdownMenuButton"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                <span>{showaddress}</span>
                <img
                  src={require("../../assets/images/user_icon.png")}
                  alt="User"
                  className="img-fluid"
                />
              </Button>
              <div
                className="dropdown-menu"
                aria-labelledby="dropdownMenuButton"
              >
                <a
                  href="#wallet_Popup_modal"
                  className="dropdown-item"
                  data-toggle="modal"
                  onClick={() => settypeoffunction('Wallet')}
                >
                  Wallet
                </a>
                <a
                  href="#wallet_Popup_modal"
                  className="dropdown-item"
                  data-toggle="modal"
                  onClick={() => settypeoffunction('Transaction')}
                >
                  Transactions
                </a>
                <Button
                  className="dropdown-item disconnect_btn"
                  onClick={() => disconnectWeb3Wallet()}
                >
                  {t("DISCONNECT_WALLET")}
                  <i class="fas fa-sign-out-alt ml-3"></i>
                </Button>
              </div>
            </div>
          </ListItem>
        ) : (
          <ListItem className={classes.listItem}>
            <Button
              className="home_primary_btn"
              data-toggle="modal"
              data-target="#wallet_modal"
            >
              {t("CONNECT_WALLET")}
            </Button>
          </ListItem>
        )}

        {/* {web3Reducer && web3Reducer.address && web3Reducer.address !== "" && web3Reducer.network == config.NetworkId &&
          <ListItem className={classes.listItem}>
            <Button className="home_primary_btn" onClick={() => disconnectWeb3Wallet()}>DisConnect Wallet</Button>
          </ListItem>
        } */}

        {/* <ListItem className={classes.listItem}>
          <div className="wallet_address_btn">
            <span>0 ETH</span>
            <Button>
              <span>0x75Cf...9586</span>
              <img src={require("../../assets/images/user_icon.png")} alt="User" className="img-fluid" />
            </Button>
          </div>
        </ListItem> */}
      </List>
      {/* <SlippageModal 
      onChildClick={childSettingClick} 
      /> */}
      {/*  wallet_Popup_modal */}

      {
        web3Reducer &&
        web3Reducer.address &&
        web3Reducer.address !== "" && web3Reducer.network !== "" &&

        <div
          className="modal fade primary_modal"
          id="wallet_Popup_modal"
          data-backdrop="static"
          tabIndex="-1"
          role="dialog"
          aria-labelledby="wallet_Popup_modal"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title">Your Wallet</h3>
                <button
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">

                <nav className="popupTabs w-100">
                  <div
                    class="nav nav-tabs nav-fill"
                    id="nav-tab"
                    role="tablist"
                  >
                    <a
                      // class="nav-item nav-link active"
                      class={modaltype == 'Wallet' ? "nav-item nav-link active" : "nav-item nav-link"}
                      id="nav-wallet-tab"
                      data-toggle="tab"
                      href="#nav-wallet"
                      role="tab"
                      aria-controls="nav-wallet"
                      aria-selected="true"
                    >
                      Wallet
                    </a>
                    <a
                      // class="nav-item nav-link"
                      class={modaltype == 'Transaction' ? "nav-item nav-link active" : "nav-item nav-link"}
                      id="nav-transactions-tab"
                      data-toggle="tab"
                      href="#nav-transactions"
                      role="tab"
                      aria-controls="nav-transactions"
                      aria-selected="false"
                    >
                      Transactions
                    </a>
                  </div>
                </nav>

                <div class="tab-content py-3 px-3 px-sm-0" id="nav-tabContent">
                  <div
                    // class="tab-pane walletTransactions fade show active"/////////////
                    class={modaltype == 'Wallet' ? "tab-pane walletTransactions fade show active" : "tab-pane walletTransactions fade"}

                    id="nav-wallet"
                    role="tabpanel"
                    aria-labelledby="nav-wallet-tab"
                  >
                    <div className="form-group">
                      <label>Your Address</label>
                      <div class="input-group mb-3">
                        <input
                          type="text"
                          class="form-control"
                          placeholder="Recipient's username"
                          aria-label="Recipient's username"
                          aria-describedby="basic-addon2"
                          value={web3Reducer.address}
                        />
                        <div class="input-group-append" onClick={() => copyToClipboard(web3Reducer.address)}>
                          <span class="input-group-text" id="basic-addon2">
                            <i class="far fa-copy"></i>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="form-group">
                      <div class="d-flex justify-content-between align-items-start pb-3">

                        <label>BNB Balance</label>

                        <div class="text-right">
                          <p className="wallet-mdl-bln">{balance}</p>
                          <a
                            href={config.txUrlAddress + web3Reducer.address}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View on BscScan<i class="bi bi-box-arrow-up-right"></i>
                          </a>
                        </div>

                      </div>
                    </div>
                    <button className="primary_btn blue_btn d-block my-3" onClick={() => disconnectWeb3Wallet()}>
                      Disconnect Wallet
                    </button>
                  </div>
                  <div
                    // class="tab-pane walletTransactions fade"
                    class={modaltype == 'Transaction' ? "tab-pane walletTransactions fade show active" : "tab-pane walletTransactions fade"}
                    id="nav-transactions"
                    role="tabpanel"
                    aria-labelledby="nav-transactions-tab"
                  >

                    <div className="form-group">
                      <label>Recent Transactions</label>
                      {
                        Transctiondetails && Transctiondetails.length > 0 ?
                          Transctiondetails.map((item, index) => {
                            return (
                              <p className="mb-0 text-center recent_trns">
                                <a href={config.txUrl + item.transactionHash} target="_blank">* Recent Transaction {index + 1}     <i className="bi bi-box-arrow-up-right"></i></a>
                              </p>
                            )
                          }) :
                          <p className="mb-0 text-center recent_trns">No recent transactions</p>

                      }
                      {/* <p className="mb-0 text-center">No recent transactions</p> */}
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>



      }

    </div>
  );
}
