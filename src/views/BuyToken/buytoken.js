import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
// core components
import GridContainer from "../../components/Grid/GridContainer.js";
import GridItem from "../../components/Grid/GridItem.js";
import { Button } from "@material-ui/core";
import Header from "../../components/Header/Header.js";
import HeaderDashboard from "../../components/Header/HeaderDashboard.js";
import ReactLoading from "react-loading";
import FooterHome from "../../components/Footer/FooterHome.js";

import config from "../../config/config";
import WalletModal from "../../components/WalletModal.js";
import TokenModalNew from "../../components/TokenModalTwo.js";
import Web3 from 'web3';
import IcoABI from "../../ABI/BuytokenABI.json"

import TokenABI from "../../ABI/TokenAbi.json"

import { connection } from "../../helper/connection.js";


import { addBuytokenHistory } from "../../Api/IcoAction.js"


const marks = [
  {
    value: 0,
    label: "0%",
  },
  {
    value: 25,
    label: "25%",
  },
  {
    value: 50,
    label: "50%",
  },
  {
    value: 75,
    label: "75%",
  },
  {
    value: 100,
    label: "100%",
  },
];

function valuetext(value) {
  return `${value}%`;
}

const dashboardRoutes = [];

var initialData = {
  name: "",
  symbol: "",
  address: "",
  amount: "",
  showamount: "",
  value: "",
  decimals: "",
  payamount: "",
  chainId: config.NetworkId,
};

// Scroll to Top
function ScrollToTopOnMount() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return null;
}

export default function BuyToken(props) {

  var web3 = new Web3(config.rpcurl);

  const theme = useSelector((state) => state.theme);

  const modalRef = useRef();

  const { ...rest } = props;
  const { t } = useTranslation();
  //const classes = useStyles();
  const dispatch = useDispatch();
  const pairValue = useSelector((state) => state.allowedPairs);
  const web3Reducer = useSelector((state) => state.web3Reucer);

  const [fromValue, setfromValue] = useState(initialData);
  const [toValue, settoValue] = useState(initialData);
  const [swapcurrent, setswapcurrent] = useState("");
  const [frombalance, setfrombalance] = useState({
    balance: "Loading",
    balanceOf: 0,
  });
  const [tobalance, settobalance] = useState({ balance: 0, balanceOf: 0 });
  const [isPair, setisPair] = useState(true);
  const [tokenname, settokenname] = useState(config.ETHSYMBOL);
  const [FromAmount, setFromAmount] = useState(0)
  const [ToAmount, setToAmount] = useState(0)
  const [tokenBalaceof, settokenBalaceof] = useState(0)
  const [ownTokenbalance, setownTokenbalance] = useState(0)
  const [isloading, setisloading] = useState(false)
  const [exceedAmt, setexceedAmt] = useState(true)



  useEffect(() => {
    updateTokenValue()
  }, [FromAmount, tokenname]);

  async function childTokenClick(item, currentTab) {
    
    window.$("#token_modal").modal("hide");
    settokenname(item);
  }





  //on change function to get token value of eth,usdc,dai,usdt......
  const updateTokenValue = async () => {
    var get = await connection();
    try {
      if (get && get.web3) {
        var web3 = get.web3;
        var address = get.address;
        var IcoContract = new web3.eth.Contract(
          IcoABI,
          config.icoContract
        );
        const datacalcul = (FromAmount) * 1e18
        var amt = datacalcul.toString();
        amt = convert(amt);

        var Owntoken = new web3.eth.Contract(
          TokenABI,
          config.rewardToken
        );
        var Owntoken = await Owntoken.methods.balanceOf(address).call();
        setownTokenbalance(Owntoken / 1e18)
        var useramount = await IcoContract.methods.userAmount(address).call();
        if (tokenname == config.ETHSYMBOL) {
          var balance = await web3.eth.getBalance(address);
          var tokenPrice = await IcoContract.methods.getTokenfromETH(amt).call();
        } else if (tokenname == "USDT") {
          var TokenBlanace = new web3.eth.Contract(
            TokenABI,
            config.usdToken
          );
          var balance = await TokenBlanace.methods.balanceOf(address).call();
          var tokenPrice = await IcoContract.methods.getTokenfromusd(amt).call();
        } else if (tokenname == "USDC") {
          var TokenBlanace = new web3.eth.Contract(
            TokenABI,
            config.usdcToken
          );
          var balance = await TokenBlanace.methods.balanceOf(address).call();
          var tokenPrice = await IcoContract.methods.getTokenfromUsdc(amt).call();
        } else if (tokenname == "DAI") {
          var TokenBlanace = new web3.eth.Contract(
            TokenABI,
            config.daiToken
          );
          var balance = await TokenBlanace.methods.balanceOf(address).call();
          var tokenPrice = await IcoContract.methods.getTokenfromDai(amt).call();
        }
        setToAmount(tokenPrice / 1e18)
        settokenBalaceof(balance / 1e18)
        var usdprice = await IcoContract.methods.getTokenfromusd(tokenPrice).call();
        const limitoftoken = 5000 - (useramount / 1e18)
        if (limitoftoken < (usdprice / 1e18)) {
          setexceedAmt(`You have only ${limitoftoken} Tokens to Buy`)
        } else {
          setexceedAmt(true)
        }
      }

    } catch (err) {
      console.log(err);
    }
  }


  //on sumbit function to buy token
  const BuyTokenfunction = async () => {
    var get = await connection();
    try {
      if (get && get.web3) {
        var web3 = get.web3;
        var address = get.address;
        var IcoContract = new web3.eth.Contract(
          IcoABI,
          config.icoContract
        );
        const datacalcul = (FromAmount) * 1e18
        var amt = datacalcul.toString();
        amt = convert(amt);

        var approveamt = await convert(5000 * 1e18);

        if (tokenname == config.ETHSYMBOL) {
          setisloading(true)
          await IcoContract.methods.depositETH().send({
            from: address, value: amt
          }).then(async (res) => {
            const reqdata = {
              fromaddress: address,
              currencytype: tokenname,
              fromamount: amt / 1e18,
              toamount: ToAmount,
              hash: res.transactionHash,
            }
            // const submit = await addBuytokenHistory(reqdata)
          })
        } else if (tokenname == "USDT") {
          setisloading(true)
          var TokenBlanace = new web3.eth.Contract(
            TokenABI,
            config.usdToken
          );
          var resp = await TokenBlanace.methods
            .approve(config.icoContract, approveamt.toString())
            .send({ gasLimit: 250000, from: address }).then(async (res) => {
              await IcoContract.methods.depositUSD(amt).send({
                from: address,
              }).then(async (res) => {
                const reqdata = {
                  fromaddress: address,
                  currencytype: tokenname,
                  fromamount: amt / 1e18,
                  toamount: ToAmount,
                  hash: res.transactionHash,

                }
                // const submit = await addBuytokenHistory(reqdata)
              })
            })
        } else if (tokenname == "USDC") {
          setisloading(true)

          var TokenBlanace = new web3.eth.Contract(
            TokenABI,
            config.usdcToken
          );
          var resp = await TokenBlanace.methods
            .approve(config.icoContract, approveamt.toString())
            .send({ gasLimit: 250000, from: address }).then(async (res) => {

              await IcoContract.methods.depositUsdc(amt).send({
                from: address,
              }).then(async (res) => {
                const reqdata = {
                  fromaddress: address,
                  currencytype: tokenname,
                  fromamount: amt / 1e18,
                  toamount: ToAmount,
                  hash: res.transactionHash,

                }
                // const submit = await addBuytokenHistory(reqdata)
              })
            })
        } else if (tokenname == "DAI") {
          setisloading(true)
          var TokenBlanace = new web3.eth.Contract(
            TokenABI,
            config.daiToken
          );
          var resp = await TokenBlanace.methods
            .approve(config.icoContract, approveamt.toString())
            .send({ gasLimit: 250000, from: address }).then(async (res) => {

              await IcoContract.methods.depositDai(amt).send({
                from: address,
              }).then(async (res) => {
                const reqdata = {
                  fromaddress: address,
                  currencytype: tokenname,
                  fromamount: amt / 1e18,
                  toamount: ToAmount,
                  hash: res.transactionHash,

                }
                // const submit = await addBuytokenHistory(reqdata)
              })
            })
        }
        window.location.reload()
        setisloading(false)
      }
    } catch (err) {
      setisloading(false)

    }
  }


  //convert function
  function convert(n) {
    var sign = +n < 0 ? "-" : "",
      toStr = n.toString();
    if (!/e/i.test(toStr)) {
      return n;
    }
    var [lead, decimal, pow] = n
      .toString()
      .replace(/^-/, "")
      .replace(/^([0-9]+)(e.*)/, "$1.$2")
      .split(/e|\./);
    return +pow < 0
      ? sign +
      "0." +
      "0".repeat(Math.max(Math.abs(pow) - 1 || 0, 0)) +
      lead +
      decimal
      : sign +
      lead +
      (+pow >= decimal.length
        ? decimal + "0".repeat(Math.max(+pow - decimal.length || 0, 0))
        : decimal.slice(0, +pow) + "." + decimal.slice(+pow));
  }


  const validPositive = (e) => {
    if (
      new RegExp(`^\\d*(\\.\\d{0,8})?$`).test(e.target.value) ||
      (e.target.value = "")
    ) {
      e.preventDefault();
    }
  };



  return (


    <div className="page_wrapper page_inner_wrapper">

      <Header
        className="header"
        color="transparent"
        routes={dashboardRoutes}
        brand={
          theme && theme.value === "dark" ? (
            <img
              src={require("../../assets/images/logo.png")}
              alt="logo"
            />
          ) : (
            <img src={require("../../assets/images/logo.png")} alt="logo" />
          )
        }
        rightLinks={<HeaderDashboard />}
        fixed
        changeColorOnScroll={{
          height: 100,
          color: "dark",
        }}
        {...rest}
      />
      <ScrollToTopOnMount />

      <div className="inner_wrapper">
        <div className="inner_pageheader">
          
          <div className="inner_content_wrapper">
            <div className="container">
              <GridContainer>
                <GridItem md={6} sm={12} lg={7} className="m-auto">
                  <div data-aos="fade-up" data-aos-duration="2000" className="buy_content">
                    <h2>
                      Offer A World of Decentralized Finance Opportunities.
                    </h2>
                    <p>
                      Ethax will transform the DeFi world. Our community and
                      developers are creating a financial world without borders,
                      our network and offering will reach every corner of the
                      globe.Ethax will build a world-class
                      decentralized ecosystem and develop products to meet the
                      needs of today and the future.
                    </p>
                  </div>
                </GridItem>

                <GridItem md={6} sm={12} lg={5} className="m-auto">
                  <div
                    className="exchange_div"
                    data-aos="fade-up"
                    data-aos-duration="2000"
                  >
                    <div className="whitebox swap_box">
                      <div className="trade_wrap_title d-block">
                        <center> <h2>Buy Ethax</h2>
                          <h5 className="m-0">Buy Ethax in just a few clicks</h5></center>
                      </div>
                      <div className="input_panel">
                        <div className="d-flex justify-content-between align-items-center">
                          <label>{t("FROM")}</label>
                          <label>
                            {t("BALANCE")}
                            <span>
                              {tokenBalaceof.toFixed(5)}
                            </span>
                          </label>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <input
                            type="text"
                            placeholder="0.0"
                            className="custom_inp"
                            onChange={(e) => setFromAmount(e.target.value)}
                            onInput={validPositive}
                            id="from"
                          // disabled={(!isPair) ? true : false}
                          ></input>
                          <Button
                            className="token_btn"
                            data-toggle="modal"
                            data-target="#token_modal2"
                          >
                            <img
                              src={require(`${"../../assets/images/"}` +
                                tokenname +
                                ".png")}
                              alt="Icons"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = config.defaultLogo;
                              }}
                            />
                            {tokenname} <i className="bi bi-chevron-down"></i>
                          </Button>
                        </div>

                      </div>
                      {tokenBalaceof < FromAmount ?
                        <p style={{ color: "red" }}>Insufficient Funds</p> : ""}
                      <div className="text-center mt-3 mb-3">
                        <img
                          src={require("../../assets/images/exchange_icon.png")}
                          alt="Logo"
                          className="img-fluid"
                        />
                      </div>
                      <div className="input_panel">
                        <div className="d-flex justify-content-between align-items-center">
                          <label>{t("TO")}</label>
                          <label>
                            {t("BALANCE")}
                            <span>
                              {ownTokenbalance.toFixed(5)}
                            </span>
                          </label>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <input
                            type="text"
                            placeholder="0.0"
                            className="custom_inp"
                            value={ToAmount}
                            id="to"
                            readOnly
                            disabled={!isPair ? true : false}
                          ></input>
                          <Button className="token_btn">
                            <img
                              src={require("../../assets/images/One80.png")}
                              alt="Icons"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = config.defaultLogo;
                              }}
                            />
                            Ethax
                          </Button>
                        </div>
                      </div>
                      <p style={{ color: "red" }}>{exceedAmt}</p>

                      {web3Reducer && web3Reducer.address != "" ? (
                        <div className="text-center mt-2">
                          {tokenBalaceof < FromAmount || exceedAmt != true || FromAmount == 0 || FromAmount == "." ?
                            <Button className="primary_btn blue_btn"
                              style={{ background: "#302d2d" }}
                              disabled
                            >
                              {t("ENTER_AMOUNT")}
                            </Button> : <Button className="primary_btn blue_btn" onClick={BuyTokenfunction}

                              disabled={isloading}
                            >
                              {isloading && (
                                <i
                                  class="fa fa-spinner fa-spin"
                                  aria-hidden="true"
                                  id="circle"
                                ></i>
                              )}
                              {t("submit")}
                            </Button>}
                        </div>
                      ) : (
                        <div
                          className="text-center mt-2"
                          data-toggle="modal"
                          data-target="#wallet_modal"
                        >
                          <Button className="primary_btn blue_btn">
                            {t("UNLOCK_WALLET")}
                          </Button>
                        </div>
                      )}

                      <hr />
                    </div>
                  </div>
                </GridItem>
              </GridContainer>
            </div>
          </div>
        </div>
      </div>

      <FooterHome />
      {/*  Wallet Token Modal */}
      <WalletModal />

      {/*  Select Token Modal */}
      <TokenModalNew
        fromValue={fromValue}
        swapcurrent={swapcurrent}
        onChildTokenClick={childTokenClick}
        ref={modalRef}
      />
    </div >
  );
}
