import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import { useTranslation } from 'react-i18next';

// core components
import Header from "../components/Header/Header.js";
import FooterHome from "../components/Footer/FooterHome.js";
import GridContainer from "../components/Grid/GridContainer.js";
import GridItem from "../components/Grid/GridItem.js";
import HeaderLinks from "../components/Header/HeaderLinks.js";
import HeaderDashboard from "../components/Header/HeaderDashboard"
import styles from "../assets/jss/material-kit-react/views/home.js";
import { Button } from "@material-ui/core";
import WalletModal from "../components/WalletModal.js";
import Web3 from 'web3';
import BigNumber from "bignumber.js";
import { Link } from "react-router-dom";

// Slick Carousel
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Multicall } from 'ethereum-multicall';
import config from "../config/config";
import ABI from "../ABI/abi";

var web3 = new Web3(config.rpcurl);

const multicall = new Multicall({
  web3Instance: web3,
});

const dashboardRoutes = [];

// Scroll to Top
function ScrollToTopOnMount() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return null;
}

const useStyles = makeStyles(styles);

export default function Audit(props) {
  const classes = useStyles();
  const { t } = useTranslation();

  const { ...rest } = props;
  const theme = useSelector((state) => state.theme);
  const [count, setCount] = useState(1);
  const [totalsupply, settotalsupply] = useState(0);
  const [circulatebalance, setcirculatebalance] = useState(0);
  const [marketcap, setmarketcap] = useState(0);
  const [burnbalance, setburnbalance] = useState(0);

  useEffect(() => {
    readcontract();
    // document.title = `You clicked ${count} times`;
    // console.log("Count: " + count);
    setCount(1);
  }, [count]);

  async function readcontract() {
    var contractCallContext = [
      {
        reference: "totalSupply",
        contractAddress: config.Contractaddress,
        abi: ABI,
        calls: [
          {
            reference: "totalSupply",
            methodName: "totalSupply",
            methodParameters: [],
          }
        ],
      },
      {
        reference: "balanceOf",
        contractAddress: config.Contractaddress,
        abi: ABI,
        calls: [
          {
            reference: "balanceOf",
            methodName: "balanceOf",
            methodParameters: ["0x0000000000000000000000000000000000000000"],
          }
        ],
      },
    ];
    const results = await multicall.call(contractCallContext);
    var totalSupply = await getFormatMulticall(results, "totalSupply", 0);
    var burnbal = await getFormatMulticall(results, "balanceOf", 0);
    let ten = new BigNumber(totalSupply.hex, 16);
    var userdigibalance = ten.toString(10);
    totalSupply = userdigibalance / 1000000000000000000;

    let market_cap = totalSupply * 0.0063;
    settotalsupply(totalSupply);
    setmarketcap(market_cap);
    let ten1 = new BigNumber(burnbal.hex, 16);
    var burn_bal = ten1.toString(10);
    burn_bal = burn_bal / 1000000000000000000;
    setburnbalance(burn_bal);

    let circulating_bal = totalSupply - burn_bal;
    setcirculatebalance(circulating_bal)

  }

  function getFormatMulticall(results, name, pos) {
    try {
      var returnVal = (results && results.results && results.results[name]
        && results.results[name].callsReturnContext &&
        results.results[name].callsReturnContext &&
        results.results[name].callsReturnContext[pos] &&
        results.results[name].callsReturnContext[pos].returnValues &&
        results.results[name].callsReturnContext[pos].returnValues[0]) ?
        results.results[name].callsReturnContext[pos].returnValues[0] : "";
      return returnVal;
    } catch (err) {
      return "";
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
                        <h1>Audits</h1>
                      </div>
                    </div>
                  </div>
                </GridItem>
              </GridContainer>
            </div>
          </div>
          <div className="inner_content_wrapper">
            <div className="container">
              <GridContainer className="mt-4 mb-5" data-aos="fade-up" data-aos-duration="2000">
                <GridItem md={4}>
                  <div className="whiteBox earnBox audit_box">
                    <a href={require("../assets/images/pdf/Ethax_Router_Comprehensive_Smart_Contract_Audit_SOKEN.pdf")} target="_blank">
                      <img src={require("../assets/images/ethax_router.png")} alt="lottery ticket" className="img-fluid" />
                    </a>
                  </div>
                </GridItem>
                <GridItem md={4}>
                  <div className="whiteBox earnBox audit_box">
                    <a href={require("../assets/images/pdf/Ethax_Factory_Comprehensive_Smart_Contract_Audit_SOKEN.pdf")} target="_blank">
                      <img src={require("../assets/images/ethax_factory.png")} alt="lottery ticket" className="img-fluid" />
                    </a>
                  </div>
                </GridItem>
                <GridItem md={4}>
                  <div className="whiteBox earnBox audit_box">
                    <a href={require("../assets/images/pdf/ETHAX_Swap_Staking_Comprehensive_SmartContract_Audit_SOKEN.pdf")} target="_blank">
                      <img src={require("../assets/images/ethax_staking.png")} alt="lottery ticket" className="img-fluid" />
                    </a>
                  </div>
                </GridItem>
              </GridContainer>
            </div>
          </div>
        </div>


      </div>
      <FooterHome />
    </div>
  );
}
