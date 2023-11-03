import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
// core components
import GridContainer from "../components/Grid/GridContainer.js";
import GridItem from "../components/Grid/GridItem.js";
import { Button } from "@material-ui/core";
import Header from "../components/Header/Header.js";
import HeaderDashboard from "../components/Header/HeaderDashboard.js";

import $ from "jquery";
import ReactLoading from "react-loading";

// Datatable
import WalletModal from "../components/WalletModal";

import { toastAlert } from "../helper/toastAlert";
import FooterHome from "../components/Footer/FooterHome.js";
import {
  fetchPoolsDetails,
  approvetoken,
  stakePool,
  unstake,
  getreward,
  harverst,
  getStakeUnstakeBalance,
  harverstpool,
} from "../ContractActions/MasterChefAction";

import { toFixedWithoutRound, numberFloatOnly } from "../helper/custommath";

import { Tooltip as ReactTooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import config from "../config/config";
import { isEmpty } from "lodash";
import poolsTokenlists from "./Tokenlists/poolsTokenlists.json";
import RoiCalculatorModal from "./RoiCalculatorModall/RoicalculatorModal";
import { fetchPoolsPublicDataAsync } from "./HomeCalculation/topPools.js";
import SlippageModal from "../components/SlippageModal.js";

const dashboardRoutes = [];

// Scroll to Top
function ScrollToTopOnMount() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return null;
}
var poolrewardinterval;
export default function Pools(props) {
  const { t, i18n } = useTranslation();
  const { ...rest } = props;
  const [poolDetails, setpoolDetails] = useState([]);
  const [allPoolDetails, setallPoolDetails] = useState([]);
  const [amount, setamount] = useState(0);
  const [lpBal, setLpbal] = useState(0);
  const [curpid, setcurpid] = useState(0);
  const [curLPAddress, setcurLPAddress] = useState(0);
  const [stakeBal, setstakeBal] = useState(0);
  const [showloader, setshowloader] = useState(false);
  const [currentId, setcurrentId] = useState("");
  const [isLoad, setisLoad] = useState(false);
  const [pageLimit, setpageLimit] = useState(6);
  const [pageSkip, setpageSkip] = useState(1);
  const [poolStatus, setpoolStatus] = useState("Live");
  const [loadmorebutton, setLoadmorebutton] = useState(false);
  const [loader, setloader] = useState(false);
  const [earndamt, setearneddamt] = useState();
  const [confirmLoader, setconfirmLoader] = useState(false);
  const [Harvestmodee, setHarvestmode] = useState('COMPOUND')
  const [tokenDollar, settokenDollarValue] = useState(0)
  const [slippageValue, setslippageValue] = useState(0.5);
  const [singleHopOnly, setsingleHopOnly] = useState(false);
  const [transdeadline, settransdeadline] = useState(5);
  const theme = useSelector((state) => state.theme);
  const [searchdata, setsearchdata] = useState({
    text: "",
    filter: "",
    stake: "",
    status: "Live",
  });

  const web3Reducer = useSelector((state) => state.web3Reucer);

  async function approveToken(lpAddress, curpid) {
    setshowloader(true);
    setcurrentId(curpid);
    var allDetails = await approvetoken(lpAddress);
    setshowloader(false);
    setcurrentId("");
    if (allDetails.status) {
      toastAlert("success", "Token Approved Successfully", "balance");
      var index = poolDetails.findIndex((val) => val.LPaddress === lpAddress);
      var index1 = allPoolDetails.findIndex(
        (val) => val.LPaddress === lpAddress
      );
      var approveAmt =
        allDetails && allDetails.approveAmt
          ? parseFloat(allDetails.approveAmt)
          : 0;
      setisLoad(false);
      if (index != -1) {
        poolDetails[index].allowance = approveAmt;
        setpoolDetails(poolDetails);
      }
      if (index1 != -1) {
        allPoolDetails[index1].allowance = approveAmt;
        setallPoolDetails(allPoolDetails);
      }
      setisLoad(true);
    } else {
      toastAlert("error", "Unable Approve token", "balance");
    }
  }

  async function stakeToken() {
    if (amount > lpBal) {
      toastAlert("error", "Insufficient Balance", "balance");
      return false;
    }

    if (
      parseFloat(amount) <= 0 ||
      !amount ||
      amount === "" ||
      amount === 0 ||
      amount === "0"
    ) {
      toastAlert("error", "Invalid Amount", "balance");
      return false;
    }
    window.$("#stake_modal1").modal("hide");

    setshowloader(true);
    setcurrentId(curpid);
    var allDetails = await stakePool(curpid, amount, curLPAddress, lpBal);

    updateDetails(curpid);
    setshowloader(false);
    if (allDetails.status) {
      setamount("");
      toastAlert("success", "Staked Successfully", "balance");
    } else {
      toastAlert("error", "Unable to stake", "balance");
      setamount("");
    }
    setcurrentId("");
  }

  async function unstakeToken() {
    if (
      parseFloat(amount) <= 0 ||
      !amount ||
      amount === "" ||
      amount === 0 ||
      amount === "0"
    ) {
      toastAlert("error", "Invalid Amount", "balance");
      return false;
    }

    if (parseFloat(amount) > parseFloat(stakeBal)) {
      toastAlert("error", "Insufficient Balance", "balance");
      return false;
    }

    window.$("#stake_modal").modal("hide");

    setshowloader(true);
    setcurrentId(curpid);
    var allDetails = await unstake(amount, curpid, stakeBal);

    updateDetails(curpid);
    setshowloader(false);
    if (allDetails.status) {
      setamount("");
      toastAlert("success", "Unstaked Successfully", "balance");
    } else {
      toastAlert("error", "Unable to unstake", "balance");
      setamount("");
    }
    setcurrentId("");
  }

  async function setharvestToken(pid, earned) {
    setcurrentId(pid);
    setearneddamt(earned)
  }

  const confirmHarvest = async (values) => {
    setshowloader(true);
    setconfirmLoader(true);
    if (values == 'HARVEST') {
      window.$("#harvest_modal").modal("hide");
      var allDetails = await harverstpool(currentId, 'harvest');
      setshowloader(false);
      setconfirmLoader(false);
      if (allDetails.status) {
        toastAlert("success", "'Your earnings have been sent to your wallet!");
      } else {
        toastAlert("error", "Transaction Rejected");
      }
    }
    else {
      window.$("#harvest_modal").modal("hide");
      var allDetails = await harverstpool(currentId, 'compound');
      setshowloader(false);
      setconfirmLoader(false);
      if (allDetails.status) {
        toastAlert("success", "Earnings have been re-invested into the pool!");
      } else {
        toastAlert("error", "Transaction Rejected");
      }
    }

  }
  async function harvestToken(pid) {
    setshowloader(true);
    setcurrentId(pid);
    var allDetails = await harverst(pid);

    setshowloader(false);
    if (allDetails.status) {
      toastAlert("success", "Reward withdraw Successfully", "balance");
    } else {
      toastAlert("error", "Unable to withdraw reward", "balance");
    }
    setcurrentId("");
  }

  async function updateDetails(pid) {
    try {
      var index = allPoolDetails.findIndex(
        (val) => parseInt(val.pid) == parseInt(pid)
      );
      if (index != -1) {
        var lpAddr = allPoolDetails[index].LPaddress;
        // console.log(lpAddr)
        var { stakeBal, lpBal, totalSupply } = await getStakeUnstakeBalance(
          pid,
          lpAddr
        );
        $("#startearn-" + pid).html(stakeBal);
        $("#totalLiq-" + pid).html(totalSupply);
      }
    } catch (err) { }
  }

  async function setLpBalance(bal, pid, lpAddr, stakeBal) {
    setcurpid(pid);
    setcurLPAddress(lpAddr);

    var { stakeBal, lpBal } = await getStakeUnstakeBalance(pid, lpAddr);
    setstakeBal(stakeBal);
    setLpbal(lpBal);
  }

  async function setMax(lpBal) {
    setamount(lpBal);
  }

  async function setValue(e) {
    var value = e.target.value;
    var status = await numberFloatOnly(value);
    if (status) {
      setamount(value);
    }
  }
  useEffect(() => {
    loadScript();
    // getallpooldetails()
    // fetchingPoolearnings()
    getPoolDetails(pageSkip, pageLimit, poolStatus);
  }, [web3Reducer]);

  // async function getallpooldetails(){
  //   const gettokens = poolsTokenlists && poolsTokenlists.tokens;
  //   setLoadmorebutton(true)
  //   setpoolDetails(gettokens);
  //   setallPoolDetails(gettokens);
  //   rewardDetails(gettokens);
  //   console.log('gettokennnnnnnnnnnnnnnnnnns: ', gettokens);
  //   setisLoad(true);
  //   setloader(false)
  // }

  async function getPoolDetails() {
    setLoadmorebutton(false);
    var data = {
      skip: pageSkip,
      limit: pageLimit,
      status: poolStatus,
    };
    var allDetails = await fetchPoolsDetails(data);

    if (
      (poolDetails && poolDetails && poolDetails.length) ==
      (allDetails && allDetails.count)
    ) {
      setLoadmorebutton(true);
    }
    if (
      (allDetails && allDetails.value && allDetails.value.length) <
      parseInt(config.limit)
    ) {
      setLoadmorebutton(true);
    }
    if (
      allDetails &&
      allDetails.value &&
      allDetails.value.length > 0 &&
      Array.isArray(allDetails.value)
    ) {
      setpoolDetails(allDetails.value);
      setallPoolDetails(allDetails.value);
      rewardDetails(allDetails.value);
    }
    setisLoad(true);
    setloader(false);
  }

  async function rewardDetails(details) {

    // const earningTokenDollarBalance = getBalanceNumber(earnings.multipliedBy(earningTokenPrice), earningToken.decimals)



    var Details = details;
    clearInterval(poolrewardinterval);
    poolrewardinterval = setInterval(async function () {
      try {
        const data = await fetchPoolsPublicDataAsync();
        var earningToken = data[0] && data[0].earningTokenPrice;
        earningToken = parseFloat(earningToken);

        var rewardAmt = 0;
        var rewardDollarPrice = 0;
        var rewards = await getreward(details);
        //console.log(rewards, 'rewardsrewardsrewardsrewards')
        for (var i = 0; i < rewards.value.length; i++) {
          if (rewards.value && rewards.value[i]) {
            var pid = rewards.value[i].pid;
            var index = Details.findIndex((val) => val.pid === pid);
            if (index !== -1) {
              rewardAmt = await toFixedWithoutRound(
                rewards.value[i].bal / 1e18,
                6
              );

              Details[index].earned = rewardAmt;
              rewardDollarPrice = rewards.value[i].bal;
              rewardDollarPrice = parseFloat(rewardDollarPrice)

              var earntokendollar = (rewardDollarPrice * earningToken) / 1e18

              Details[index].earnedDollarValue = earntokendollar;
              settokenDollarValue(earntokendollar)
            }
            // $("#earneddollar-" + pid).html(earntokendollar);
            $("#earned-" + pid).html(rewardAmt);
            $(".list-" + pid).html(rewardAmt);
            $(".Earned-" + pid).val(rewardAmt);
            setearneddamt(rewardAmt)
          }
        }
        // setallPoolDetails(Details);
        // setpoolDetails(Details);
      } catch (err) { }
    }, 3000);
  }

  async function stakeonlyFilter(e) {
    var checked = e.target.checked;
    var isStake = "no";
    if (checked) {
      isStake = "yes";
    }
    var fildata = { ...searchdata, ...{ stake: isStake } };
    setsearchdata(fildata);
    applyFilter(fildata);
  }

  const searchFarm = async (event) => {
    var fildata = { ...searchdata, ...{ text: event.target.value } };
    setsearchdata(fildata);
    applyFilter(fildata);
  };

  async function sortBy(event) {
    var fildata = { ...searchdata, ...{ sort: event.target.value } };
    setsearchdata(fildata);
    applyFilter(fildata);
  }

  async function Pagenation() {
    setloader(true);
    let data = {
      skip: parseFloat(pageSkip) + 1,
      limit: parseFloat(pageLimit),
      status: poolStatus,
    };
    var allDetails = await fetchPoolsDetails(data);
    if (
      (allDetails && allDetails.value && allDetails.value.length) <
      parseInt(config.limit)
    ) {
      setLoadmorebutton(true);
    }
    if (
      allDetails &&
      allDetails.value &&
      allDetails.value.length > 0 &&
      Array.isArray(allDetails.value)
    ) {
      setallPoolDetails(allPoolDetails.concat(allDetails.value));
      setpoolDetails(poolDetails.concat(allDetails.value));
      rewardDetails(allDetails.value);
    }
    setpageSkip(parseFloat(pageSkip) + 1);
    setpageLimit(parseFloat(pageLimit));
    setisLoad(true);
  }

  async function applyFilter(data) {
    var filteredData = allPoolDetails;
    if (data && data.text && data.text !== "") {
      filteredData = filteredData.filter((pools) =>
        pools.lpSymbol.toLowerCase().includes(data.text.toLowerCase())
      );
    }
    if (data && data.status && data.status !== "") {
      filteredData = filteredData.filter(pools => pools.status === data.status);
    }
    if (data && data.stake && data.stake === "yes") {
      filteredData = filteredData.filter((data) => data.stakeBal > 0);
    }

    if (data.sort === "apr") {
      filteredData.sort(function (a, b) {
        return parseFloat(b.apr) - parseFloat(a.apr);
      });
    } else if (data.sort === "earned") {
      filteredData.sort(function (a, b) {
        return parseFloat(b.earned) - parseFloat(a.earned);
      });
    } else if (data.sort === "totalstaked") {
      filteredData.sort(function (a, b) {
        return parseFloat(b.TotalSupply) - parseFloat(a.TotalSupply);
      });
    }

    setTimeout(
      function () {
        setpoolDetails(filteredData);
      }.bind(this),
      100
    );
  }

  async function activeRecord(status) {
    var fildata = { ...searchdata, ...{ status: status } };
    setsearchdata(fildata);
    applyFilter(fildata);
  }

  function loadScript() {
    $(".grid_view_btn").click(function () {
      $(".grid_view").show();
      $(".list_view").hide();
      $(this).addClass("active");
      $(".list_view_btn").removeClass("active");
    });

    $(".list_view_btn").click(function () {
      $(".grid_view").hide();
      $(".list_view").show();
      $(this).addClass("active");
      $(".grid_view_btn").removeClass("active");
    });
  }
  function clearAmount() {
    setamount("");
  }

  const Harvestmode = (value) => {
    setHarvestmode(value)
  }

  const closeHarvestModal = () => {
    setHarvestmode("COMPOUND")
  }

  async function AddToken(symbol, lpaddress) {

    const tokenAddress = lpaddress;
    const tokenSymbol = symbol;
    // const tokenDecimals = tokenInfo.decimals;
    const tokenDecimals = 18;

    const tokenImage = "../assets/images/logo_icon.png";

    try {

      var ethereum = window.ethereum;
      const wasAdded = await ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: tokenAddress,
            symbol: tokenSymbol,
            decimals: tokenDecimals,
            //image: tokenImage,
          },
        },
      });

      if (wasAdded) {
        console.log('Thanks for your interest!');
      } else {
        console.log('Your loss!');
      }
    } catch (error) {
      console.log('erororororrror: ', error);
      console.log(error);
    }

  }
  function childSettingClick(value) {
    if (value && value.settings) {
        setslippageValue(value.settings);
    }
    if (value && value.deadline) {
        settransdeadline(value.deadline);
    }

    if (value && value.ismultiHops) {
        var isHops = (value.ismultiHops === "true") ? true : false
        setsingleHopOnly(isHops);
    }
}
  return (
    <div className="page_wrapper page_inner_wrapper">
      <Header
        className="header"
        color="transparent"
        routes={dashboardRoutes}
        brand={
          theme && theme.value === "dark" ? (
            <img src={require("../assets/images/logo.png")} alt="logo" />
          ) : (
            <img src={require("../assets/images/logo.png")} alt="logo" />
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
          <div className="container">
            <div className="inner_heading_wrapper pool_heading_wrap">
              <GridContainer>
                <GridItem md={12} data-aos="fade-up" data-aos-duration="2000">
                  <div className="inner_banner main-banner pool-bnr">
                    <div className="inner_banner_content">
                      <div className="inner_title_top">
                        <h1>{t("POOLS")}</h1>
                      </div>
                      {/* <p>{t("STAKE_EARN_ONE80")}</p> */}
                      <p>STAKE YOUR TOKENS TO EARN ETHAX TOKEN REWARDS</p>
                      <p>CURRENT STAKING APR OFFER 29.2%</p>
                    </div>
                  </div>
                </GridItem>
              </GridContainer>
            </div>
          </div>
          <div className="inner_content_wrapper">
            <div className="container">
              <GridContainer>
                <GridItem lg={12}>
                  <div
                    className="pools_filter"
                    data-aos="fade-up"
                    data-aos-duration="2000"
                  >
                    <div className="pools_filter_left">
                      <div className="custom-control custom-checkbox">
                        <input
                          type="checkbox"
                          className="custom-control-input"
                          id="customCheck1"
                          onClick={stakeonlyFilter}
                        />
                        <label
                          className="custom-control-label"
                          for="customCheck1"
                        >
                          {t("STAKED_ONLY")}
                        </label>
                      </div>
                      <div className="pool_btn_grp">
                        <Button
                          onClick={() => activeRecord("Live")}
                          className={
                            searchdata.status === "Live" ? "active" : ""
                          }
                        >
                          {t("LIVE")}
                        </Button>
                        <Button
                          onClick={() => activeRecord("Finished")}
                          className={
                            searchdata.status === "Finished" ? "active" : ""
                          }
                        >
                          {t("FINISHED")}
                        </Button>
                      </div>
                    </div>

                    <div className="pools_filter_right">
                      <div className="inp_grp">
                        <input
                          className="pool_search"
                          placeholder={t("SEARCH_POOLS")}
                          onChange={searchFarm}
                        />
                        <img
                          src={require("../assets/images/search_icon.png")}
                          alt="Icon"
                          className="search_icon"
                        />
                      </div>
                      <select className="custom-select" onChange={sortBy}>
                        <option selected disabled>
                          {/* {t("SORT_BY")} */}
                          Hot
                        </option>
                        <option value="earned">{t("EARNED")}</option>
                        {/* <option value="totalstaked">
                          {t("TOTAL_STAKED_S")}
                        </option> */}
                         <option value="totalstaked">
                          Liquidity
                        </option>
                      </select>
                      {/* <div className="view_btn_grp">
                        <Button className="list_view_btn" onClick={() => { disableLoader(); }}>
                          <i className="bi bi-list-ul"></i>
                        </Button>
                        <Button className="grid_view_btn active" onClick={() => { disableLoader(); }}>
                          <i className="bi bi-grid"></i>
                        </Button>
                      </div> */}
                    </div>
                  </div>
                  <div className="grid_view">
                    <GridContainer>
                      {isLoad &&
                        poolDetails &&
                        poolDetails.length > 0 &&
                        poolDetails.map((poolDet) => {
                          return (
                            <GridItem lg={4} md={6} sm={12}>
                              <div
                                className="grid_view_single py-0 pools-box"
                                data-aos="fade-up"
                                data-aos-duration="2000"
                              >
                                <div className="grid_view_single_first">
                                  <div>
                                    <h2>{poolDet.lpSymbol}</h2>
                                  </div>
                                  <img
                                    // src={poolDet.logoURI}
                                    src={require("../assets/images/logo_icon.png")}
                                    alt="Icon"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = config.defaultLogo;
                                    }}
                                  />
                                </div>

                                <div className="grid_view_single_second pt-4">
                                  <div className="d-flex align-items-center justify-content-between mb-sm-3 mb-2">
                                    <p>{t("APY")}</p>
                                    <div className="d-flex align-items-center">
                                      <p>{poolDet.apy}%</p>
                                    </div>
                                  </div>
                                  <div className="d-flex align-items-center justify-content-between mb-sm-3 mb-2">
                                    <p>ROI Calculator</p>
                                    <div className="d-flex align-items-center">
                                      <a
                                        href="javascript:void(0)"
                                        data-toggle="modal"
                                        data-target="#CalcModal"
                                      >
                                        <i class="fas fa-calculator"></i>
                                      </a>
                                    </div>
                                  </div>
                                  <div className="d-flex align-items-center justify-content-between mb-sm-3 mb-2">
                                    <div>
                                      <p>{t("EARNED")}</p>
                                      <h4 id={"earned-" + poolDet.pid}>
                                        {poolDet.earned}
                                      </h4>
                                    </div>
                                    {web3Reducer && web3Reducer.address !== "" && (
                                      <Button
                                        className="harvest_btn"
                                        data-toggle="modal"
                                        data-target="#harvest_modal"
                                        onClick={() => {
                                          // harvestToken(poolDet.pid);
                                          setharvestToken(poolDet.pid, poolDet.earned);
                                        }}
                                      >
                                        {t("HARVEST")}
                                      </Button>
                                    )}
                                  </div>
                                  {/* <div className="d-flex align-items-center justify-content-between">
                                    <p>{t("DEPOSIT_FEE")}</p>
                                    <h4>{poolDet.depositFee}%</h4>
                                  </div> */}

                                  <div className="d-flex align-items-center justify-content-between  mb-3">
                                    <div>
                                      <p>{t("ONE80_EARNED")}</p>
                                      <p id={"startearn-" + poolDet.pid}>
                                        {poolDet.stakeBal}
                                      </p>
                                    </div>
                                    {parseFloat(poolDet.stakeBal) > 0 ||
                                      parseInt(poolDet.allowance) !== 0 ? (
                                      <div className="stake_btn_grps">
                                        <Button
                                          data-toggle="modal"
                                          data-target="#stake_modal"
                                          onClick={() => {
                                            setLpBalance(
                                              poolDet.LPBalance,
                                              poolDet.pid,
                                              poolDet.LPaddress,
                                              poolDet.stakeBal
                                            );
                                          }}
                                        >
                                          -
                                        </Button>
                                        <Button
                                          data-toggle="modal"
                                          data-target="#stake_modal1"
                                          onClick={() => {
                                            setLpBalance(
                                              poolDet.LPBalance,
                                              poolDet.pid,
                                              poolDet.LPaddress,
                                              poolDet.stakeBal
                                            );
                                          }}
                                        >
                                          +
                                        </Button>
                                      </div>
                                    ) : (
                                      <div></div>
                                    )}
                                  </div>
                                  {web3Reducer && web3Reducer.address === "" ? (
                                    <Button
                                      data-toggle="modal"
                                      data-target="#wallet_modal"
                                      className="primary_btn blue_btn"
                                    >
                                      {t("UNLOCK_WALLET")}
                                    </Button>
                                  ) : parseInt(poolDet.allowance) === 0 &&
                                    parseFloat(poolDet.stakeBal) <= 0 ? (
                                    <Button
                                      className="primary_btn blue_btn"
                                      onClick={() => {
                                        approveToken(
                                          poolDet.LPaddress,
                                          poolDet.pid
                                        );
                                      }}
                                    >
                                      {t("APPROVE")}
                                    </Button>
                                  ) : (
                                    ""
                                  )}
                                  {showloader && currentId === poolDet.pid && (
                                    <div className="d-flex align-items-center justify-content-center loaderimage">
                                      <ReactLoading
                                        type={"bars"}
                                        color="#009ee1"
                                        className="loading"
                                      />
                                    </div>
                                  )}
                                </div>
                                <hr />
                                <div className="grid_view_single_third">
                                  <div className="d-flex align-items-center justify-content-between pt-2 pb-4">
                                    <div className="manual-left">
                                      <div className="manual-badge">
                                        <svg
                                          viewBox="0 0 24 24"
                                          width="18px"
                                          color="secondary"
                                          xmlns="http://www.w3.org/2000/svg"
                                          class="sc-bdnxRM eHGmKK"
                                        >
                                          <path d="M17.65 6.35C16.02 4.72 13.71 3.78 11.17 4.04C7.50002 4.41 4.48002 7.39 4.07002 11.06C3.52002 15.91 7.27002 20 12 20C15.19 20 17.93 18.13 19.21 15.44C19.53 14.77 19.05 14 18.31 14C17.94 14 17.59 14.2 17.43 14.53C16.3 16.96 13.59 18.5 10.63 17.84C8.41002 17.35 6.62002 15.54 6.15002 13.32C5.31002 9.44 8.26002 6 12 6C13.66 6 15.14 6.69 16.22 7.78L14.71 9.29C14.08 9.92 14.52 11 15.41 11H19C19.55 11 20 10.55 20 10V6.41C20 5.52 18.92 5.07 18.29 5.7L17.65 6.35Z"></path>
                                        </svg>
                                        Manual
                                      </div>
                                      <span
                                        data-tooltip-id="my-tooltip-3"
                                        className="ml-2"
                                      >
                                        <i class="far fa-question-circle"></i>
                                      </span>
                                      <ReactTooltip
                                        id="my-tooltip-3"
                                        place="bottom"
                                        variant="info"
                                        content={
                                          <div className="tooltipCard">
                                            <p>
                                              You must harvest and compound your
                                              earnings from this pool manually.
                                            </p>
                                          </div>
                                        }
                                      />
                                    </div>
                                    <a
                                      className="accordian_link pool-details-link collapsed"
                                      data-toggle="collapse"
                                      href={"#collapseExample-" + poolDet.pid}
                                      role="button"
                                      aria-expanded="false"
                                      aria-controls="collapseExample"
                                    >
                                      {t("DETAILS")}
                                    </a>
                                  </div>
                                  <div
                                    className="collapse"
                                    id={"collapseExample-" + poolDet.pid}
                                  >
                                    <div>
                                      <div className="d-flex justify-content-between align-items-center">
                                        <h3>{t("STAKE")}</h3>
                                        <h4>{poolDet.lpSymbol}</h4>
                                      </div>
                                      <div className="d-flex justify-content-between align-items-center">
                                        <h3>{t("TOTAL_STAKE")}</h3>
                                        <h4 id={"totalLiq-" + poolDet.pid}>
                                          {poolDet.TotalSupply}
                                        </h4>
                                      </div>
                                      <div className="d-flex justify-content-between align-items-start pb-3">
                                        <div className="text-right">
                                          <a
                                            href={
                                              config.txUrlAddress +
                                              poolDet.LPaddress
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                          >
                                            {t("VIEW_ETHERSCAN")}
                                            <i className="bi bi-box-arrow-up-right"></i>
                                          </a>
                                        </div>
                                        <button className="addToMetamaskButton" onClick={() => AddToken(poolDet.lpSymbol, poolDet.LPaddress)}>
                                          <span>Add to Metamask</span>
                                          <svg
                                            viewBox="0 0 40 40"
                                            color="text"
                                            width="20px"
                                            xmlns="http://www.w3.org/2000/svg"
                                            class="sc-bdnxRM jVwVpn"
                                          >
                                            <path
                                              d="M36.0112 3.33337L22.1207 13.6277L24.7012 7.56091L36.0112 3.33337Z"
                                              fill="#E17726"
                                            ></path>
                                            <path
                                              d="M4.00261 3.33337L17.7558 13.7238L15.2989 7.56091L4.00261 3.33337Z"
                                              fill="#E27625"
                                            ></path>
                                            <path
                                              d="M31.0149 27.2023L27.3227 32.8573L35.2287 35.0397L37.4797 27.3258L31.0149 27.2023Z"
                                              fill="#E27625"
                                            ></path>
                                            <path
                                              d="M2.53386 27.3258L4.77116 35.0397L12.6772 32.8573L8.9987 27.2023L2.53386 27.3258Z"
                                              fill="#E27625"
                                            ></path>
                                            <path
                                              d="M12.2518 17.6496L10.0419 20.9712L17.8793 21.3281L17.6048 12.8867L12.2518 17.6496Z"
                                              fill="#E27625"
                                            ></path>
                                            <path
                                              d="M27.762 17.6494L22.3129 12.7905L22.1207 21.3279L29.9581 20.9711L27.762 17.6494Z"
                                              fill="#E27625"
                                            ></path>
                                            <path
                                              d="M12.6772 32.8574L17.3989 30.5652L13.336 27.3809L12.6772 32.8574Z"
                                              fill="#E27625"
                                            ></path>
                                            <path
                                              d="M22.6009 30.5652L27.3226 32.8574L26.6637 27.3809L22.6009 30.5652Z"
                                              fill="#E27625"
                                            ></path>
                                            <path
                                              d="M27.3226 32.8575L22.6009 30.5653L22.9715 33.6399L22.9303 34.9301L27.3226 32.8575Z"
                                              fill="#D5BFB2"
                                            ></path>
                                            <path
                                              d="M12.6772 32.8575L17.0694 34.9301L17.042 33.6399L17.3989 30.5653L12.6772 32.8575Z"
                                              fill="#D5BFB2"
                                            ></path>
                                            <path
                                              d="M17.1518 25.3495L13.2262 24.1965L15.9988 22.92L17.1518 25.3495Z"
                                              fill="#233447"
                                            ></path>
                                            <path
                                              d="M22.848 25.3495L24.001 22.92L26.801 24.1965L22.848 25.3495Z"
                                              fill="#233447"
                                            ></path>
                                            <path
                                              d="M12.6773 32.8573L13.3635 27.2023L8.99876 27.3258L12.6773 32.8573Z"
                                              fill="#CC6228"
                                            ></path>
                                            <path
                                              d="M26.6364 27.2023L27.3227 32.8573L31.0149 27.3258L26.6364 27.2023Z"
                                              fill="#CC6228"
                                            ></path>
                                            <path
                                              d="M29.9581 20.9709L22.1207 21.3278L22.8482 25.3495L24.0011 22.92L26.8012 24.1965L29.9581 20.9709Z"
                                              fill="#CC6228"
                                            ></path>
                                            <path
                                              d="M13.2263 24.1965L15.9989 22.92L17.1519 25.3495L17.8793 21.3278L10.0419 20.9709L13.2263 24.1965Z"
                                              fill="#CC6228"
                                            ></path>
                                            <path
                                              d="M10.0419 20.9709L13.3361 27.3809L13.2263 24.1965L10.0419 20.9709Z"
                                              fill="#E27525"
                                            ></path>
                                            <path
                                              d="M26.8011 24.1965L26.6638 27.3809L29.958 20.9709L26.8011 24.1965Z"
                                              fill="#E27525"
                                            ></path>
                                            <path
                                              d="M17.8793 21.3278L17.1519 25.3494L18.0715 30.0985L18.2637 23.8396L17.8793 21.3278Z"
                                              fill="#E27525"
                                            ></path>
                                            <path
                                              d="M22.1205 21.3278L21.7499 23.8258L21.9283 30.0985L22.848 25.3494L22.1205 21.3278Z"
                                              fill="#E27525"
                                            ></path>
                                            <path
                                              d="M22.848 25.3496L21.9284 30.0987L22.601 30.5654L26.6638 27.381L26.8011 24.1967L22.848 25.3496Z"
                                              fill="#F5841F"
                                            ></path>
                                            <path
                                              d="M13.2262 24.1967L13.336 27.381L17.3989 30.5654L18.0714 30.0987L17.1518 25.3496L13.2262 24.1967Z"
                                              fill="#F5841F"
                                            ></path>
                                            <path
                                              d="M22.9303 34.93L22.9715 33.6398L22.6284 33.3378H17.3714L17.042 33.6398L17.0694 34.93L12.6772 32.8574L14.2145 34.1202L17.3302 36.2751H22.6696L25.7853 34.1202L27.3226 32.8574L22.9303 34.93Z"
                                              fill="#C0AC9D"
                                            ></path>
                                            <path
                                              d="M22.601 30.5653L21.9284 30.0986H18.0715L17.3989 30.5653L17.0421 33.6399L17.3715 33.3379H22.6285L22.9716 33.6399L22.601 30.5653Z"
                                              fill="#161616"
                                            ></path>
                                            <path
                                              d="M36.5875 14.3003L37.7542 8.61779L36.011 3.33337L22.6009 13.2846L27.7618 17.6493L35.0365 19.7768L36.6424 17.8964L35.9424 17.3886L37.0679 16.3728L36.2169 15.7003L37.3287 14.863L36.5875 14.3003Z"
                                              fill="#763E1A"
                                            ></path>
                                            <path
                                              d="M2.24573 8.61779L3.42615 14.3003L2.67123 14.863L3.78302 15.7003L2.93202 16.3728L4.05753 17.3886L3.35752 17.8964L4.96343 19.7768L12.2518 17.6493L17.399 13.2846L4.00263 3.33337L2.24573 8.61779Z"
                                              fill="#763E1A"
                                            ></path>
                                            <path
                                              d="M35.0365 19.777L27.7619 17.6495L29.958 20.9712L26.6638 27.3811L31.0149 27.3262H37.4797L35.0365 19.777Z"
                                              fill="#F5841F"
                                            ></path>
                                            <path
                                              d="M12.2517 17.6495L4.96332 19.777L2.53386 27.3262H8.99869L13.336 27.3811L10.0419 20.9712L12.2517 17.6495Z"
                                              fill="#F5841F"
                                            ></path>
                                            <path
                                              d="M22.1205 21.3276L22.6009 13.2843L24.701 7.56067H15.2988L17.3988 13.2843L17.8792 21.3276L18.0577 23.8531L18.0714 30.0984H21.9283L21.9421 23.8531L22.1205 21.3276Z"
                                              fill="#F5841F"
                                            ></path>
                                          </svg>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </GridItem>
                          );
                        })}
                    </GridContainer>
                    {isLoad &&
                      poolDetails &&
                      poolDetails.length > 0 &&
                      loadmorebutton === false && (
                        <GridItem
                          md={12}
                          sm={12}
                          data-aos="fade-up"
                          data-aos-duration="2000"
                        >
                          {" "}
                          {/* <div className="text-center">
                            {" "}
                            <Button
                              className="home_primary_btn home_primary_btn_no_hover mx-auto"
                              onClick={Pagenation}
                              disabled={loader ? "disabled" : ""}
                            >
                              {loader && (
                                <i
                                  className="fa fa-spinner"
                                  aria-hidden="true"
                                  id="circle1"
                                ></i>
                              )}{" "}
                              {t("LOAD_MORE")}
                            </Button>
                          </div> */}
                        </GridItem>
                      )}
                    {isLoad && poolDetails && poolDetails.length === 0 && (
                      <GridItem
                        md={12}
                        sm={12}
                        data-aos="fade-up"
                        data-aos-duration="2000"
                      >
                        <div className="grid_view_single_second">
                          <p className="text-center pt-5">{t("NO_POOLS")}</p>
                        </div>
                      </GridItem>
                    )}
                    {!isLoad && (
                      <GridItem
                        md={12}
                        sm={12}
                        data-aos="fade-up"
                        data-aos-duration="2000"
                      >
                        <div className="grid_view_single_second">
                          <p className="text-center pt-5">{t("LOADING")}</p>
                        </div>
                      </GridItem>
                    )}
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

      {/*  Calculator Modal */}
      <RoiCalculatorModal
        from='POOLS'
      />
      {/* <div
        className="modal fade primary_modal"
        id="CalcModal"
        data-backdrop="static"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="CalcModal"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">ROI Calculator</h3>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body pool-calc p-0">
              <div className="popup-space">
                <div className="form-group mb-1">
                  <label>Ethax Staked</label>
                  <div className="group-input">
                    <div className="group-input-field">
                      <div class="input-group">
                        <input
                          type="text"
                          class="form-control"
                          placeholder="0.00"
                        />
                        <div class="input-group-append">
                          <span class="input-group-text" id="basic-addon2">
                            USD
                          </span>
                        </div>
                      </div>
                      <div className="input-field-alternate">
                        0.00 <span>ETHAX</span>
                      </div>
                    </div>
                    <div className="field-change-icon">
                      <span className="rotate-icon">
                        <i class="fas fa-exchange-alt"></i>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex-button mb-3">
                  <button className="btn btn-sm">$100</button>
                  <button className="btn btn-sm">$1000</button>
                  <button className="btn btn-sm">My Balance</button>
                </div>
                <div className="form-group">
                  <label>Staked for</label>
                  <div
                    class="btn-group mr-2"
                    role="group"
                    aria-label="First group"
                  >
                    <button type="button" class="btn btn-secondary">
                      1D
                    </button>
                    <button type="button" class="btn btn-secondary">
                      7D
                    </button>
                    <button type="button" class="btn btn-secondary active">
                      30D
                    </button>
                    <button type="button" class="btn btn-secondary">
                      1Y
                    </button>
                    <button type="button" class="btn btn-secondary">
                      5Y
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label>Compounding Every</label>
                  <div className="check-btngroup">
                    <input type="checkbox" className="mr-2" />
                    <div
                      class="btn-group mr-2"
                      role="group"
                      aria-label="First group"
                    >
                      <button type="button" class="btn btn-secondary">
                        1D
                      </button>
                      <button type="button" class="btn btn-secondary">
                        7D
                      </button>
                      <button type="button" class="btn btn-secondary active">
                        14D
                      </button>
                      <button type="button" class="btn btn-secondary">
                        30D
                      </button>
                    </div>
                  </div>
                </div>
                <div className="form-group text-center">
                  <i class="fas fa-arrow-down"></i>
                </div>
                <div className="form-group">
                  <div className="edit-input-group">
                    <div className="edit-input-group-content">
                      <div className="edit-input-group-inner-box">
                        <div className="edit-input-group-content-flex">
                          <h2>
                            <span className="d-block">
                              ROI at current rates
                            </span>
                            $0.00<small>~ 0 ETHAX (0%)</small>
                          </h2>
                          <div className="editIcon">
                            <i class="fas fa-pencil-alt"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="popup-footer-collapse">
                <a
                  class="collapse-link d-block text-center collapsed"
                  data-toggle="collapse"
                  href="#collapseExample"
                  role="button"
                  aria-expanded="false"
                  aria-controls="collapseExample"
                >
                  Details
                </a>
                <div class="collapse" id="collapseExample">
                  <div class="card card-body my-0 p-0">
                    <ul className="flex-list">
                      <li>
                        <label>APR</label>
                        <span>29.20%</span>
                      </li>
                      <li>
                        <label>APY (1x daily compound)</label>
                        <span>33.89%</span>
                      </li>
                    </ul>
                    <ul className="full-list">
                      <li>Calculated based on current rates.</li>
                      <li>
                        All figures are estimates provided for your convenience
                        only, and by no means represent guaranteed returns.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> */}


      {/*  */}
      {/*  Harvest Modal */}
      <div
        className="modal fade primary_modal"
        id="harvest_modal"
        data-backdrop="static"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="harvest_modal"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Harvest ETHAX</h3>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
                onClick={closeHarvestModal}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body text-center">
              <div className="tabFlexItem">
                <nav className="popupTabs">
                  <div
                    class="nav nav-tabs nav-fill"
                    id="nav-tab"
                    role="tablist"
                  >
                    <a
                      class={Harvestmodee == "COMPOUND" ? "nav-item nav-link active" : "nav-item nav-link"}
                      id="nav-compund-tab"
                      data-toggle="tab"
                      href="#nav-compund"
                      role="tab"
                      aria-controls="nav-compund"
                      aria-selected={Harvestmodee == "COMPOUND" ? "true" : "false"}
                      onClick={() => Harvestmode('COMPOUND')}
                    >
                      Compound
                    </a>
                    <a
                      class={Harvestmodee == "HARVEST" ? "nav-item nav-link active" : "nav-item nav-link"}
                      id="nav-harvest-tab"
                      data-toggle="tab"
                      href="#nav-harvest"
                      role="tab"
                      aria-controls="nav-harvest"
                      aria-selected={Harvestmodee == "HARVEST" ? "true" : "false"}
                      onClick={() => Harvestmode('HARVEST')}
                    >
                      Harvest
                    </a>
                  </div>
                </nav>
                <div className="helpDiv">
                  <span data-tooltip-id="my-tooltip-2">
                    <i class="far fa-question-circle"></i>
                  </span>
                  <ReactTooltip
                    id="my-tooltip-2"
                    place="bottom"
                    variant="info"
                    content={
                      <div className="tooltipCard">
                        <p>Compound: collect and restake ETHAX into pool.</p>
                        <p>Harvest: collect ETHAX and send to wallet</p>
                      </div>
                    }
                  />
                </div>
              </div>
              <div class="tab-content py-3 px-3 px-sm-0" id="nav-tabContent">
                <div
                  // class="tab-pane fade show active"
                  class={Harvestmodee == "COMPOUND" ? "tab-pane fade show active" : "tab-pane fade"}
                  id="nav-compund"
                  role="tabpanel"
                  aria-labelledby="nav-compund-tab"
                >
                  <div className="harvest-details">
                    <div className="harvest-label">Compounding:</div>
                    <div className="harevest-amount">
                      {earndamt} ETHAX <small className="d-block">~{tokenDollar.toFixed(6)} USD</small>
                    </div>
                  </div>
                  <button className="primary_btn blue_btn d-block my-3" onClick={() => confirmHarvest(Harvestmodee)} disabled={confirmLoader == true}>
                    Confirm
                  </button>
                  <a
                    href="#"
                    className="d-block"
                    data-dismiss="modal"
                    aria-label="Close"
                  >
                    Close Window
                  </a>
                </div>
                <div
                  // class="tab-pane fade"
                  class={Harvestmodee == "HARVEST" ? "tab-pane fade show active" : "tab-pane fade"}
                  id="nav-harvest"
                  role="tabpanel"
                  aria-labelledby="nav-harvest-tab"
                >
                  <div className="harvest-details">
                    <div className="harvest-label">Harvesting:</div>
                    <div className="harevest-amount">
                      {earndamt} ETHAX <small className="d-block">~{tokenDollar.toFixed(6)} USD</small>
                    </div>
                  </div>
                  <button className="primary_btn blue_btn d-block my-3" onClick={() => confirmHarvest(Harvestmodee)} disabled={confirmLoader == true}>
                    Confirm
                  </button>
                  <a
                    href="#"
                    className="d-block"
                    data-dismiss="modal"
                    aria-label="Close"
                  >
                    Close Window
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <SlippageModal
        onChildClick={childSettingClick}
      />
      {/*  Success Modal */}
      <div
        className="modal fade primary_modal"
        id="success_modal"
        data-backdrop="static"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="success_modal"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body text-center">
              <img
                src={require("../assets/images/success_modal.png")}
                alt="thumb"
                className="img-fluid"
              />
              <h2>{t("SUCCESS_COMPLETE")}</h2>
              <p>{t("READABLE_CONTENT")}</p>
              <Button className="auth_btn blue_btn" data-dismiss="modal">
                {t("CLOSE")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/*  Stake Modal */}
      <div
        className="modal fade primary_modal"
        id="stake_modal"
        data-backdrop="static"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="stake_modal"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="stake_modal">
                {t("UNSTAKE_TOKENS")}
              </h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
                onClick={() => {
                  clearAmount();
                }}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="input_panel">
                <div className="d-flex justify-content-between align-items-center">
                  <label className="balance">
                    {t("BAL")} {stakeBal}{" "}
                  </label>
                </div>
                <div className="d-flex justify-content-between align-items-center home_inp_panel">
                  <input
                    type="text"
                    placeholder="0.0"
                    className="custom_inp"
                    onChange={setValue}
                    value={amount}
                  ></input>
                  <Button
                    className="harvest_btn"
                    onClick={() => {
                      setMax(stakeBal);
                    }}
                  >
                    {t("MAX")}
                  </Button>
                </div>
              </div>

              <div className="mt-3 d-flex justify-content-between align-items-center">
                <Button
                  data-dismiss="modal"
                  className="primary_btn blue_btn mr-3"
                  onClick={() => {
                    clearAmount();
                  }}
                >
                  {t("CANCEL")}
                </Button>
                <Button
                  onClick={() => {
                    unstakeToken();
                  }}
                  className="primary_btn blue_btn"
                >
                  {t("CONFIRM")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade primary_modal"
        id="stake_modal1"
        data-backdrop="static"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="stake_modal1"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="stake_modal1">
                {t("STAKE_TOKENS")}
              </h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
                onClick={() => {
                  clearAmount();
                }}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="input_panel">
                <div className="d-flex justify-content-between align-items-center">
                  <label className="balance">
                    {t("BAL")}{" "}
                    {lpBal && parseFloat(lpBal) > 0 ? lpBal.toFixed(6) : 0}{" "}
                  </label>
                </div>
                <div className="d-flex justify-content-between align-items-center home_inp_panel">
                  <input
                    type="text"
                    placeholder="0.0"
                    className="custom_inp"
                    onChange={setValue}
                    value={amount}
                  ></input>
                  <Button
                    className="harvest_btn"
                    onClick={() => {
                      setMax(lpBal);
                    }}
                  >
                    {t("MAX")}
                  </Button>
                </div>
              </div>

              <div className="mt-3 d-flex justify-content-between align-items-center">
                <Button
                  data-dismiss="modal"
                  className="primary_btn blue_btn mr-3"
                  onClick={() => {
                    clearAmount();
                  }}
                >
                  {t("CANCEL")}
                </Button>
                <Button
                  onClick={() => {
                    stakeToken();
                  }}
                  className="primary_btn blue_btn"
                >
                  {t("CONFIRM")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
