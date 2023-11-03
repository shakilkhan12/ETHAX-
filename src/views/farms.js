import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from 'react-i18next';
import { Link } from "react-router-dom";
// core components
import GridContainer from "../components/Grid/GridContainer.js";
import GridItem from "../components/Grid/GridItem.js";
import {
  Button
} from "@material-ui/core";
import Header from "../components/Header/Header.js";
import HeaderDashboard from "../components/Header/HeaderDashboard.js";
import $ from "jquery";
import ReactLoading from "react-loading";

import {
  toFixedWithoutRound,
  division,
  numberFloatOnly
} from "../helper/custommath";
// Datatable
import WalletModal from "../components/WalletModal";

import { toastAlert } from "../helper/toastAlert";
import FooterHome from "../components/Footer/FooterHome.js";
import {
  getFormsDetails,
  approvetoken,
  stake,
  unstake,
  getreward,
  harverst,
  getStakeUnstakeBalance
} from "../ContractActions/MasterChefAction";

import {
  getBalanceof
} from "../ContractActions/LPTokenActions";

import config from "../config/config";
import farmsTokenlists from "../views/Tokenlists/farmsTokenlists.json"
import RoiCalculatorModalFarms from "./RoiCalculatorModall/RoicalculatorModalFarms.js";
import SlippageModal from "../components/SlippageModal.js";

const dashboardRoutes = [];

// Scroll to Top
function ScrollToTopOnMount() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return null;
}
var rewardinterval;
export default function Farms(props) {

  const { t } = useTranslation();
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
  const [farmsStatus, setfarmsStatus] = useState("Live");
  const [loadmorebutton, setLoadmoreButton] = useState(false)
  const [loader, setloader] = useState(false)
  const [Lpsymbol, setLpsymbol] = useState('')
  const [LPAddress, setLPAddress] = useState('')
  const [pidValue, setPidValue] = useState('')
  const [slippageValue, setslippageValue] = useState(0.5);
  const [singleHopOnly, setsingleHopOnly] = useState(false);
  const [transdeadline, settransdeadline] = useState(5);
  const web3Reducer = useSelector((state) => state.web3Reucer);
  const theme = useSelector((state) => state.theme);

  const [searchdata, setsearchdata] = useState({ text: "", filter: "", stake: "", status: "Live" });

  useEffect(() => {
    loadScript();
    // getallFarmtokens();
    getFarmDetails(pageSkip, pageLimit, farmsStatus);
  }, [web3Reducer]);

  const setLpsymbolfunction = (value, lpaddresss, pid) => {
    setLpsymbol(value)
    setLPAddress(lpaddresss)
    setPidValue(pid)
  }
  // async function getallFarmtokens (){
  //   const gettokens = farmsTokenlists && farmsTokenlists.tokens;
  //   console.log('gettokensssssssssss: ', gettokens);
  //   setLoadmoreButton(true)

  //   setpoolDetails(gettokens);
  //   setallPoolDetails(gettokens);
  //   rewardDetails(gettokens);
  //   console.log('gettokennnnnnnnnnnnnnnnnnns: ', gettokens);
  //   setisLoad(true);
  //   setloader(false)
  // }

  async function approveToken(lpAddress, pid) {
    setshowloader(true);
    setcurrentId(pid);
    var allDetails = await approvetoken(lpAddress);
    setshowloader(false);
    setcurrentId("");
    if (allDetails.status) {
      toastAlert("success", "Token Approved Successfully", "balance");
      var index = poolDetails.findIndex(val => val.LPaddress === lpAddress);
      var index1 = allPoolDetails.findIndex(val => val.LPaddress === lpAddress);
      var approveAmt = (allDetails && allDetails.approveAmt) ? parseFloat(allDetails.approveAmt) : 0;
      setisLoad(false)
      if (index != -1) {
        poolDetails[index].allowance = approveAmt;
        setpoolDetails(poolDetails);
      }
      if (index1 != -1) {
        allPoolDetails[index1].allowance = approveAmt
        setallPoolDetails(allPoolDetails);
      }
      setisLoad(true)

    } else {
      toastAlert("error", "Unable Approve token", "balance");
    }
  }

  async function stakeToken() {

    if (amount > lpBal) {
      toastAlert("error", "Insufficient Balance", "balance");
      return false;
    }

    if (parseFloat(amount) <= 0 || !amount || amount === "" || amount === 0 || amount === "0") {
      toastAlert("error", "Invalid Amount", "balance");
      return false;
    }

    window.$("#stake_modal1").modal("hide");

    setcurrentId(curpid);
    setshowloader(true);

    var allDetails = await stake(curpid, amount, curLPAddress, lpBal);
    updateDetails(curpid);
    setamount("");
    setshowloader(false);
    if (allDetails.status) {
      toastAlert("success", "Staked Successfully", "balance");
    } else {
      toastAlert("error", "Unable to stake", "balance");
    }
    setcurrentId("");
  }


  async function AddToken(symbol, lpaddress) {

    const tokenAddress = lpaddress;
    const tokenSymbol = symbol;
    // const tokenDecimals = tokenInfo.decimals;
    const tokenDecimals = 18;

    const tokenImage = "../assets/images/ETHAX-BUSD.png";

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

  async function unstakeToken() {


    if (parseFloat(amount) <= 0 || !amount || amount === "" || amount === 0 || amount === "0") {
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
    setamount("");

    if (allDetails.status) {
      toastAlert("success", "Unstaked Successfully", "balance");
    } else {
      toastAlert("error", "Unable to unstake", "balance");
    }
    setcurrentId("");
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
      var index = allPoolDetails.findIndex(val => parseInt(val.pid) == parseInt(pid))
      if (index != -1) {
        var lpAddr = allPoolDetails[index].LPaddress;
        // console.log(lpAddr)
        var { stakeBal, lpBal, totalSupply } = await getStakeUnstakeBalance(pid, lpAddr);
        $("#startearn-" + pid).html(stakeBal);
        $("#totalLiq-" + pid).html(totalSupply);
      }
    } catch (err) {

    }
  }

  async function setLpBalance(bal, pid, lpAddr, stakeBal) {

    var liqutityBal = await getBalanceof("balanceOf", lpAddr);
    liqutityBal = await division(liqutityBal.value, 1e18);

    setcurpid(pid);
    setcurLPAddress(lpAddr);

    var { stakeBal, lpBal } = await getStakeUnstakeBalance(pid, lpAddr);

    // console.log(stakeBal, lpBal, 'stakeBal, lpBal>>>>>',lpAddr)
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

  async function getFarmDetails() {
    setLoadmoreButton(false)
    var data = {
      skip: pageSkip,
      limit: pageLimit,
      status: farmsStatus,
    }
    var allDetails = await getFormsDetails(data);
    // console.log('allDetailsfarmsssssssssss: ', allDetails);

    if ((allDetails && allDetails.value && allDetails.value.length) < (parseInt(config.limit))) {
      setLoadmoreButton(true)
    }
    if (allDetails && allDetails.value && allDetails.value.length > 0 && Array.isArray(allDetails.value)) {
      setpoolDetails(allDetails.value);
      setallPoolDetails(allDetails.value);
      rewardDetails(allDetails.value);
    }
    setisLoad(true);
    setloader(false)

  }
  async function rewardDetails(details) {
    // console.log(details, 'rewardDetailsrewardDetails')
    var Details = details;

    clearInterval(rewardinterval);
    rewardinterval = setInterval(async function () {
      try {
        var rewards = await getreward(details);
        //console.log(rewards, 'rewardsrewardsrewards')
        for (var i = 0; i < rewards.value.length; i++) {
          if (rewards.value && rewards.value[i]) {

            var pid = rewards.value[i].pid;
            var index = Details.findIndex(val => val.pid === pid);
            var rewardAmt = 0;
            if (index !== -1) {
              rewardAmt = await toFixedWithoutRound(rewards.value[i].bal / 1e18, 6);
              Details[index].earned = rewardAmt;
            }
            $("#" + pid).html(rewardAmt);
            $(".list-" + pid).html(rewardAmt);
            $(".listinput-" + pid).val(rewardAmt);
            if (rewardAmt > 0) {
              $("#harvestBtn-" + pid).prop("disabled", false);
              $("#harvestBtn-" + pid).removeAttr('disabled');
            }
          }
        }
        //setallPoolDetails(Details);
        //setpoolDetails(Details);
      } catch (err) {

      }

    }, 4000);

  }
  async function stakeonlyFilter(e) {
    var checked = e.target.checked;
    var isStake = "no";
    if (checked) {
      isStake = "yes";
    }
    var fildata = { ...searchdata, ...{ stake: isStake } }
    setsearchdata(fildata);
    applyFilter(fildata);
  }

  const searchFarm = async (event) => {
    var fildata = { ...searchdata, ...{ text: event.target.value } }
    setsearchdata(fildata);
    applyFilter(fildata);
  }
  async function sortBy(event) {
    var fildata = { ...searchdata, ...{ sort: event.target.value } }
    setsearchdata(fildata);
    applyFilter(fildata);
  }

  function loadScript() {
    $(".grid_view_btn").click(function () {
      $(".grid_view").show();
      $(".list_view").hide();
      $(this).addClass('active');
      $(".list_view_btn").removeClass('active');
    });

    $(".list_view_btn").click(function () {
      $(".grid_view").hide();
      $(".list_view").show();
      $(this).addClass('active');
      $(".grid_view_btn").removeClass('active');
    });
  }

  async function activeRecord(status) {
    var fildata = { ...searchdata, ...{ status: status } }
    setsearchdata(fildata);
    applyFilter(fildata);
  }
  async function Pagenation() {
    setloader(true)
    var data = {
      skip: parseInt(pageSkip) + 1,
      limit: parseInt(pageLimit),
      status: farmsStatus,
    }
    var allDetails = await getFormsDetails(data);
    if ((allDetails && allDetails.value && allDetails.value.length) < (parseInt(config.limit))) {
      setLoadmoreButton(true)
    }
    // count
    if (allDetails && allDetails.value && allDetails.value.length > 0 && Array.isArray(allDetails.value)) {
      var concatList = poolDetails.concat(allDetails.value);
      setpoolDetails(concatList)
      setallPoolDetails(concatList)
      rewardDetails(concatList);
    }
    setpageSkip(parseInt(pageSkip) + 1)
    setpageLimit(parseInt(pageLimit));
    setisLoad(true);
  }

  async function applyFilter(data) {
    var filteredData = allPoolDetails;
    // console.log(filteredData,'filteredData')
    // console.log(data,'datadatadatadatadata')

    if (data && data.text && data.text !== "") {
      filteredData = filteredData.filter(pools => pools.lpSymbol.toLowerCase().includes(data.text.toLowerCase()));
    }
    if (data && data.status && data.status !== "") {
      filteredData = filteredData.filter(pools => pools.status === data.status);
    }
    if (data && data.stake && data.stake === "yes") {
      filteredData = filteredData.filter(data => data.stakeBal > 0);
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

    setTimeout(function () {
      setpoolDetails(filteredData);
    }.bind(this), 100);
  }

  function clearAmount() {
    setamount("");
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
      <Header className="header"
        color="transparent"
        routes={dashboardRoutes}
        brand={(theme && theme.value === "dark") ? <img src={require("../assets/images/logo.png")} alt="logo" /> : <img src={require("../assets/images/logo.png")} alt="logo" />}
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

                  <div className="inner_banner main-banner farm-bnr">
                    <div className="inner_banner_content">
                      <div className="inner_title_top">
                        <h1>{t("FARMS")}</h1>
                      </div>
                      <p>{t("STAKE_ONE80")}</p>
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
                        <label className="custom-control-label" for="customCheck1">
                          {t("STAKED_ONLY")}
                        </label>
                      </div>
                      <div className="pool_btn_grp">
                        <Button onClick={() => activeRecord("Live")} className={(searchdata.status === "Live") ? "active" : ""}>{t("LIVE")}</Button>
                        <Button onClick={() => activeRecord("Finished")} className={(searchdata.status === "Finished") ? "active" : ""}>{t("FINISHED")}</Button>
                      </div>
                    </div>
                    <div className="pools_filter_right">
                      <div className="inp_grp">
                        <input
                          className="pool_search"
                          placeholder={t("SEARCH_FARMS")}
                          onChange={searchFarm}
                        />
                        <img src={require("../assets/images/search_icon.png")} alt="Icon" className="search_icon" />
                      </div>
                      <select className="custom-select" onChange={sortBy}>
                        <option selected disabled>
                          {/* {t("SORT_BY")} */}
                          Hot
                        </option>
                        <option value="earned">{t("EARNED")}</option>
                        <option value="totalstaked">
                          {/* {t("TOTAL_STAKED_S")} */}
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
                      {isLoad && poolDetails && poolDetails.length > 0 &&
                        poolDetails.map((poolDet) => {

                          return (
                            <GridItem lg={4} md={6} sm={12} id={"frms-" + poolDet.pid}>
                              <div
                                className="grid_view_single py-0 pools-box"
                                data-aos="fade-up"
                                data-aos-duration="2000"
                              >
                                <div className="grid_view_single_first">
                                  <div>
                                    <h2>
                                      <h2>{poolDet.lpSymbol}</h2>
                                    </h2>
                                  </div>
                                  <img
                                    src={poolDet.logoURI}
                                    // src={require("../assets/images/ETHAX-BNB.png")}
                                    alt="Icon"
                                    onError={(e) => { e.target.onerror = null; e.target.src = config.defaultLogo }}
                                  />
                                </div>
                                <hr />
                                <div className="grid_view_single_second pt-4">
                                  <div className="d-flex align-items-center justify-content-between mb-sm-3 mb-2">
                                    <p>{t("APY")}</p>
                                    <div className="d-flex align-items-center">
                                      <p>{poolDet.apy}%</p>
                                      {/* <img src={require("../assets/images/roi_icon.png")} alt="Icon" data-toggle="modal" onClick={() => { RoiData(poolDet); }} className="ml-2 cur_pointer" /> */}
                                    </div>


                                  </div>

                                  <div className="d-flex align-items-center justify-content-between mb-sm-3 mb-2">
                                    <p>ROI Calculator</p>
                                    <div className="d-flex align-items-center">
                                      <a
                                        href="javascript:void(0)"
                                        data-toggle="modal"
                                        data-target="#CalcModal"
                                        onClick={() => {
                                          setLpsymbolfunction(
                                            poolDet.lpSymbol,
                                            poolDet.LPaddress,
                                            poolDet.pid
                                          )
                                        }}
                                      >
                                        <i class="fas fa-calculator"></i>
                                      </a>
                                    </div>
                                  </div>

                                  <div className="d-flex align-items-center justify-content-between mb-sm-3 mb-2">
                                    <div>
                                      <p>{t("EARNED")}</p>
                                      <h4 id={poolDet.pid}>{poolDet.earned}</h4>
                                    </div>
                                    {web3Reducer &&
                                      web3Reducer.address !== "" &&
                                      <Button
                                        className="harvest_btn"
                                        id={"harvestBtn-" + poolDet.pid}
                                        onClick={() => {
                                          harvestToken(poolDet.pid);
                                        }}
                                      >
                                        {t("HARVEST")}
                                      </Button>
                                    }
                                  </div>
                                  {/* 
                                  <div className="d-flex align-items-center justify-content-between">
                                    <p>{t("DEPOSIT_FEE")}</p>
                                    <h4>{poolDet.depositFee}%</h4>
                                  </div> */}


                                  {/* <label className="mb-1">{t("START_EARNING")}</label> */}
                                  {/* <p>{t("START_EARNING")}</p> */}
                                  <p>{`${poolDet.lpSymbol}` + ' ' + 'STAKED'}</p>
                                  <div className="d-flex align-items-center justify-content-between mb-3">
                                    <p id={"startearn-" + poolDet.pid}>{poolDet.stakeBal}</p>
                                    {/* {parseInt(poolDet.allowance) !== 0 ? ( */}
                                    {(parseFloat(poolDet.stakeBal) > 0 || parseInt(poolDet.allowance) !== 0) ? (

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
                                  {web3Reducer &&
                                    web3Reducer.address === "" ? (
                                    <Button
                                      data-toggle="modal"
                                      data-target="#wallet_modal"
                                      className="primary_btn blue_btn"
                                    >
                                      {t("UNLOCK_WALLET")}
                                    </Button>
                                  ) : parseInt(poolDet.allowance) === 0 ? (
                                    <Button
                                      className="primary_btn blue_btn"
                                      onClick={() => {
                                        approveToken(poolDet.LPaddress, poolDet.pid);
                                      }}
                                    >
                                      {t("APPROVE")}
                                    </Button>

                                  ) : (
                                    ""
                                  )}
                                  {showloader && currentId === poolDet.pid &&
                                    <div className="d-flex align-items-center justify-content-center loaderimage">
                                      <ReactLoading type={"bars"} color="#009ee1" className="loading" />
                                    </div>
                                  }

                                </div>
                                <hr />
                                <div className="grid_view_single_third">
                                  <div className="d-flex align-items-center justify-content-center">
                                    {/* <div className="d-flex align-items-center">
                                      <Button className="manual_btn" onClick={() => { refreshPage(); }}>
                                        <img
                                          src={require("../assets/images/price_refresh_icon.png")}
                                          className="mr-2"
                                        />
                                        Manual
                                      </Button>
                                      <HtmlTooltip
                                        className="tooltip_content"
                                        title={
                                          <React.Fragment>
                                            <p className="tooltip_content">
                                              Your trasaction will revert if the
                                              price changes unfavourably by more
                                              than this percentage
                                            </p>
                                          </React.Fragment>
                                        }
                                      >
                                        <HelpOutline className="tooltip_icon" />
                                      </HtmlTooltip>
                                    </div> */}

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
                                  <div className="collapse" id={"collapseExample-" + poolDet.pid}>
                                    <div>
                                      <div className="d-flex justify-content-between align-items-center">
                                        <h3>{t("STAKE")}</h3>
                                        <h4>{poolDet.lpSymbol}</h4>
                                      </div>
                                      <div className="d-flex justify-content-between align-items-center">
                                        <h3>{t("TOTAL_LIQUIDITY")}</h3>
                                        <h4 id={"totalLiq-" + poolDet.pid}>{poolDet.TotalSupply}</h4>
                                      </div>
                                      <div className="d-flex justify-content-between align-items-start">
                                        <div className="text-right">

                                          <a
                                            href={config.txUrlAddress + poolDet.LPaddress}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                          >
                                            {t("VIEW_ETHERSCAN")}
                                            <i className="bi bi-box-arrow-up-right"></i>
                                          </a>


                                        </div>
                                        <button className="addToMetamaskButton" onClick={() => AddToken(poolDet.symboll, poolDet.LPaddress)}>
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

                      {/* {isLoad && poolDetails && poolDetails.length > 0 && loadmorebutton === false &&

                        <GridItem md={12} sm={12} data-aos="fade-up" data-aos-duration="2000">
                          <div className="text-center"> <Button className="home_primary_btn home_primary_btn_no_hover mx-auto" onClick={Pagenation} disabled={(loader) ? "disabled" : ""}>{loader && (
                            <i
                              className="fa fa-spinner"
                              aria-hidden="true"
                              id="circle1"
                            ></i>
                          )}{" "}{t("LOAD_MORE")}</Button></div>
                        </GridItem>} */}

                      {isLoad && poolDetails && poolDetails.length === 0 &&
                        <GridItem md={12} sm={12} data-aos="fade-up" data-aos-duration="2000">
                          <div className="grid_view_single_second">
                            <p className="text-center pt-5">{t("NO_FARMS")}</p>
                          </div>
                        </GridItem>
                      }
                      {!isLoad &&
                        <GridItem md={12} sm={12} data-aos="fade-up" data-aos-duration="2000">
                          <div className="grid_view_single_second">
                            <p className="text-center pt-5">{t("LOADING")}</p>
                          </div>
                        </GridItem>
                      }
                    </GridContainer>
                  </div>
                </GridItem>
              </GridContainer>
            </div>
          </div>
        </div>
      </div>
      <FooterHome />
      {/* <button data-toggle="modal" data-target="#success_modal">sucess</button>
      <button data-toggle="modal" data-target="#receive_modal">Receive</button>
      <button data-toggle="modal" data-target="#confirm_swap_modal">confirm swap</button> */}

      {/*  Wallet Token Modal */}
      <WalletModal />
      {/* Calculator modal */}
      <RoiCalculatorModalFarms
        Lpsymbol={Lpsymbol}
        LPAddress={LPAddress}
        PID={pidValue}
        from='FARMS'
      />
      {/*  Receive Modal */}
      <div
        className="modal fade primary_modal"
        id="receive_modal"
        data-backdrop="static"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="receive_modal"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="receive_modal">
                {t("YOU_RECEIVE")}
              </h5>
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
              <div className="swap_coin_info">
                <div>
                  <span>7,255.25</span>
                  <span>
                    {" "}
                    <img
                      src={require("../assets/images/cryptocoins/btc.svg")}
                      alt="thumb"
                      className="mr-2"
                    />{" "}
                    {t("BITCOIN_S")}
                  </span>
                </div>
                <div>
                  <span>25.73</span>
                  <span>
                    {" "}
                    <img
                      src={require("../assets/images/cryptocoins/eth.svg")}
                      alt="thumb"
                      className="mr-2"
                    />{" "}
                    {t("ETHEREUM")}
                  </span>
                </div>
              </div>
              <div className="swap_info_mid">
                <p>
                  {t("OUTPUT_ESTIMATED")}
                </p>
                <div>
                  <span>{t("PARTHER_BURNED")}</span>
                  <span>
                    <img
                      src={require("../assets/images/cryptocoins/btc.svg")}
                      alt="thumb"
                      className="mr-2"
                    />
                    <img
                      src={require("../assets/images/cryptocoins/eth.svg")}
                      alt="thumb"
                      className="mr-2"
                    />
                    253.20
                  </span>
                </div>
              </div>
              <div className="swap_info_end">
                <div>
                  <span>{t("PRICE")}</span>
                  <div>
                    <span>1 {t("BITCOIN_C")} = 275.6065 ETH</span>
                    <span>1 ETH = 0.5.6065 BTC</span>
                  </div>
                </div>
              </div>
              <Button className="primary_btn blue_btn mb-3">(t{"CONFIRM"})</Button>
            </div>
          </div>
        </div>
      </div>

      {/*  Confirm Swap Modal */}
      <div
        className="modal fade primary_modal"
        id="confirm_swap_modal"
        data-backdrop="static"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="confirm_swap_modal"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="confirm_swap_modal">
                {t("CONFIRM_SWAP")}
              </h5>
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
              <div className="swap_coin_info">
                <div>
                  <span>
                    <img
                      src={require("../assets/images/cryptocoins/btc.svg")}
                      alt="thumb"
                      className="mr-2"
                    />
                    7,255.25
                  </span>
                  <span>{t("BITCOIN_S")}</span>
                </div>
                <i className="bi bi-arrow-down"></i>
                <div>
                  <span>
                    <img
                      src={require("../assets/images/cryptocoins/eth.svg")}
                      alt="thumb"
                      className="mr-2"
                    />
                    25.73
                  </span>
                  <span>{t("ETHEREUM")}</span>
                </div>
              </div>
              <div className="swap_info_mid">
                <p>
                  {t("OUTPUT_RECEIVE_ATLEAST")}{" "}
                  <span>0.0830467 BTC</span> {t("TRANSACTION_REVERT")}
                </p>
              </div>
              <div className="swap_info_end">
                <div>
                  <span>{t("PRICE")}</span>
                  <span>0.0042586 BTC / ETH</span>
                </div>
                <div>
                  <span>{t("MINIMUM_RECEIVED")}</span>
                  <span>25.890 BTC</span>
                </div>
                <div>
                  <span>{t("PRICE_IMPACT")}</span>
                  <span>2.828%</span>
                </div>
                <div>
                  <span>{t("LIQUIDITY_PROVIDER_FEE")}</span>
                  <span>65,498,406 ETH</span>
                </div>
              </div>
              <Button className="primary_btn blue_btn mb-3">
                {t("CONFIRM_SWAP")}
              </Button>
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
              <p>
                {t("READABLE_CONTENT")}
              </p>
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
                  <label className="balance">{t("BAL")} {stakeBal} </label>
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
              {/* <label>Deposit Fee: 0 BUSD</label> */}
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
                  <label className="balance">{t("BAL")} {(lpBal && parseFloat(lpBal) > 0) ? lpBal.toFixed(6) : 0} </label>
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
              {/* <label>Deposit Fee: 0 BUSD</label> */}
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