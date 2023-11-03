import React, { useEffect, useState } from "react";
// core components
import GridContainer from "../../components/Grid/GridContainer.js";
import GridItem from "../../components/Grid/GridItem.js";
import Header from "../../components/Header/Header.js";
import FooterHome from "../../components/Footer/FooterHome.js";
import HeaderDashboard from "../../components/Header/HeaderDashboard.js";
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Liqutityhistory from "../../components/Liqutityhistory.js";
import { Link } from "react-router-dom";
import { Button, Tooltip, Typography, Accordion, AccordionSummary, AccordionDetails } from '@material-ui/core';
import { Settings, HelpOutline, History } from '@material-ui/icons';
import { ArrowDropDown, Launch } from '@material-ui/icons';
import {
  tokenDetails
} from "../../Api/TokenActions";
import config from "../../config/config"
import {
  getallPairsLength,
  getLiqutityAllList
} from "../../ContractActions/factoryActions";

import WalletModal from "../../components/WalletModal";
import RemoveLiqutityModal from "../../components/RemoveLiqutityModal";
import btnImage from '../../assets/images/btn.png';
import { withStyles } from "@material-ui/core/styles";
import pancakeTokenlists from '../../views/Tokenlists/pancakeTokenlists.json'
import SlippageModal from "../../components/SlippageModal.js";

const dashboardRoutes = [];

// Trade History Table


const HtmlTooltip = withStyles((theme) => ({
  tooltip: {
    backgroundColor: '#fff',
    color: '#787878',
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(2),
    border: '1px solid #fff',
    boxShadow: '-4px 5px 10px 2px rgb(0 0 0 / 20%)'
  },
}))(Tooltip);

// Scroll to Top
function ScrollToTopOnMount() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return null;
}


export default function Liquidity(props) {

  const { ...rest } = props;
  const { t } = useTranslation();
  const theme = useSelector((state) => state.theme);
  //redux
  const web3Reducer = useSelector((state) => state.web3Reucer);

  var { importTokenClick } = props;

  const [tokenList, settokenList] = useState([]);
  const [userLiqutity, setuserLiqutity] = useState([]);
  const [showLiqutity, setshowLiqutity] = useState(false);
  const [fromToken, setfromToken] = useState("");
  const [toToken, settoToken] = useState("");
  const [slippageValue, setslippageValue] = useState(0.5);
  const [singleHopOnly, setsingleHopOnly] = useState(false);
  const [transdeadline, settransdeadline] = useState(5);

  useEffect(() => {
    setInitial();
    getLiqutityList();
    //eslint-disable-next-line
  }, [web3Reducer]);

  async function setInitial() {
    let userAddress = ""
    if (web3Reducer && web3Reducer.web3 && web3Reducer.address && web3Reducer.address !== "") userAddress = web3Reducer.address;

    var getnewtokens = pancakeTokenlists && pancakeTokenlists.tokens
    // var getToken = await tokenDetails({ useraddress: userAddress });
    // var allToken = getToken.result;
    var allToken = getnewtokens
    settokenList(allToken);
  }
  async function importLiqutity(item) {
    importTokenClick();
  }

  async function getLiqutityList() {

    setuserLiqutity([]);
    setshowLiqutity(false)

    var getlength = await getallPairsLength('allPairsLength');
    
    var length = parseInt(getlength.value);

    var AllToken = []
    if (tokenList.length > 0) {
      // AllToken = JSON.parse(tokenList);
      AllToken = (tokenList);

     
    } else {
      let userAddress = ""
      if (web3Reducer && web3Reducer.web3 && web3Reducer.address && web3Reducer.address !== "") userAddress = web3Reducer.address;
      var getnewtokens = pancakeTokenlists && pancakeTokenlists.tokens;
      AllToken = getnewtokens;
      // var getToken = await tokenDetails({ useraddress: userAddress });
      // AllToken = JSON.parse(getToken.result);
    }

    var list = await getLiqutityAllList(length, AllToken);

    setuserLiqutity(list);
    setshowLiqutity(true)

  }

  async function showremoveLiqutityModal(items) {
    setfromToken(items.tokenA);
    settoToken(items.tokenB);
    setTimeout(function () {
      window.$('#remove_liqutity_modal').modal('show');
    }, 500)

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
        brand={(theme && theme.value === "dark") ? <img src={require("../../assets/images/logo.png")} alt="logo" /> : <img src={require("../../assets/images/logo.png")} alt="logo" />}
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
        <div className="inner_pageheader container-fluid px-0">

          <div className="inner_content_wrapper">
            <div className="container">

              <GridContainer>
                <GridItem xs={12} sm={12} md={8} lg={6} className="m-auto">
                  <div className="trade_wrapper">
                    <div className="trade_wrap_title trade_wrap_title_box d-block">
                      <div>
                        <h2>{t('LIQUIDITY_REWARDS')}</h2>
                        <h5>{t('WITHDRAW_LIQUIDITY')}</h5>
                        {/* <Button className="primary_btn mb-3"><Link to="/add-liquidity">{t('ADD_LIQUIDITY')}</Link></Button> */}
                      </div>
                      <div className="mt-3">
                        <div className="liquidity_section">
                          <div className="d-flex align-items-center justify-content-between mb-3">
                            <h2>{t('YOUR_LIQUIDITY')}</h2>
                            <div>
                              <Button className="home_primary_btn mb-0"><Link to="/add-liquidity">{t('CREATE_PAIR')}</Link></Button>
                              <Button className="primary_btn_border"><Link to="/add-liquidity">{t('ADD_LIQUIDITY')}</Link></Button>
                            </div>
                          </div>
                          {web3Reducer && web3Reducer.address === "" &&
                            <h3>{t('CONNECT_WALLET_LIQUIDITY')}</h3>
                          }


                          {!showLiqutity &&
                            <h3>{t('LOADING')}</h3>
                          }
                          <div className="liquidity_list_panel">
                            {showLiqutity && web3Reducer && web3Reducer.address !== "" && userLiqutity
                              && userLiqutity.length > 0 && userLiqutity.map((item, i) => {
                                return (
                                  <div className="farm_box_footer liquidity_list">
                                    <Accordion>
                                      <AccordionSummary expandIcon={<ArrowDropDown />} aria-controls="panel1a-content" id="panel1a-header">
                                        <h2>{item.tokenAsymbol}/{item.tokenBsymbol}</h2>
                                      </AccordionSummary>
                                      <AccordionDetails>
                                        <div>
                                          <div className="d-flex justify-content-between align-items-center">
                                            <h3>{t('POOL')} {item.tokenAsymbol}:</h3>
                                            <label>{item.tokenAAmt}</label>
                                          </div>
                                          <div className="d-flex justify-content-between align-items-center">
                                            <h3>{t('POOL')} {item.tokenBsymbol}:</h3>
                                            <label>{item.tokenBAmt}</label>
                                          </div>
                                          <div className="d-flex justify-content-between align-items-center">
                                            <h3>{t('POOL_TOKENS')}</h3>
                                            <label>{item.displayamt}</label>
                                          </div>
                                          <div className="d-flex justify-content-between align-items-center">
                                            <h3>{t('POOL_SHARE')}</h3>
                                            <label>{item.shareOfPool} %</label>
                                          </div>
                                          <div className="d-flex justify-content-between align-items-center">
                                            <Link to={"/add-liquidity#" + item.tokenA + "-" + item.tokenB}>{t('ADD')}</Link>
                                            <Link to={"/remove-liquidity" + "/" + item.tokenA + "/" + item.tokenB}>{t('REMOVE_LIQUIDITY')}</Link>
                                          </div>
                                        </div>
                                      </AccordionDetails>
                                    </Accordion>
                                  </div>

                                )
                              })}
                          </div>
                          {showLiqutity && web3Reducer && web3Reducer.address !== "" && userLiqutity
                            && userLiqutity.length == 0 &&
                            <p>{t('NO_LIQUTITY_LIST')}</p>
                          }

                          <p className="mt-4">{t('DONT_SEE_POOL_JOINED')}<Link to="/add-liquidity#import">{t('IMPORT_IT')}</Link></p>
                          <p>{t('TOKEN_FARM_UNSTAKE')}</p>
                        </div>
                      </div>
                      {/* <div>
                        <Button className="round_btn" data-toggle="modal" data-target="#settings_modal"><Settings /></Button>
                        <Button className="round_btn" data-toggle="modal" data-target="#recent_trans_modal"><History /></Button>
                      </div> */}

                    </div>
                  </div>
                </GridItem>
              </GridContainer>


            </div>
          </div>
        </div>
      </div>
      <SlippageModal
        onChildClick={childSettingClick}
      />
      <FooterHome />

      <WalletModal />

    </div>
  );
}
