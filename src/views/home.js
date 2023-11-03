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
import { getEthaxHomeDetails } from "../ContractActions/MasterChefAction.js";
import { getTopForm, getTotalValue } from './HomeCalculation/topfarms.js'
import { fetchPoolsPublicDataAsync, getTokenPricesFromFarm } from "./HomeCalculation/topPools.js";
import SlippageModal from "../components/SlippageModal.js";

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

export default function LandingPage(props) {
  const classes = useStyles();
  const { t } = useTranslation();

  const { ...rest } = props;
  const theme = useSelector((state) => state.theme);
  const [count, setCount] = useState(1);
  const [totalsupply, settotalsupply] = useState(0);
  const [circulatebalance, setcirculatebalance] = useState(0);
  const [marketcap, setmarketcap] = useState(0);
  const [burnbalance, setburnbalance] = useState(0);
  const [ethaxprice, setEthaxPrice] = useState(0)
  const [lockedEthax, setLockedEthax] = useState(0)
  const [harvestValue, setHarvestDollar] = useState(0);
  const [totalHarvest, setTotalHarvest] = useState(0);
  const [lockedtotal, setlockedtotal] = useState(0);
  const [userbalance, setbalanceOfUser] = useState(0);
  const [slippageValue, setslippageValue] = useState(0.5);
  const [singleHopOnly, setsingleHopOnly] = useState(false);
  const [transdeadline, settransdeadline] = useState(5);
  const web3Reducer = useSelector((state) => state.web3Reucer);
  useEffect(() => {
    readcontract();
    getTotalValueLockedss()
    // document.title = `You clicked ${count} times`;
    // console.log("Count: " + count);
    setCount(1);
  }, [count]);

  // const getTotalValueLockedss = async () => {
  //   var totalValuess = await getTotalValue();
  //   var finalTotalLocked = parseInt(totalValuess)
  //   setlockedtotal(finalTotalLocked)
  //   // console.log('datatotalValuesstotalValuess: ', await parseFloat(totalValuess));
  // }

  useEffect(() => {
    const interval = setInterval(() => {
      getEthaxdetails()
    }, 4000);
    return () => clearInterval(interval);
  }, [])




  const getTotalValueLockedss = async () => {
    const topPools = await fetchPoolsPublicDataAsync()
    const topFarms = await getTopForm()
    let totalLocked = 0;
    if (topFarms && topFarms.length > 0) {
      if (topFarms[0] && topFarms[1] && topPools[0]) {

        const totalLiquidity1 = topFarms[0].lpTotalInQuoteToken * (topFarms[0].quoteTokenPriceBusd)
        const totalLiquidity2 = topFarms[1].lpTotalInQuoteToken * (topFarms[1].quoteTokenPriceBusd)
        totalLocked = parseFloat(totalLiquidity1) + parseFloat(totalLiquidity2);
        const totalPool1 = parseFloat(topPools[0].gettotalstaked) * (topPools[0].stakingTokenPrice) / (1000000000000000000);
        totalLocked = parseFloat(totalLiquidity1) + parseFloat(totalLiquidity2) + parseFloat(totalPool1);
        // const poolBal = getTotalStakedBalance();
        // totalLocked += poolBal;
      }
    }
    setlockedtotal(totalLocked)
    // console.log('datatotalValuesstotalValuess: ', parseFloat(totalLocked));
  }

  const getEthaxdetails = async () => {
    const { lockedValue, finalpendingValue, totalpendingValue, balanceOfUser, lockeddollarvalue } = await getEthaxHomeDetails()
    setLockedEthax(lockeddollarvalue)
    setTotalHarvest(finalpendingValue)
    setHarvestDollar(totalpendingValue)
    setbalanceOfUser(balanceOfUser)
  }

  async function readcontract() {
    var contractCallContext = [
      {
        reference: "totalSupply",
        contractAddress: config.EthaxAddress,
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
        contractAddress: config.EthaxAddress,
        abi: ABI,
        calls: [
          {
            reference: "balanceOf",
            methodName: "balanceOf",
            methodParameters: ["0x0000000000000000000000000000000000000000"],
          }
        ],
      },
      {
        reference: "balanceOfETHLP",
        contractAddress: config.EthaxAddress,
        abi: ABI,
        calls: [
          {
            reference: "balanceOf",
            methodName: "balanceOf",
            methodParameters: [config.Ethax_Busd_LP],
          }
        ],
      },
      {
        reference: "balanceOfBusdLP",
        contractAddress: config.BUSD,
        abi: ABI,
        calls: [
          {
            reference: "balanceOf",
            methodName: "balanceOf",
            methodParameters: [config.Ethax_Busd_LP],
          }
        ],
      },
    ];
    const results = await multicall.call(contractCallContext);
    var totalSupply = await getFormatMulticall(results, "totalSupply", 0);
    var burnbal = await getFormatMulticall(results, "balanceOf", 0);
    var EthlpBAl = await getFormatMulticall(results, "balanceOfETHLP", 0);
    EthlpBAl = new BigNumber(EthlpBAl.hex, 16);
    EthlpBAl = EthlpBAl.toString(10);
    EthlpBAl = EthlpBAl / 1000000000000000000;

    var BusdLpbal = await getFormatMulticall(results, "balanceOfBusdLP", 0);
    BusdLpbal = new BigNumber(BusdLpbal.hex, 16);
    BusdLpbal = BusdLpbal.toString(10);
    BusdLpbal = BusdLpbal / 1000000000000000000;

    let busdprice = BusdLpbal / EthlpBAl;
    // console.log('busdprice: ', busdprice);

    setEthaxPrice(busdprice.toFixed(3))
    let ten = new BigNumber(totalSupply.hex, 16);
    var userdigibalance = ten.toString(10);
    totalSupply = userdigibalance / 1000000000000000000;
    let market_cap = totalSupply * busdprice.toFixed(3);
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
    <div className="home_header">
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
      <div className="dashPages">
        <div className="inner_wrapper">
          <div className="container">
            <GridContainer>
              <GridItem xs={12} sm={12} md={6} className="order-1 order-sm-1 order-md-1 order-lg-1 mx-auto">
                <img src={require("../assets/images/logo.png")} alt="ETHAX" className="img-fluid dashLogo" />
                <h2 className="text-center">Join the ETHAX Exchange - Crypto For Everyone</h2>
              </GridItem>
            </GridContainer>

            <GridContainer className="mt-4">
              <GridItem xs={12} sm={6} md={5} className="ml-auto">
                <div className="white_box white_box_left fsBox">
                  <div class="flexRow titleBox">
                    <h1 className="white_box_title">Farms & Staking</h1>
                    <img src={require("../assets/images/Purple_Token.png")} alt="" class="titleImg" width="90" height="90" />
                  </div>
                  <div className="mt-0">
                    <h3>ETHAX to Harvest</h3>
                    <h5>- {totalHarvest.toFixed(9)}</h5>
                    <p>~${harvestValue.toFixed(9)}</p>
                  </div>
                  <div className="mt-4">
                    <h3>ETHAX in Wallet</h3>
                    <h5>Locked</h5>
                    <h5>- {userbalance.toFixed(3)}</h5>
                    <p>~${lockedEthax.toFixed(3)}</p>
                  </div>
                </div>
              </GridItem>
              <GridItem xs={12} sm={6} md={5} className="mr-auto">
                <div className="white_box white_box_right">
                  <div class="flexRow titleBox">
                    <h1 className="white_box_title">ETHAX Stats</h1>
                    <img src={require("../assets/images/Purple_Wallet.png")} alt="" class="titleImg" width="90" height="90" />
                  </div>
                  <div className="flexRow listBox">
                    <span>Market cap</span>
                    <h3>${marketcap.toLocaleString()}</h3>
                  </div>
                  <div className="flexRow listBox">
                    <span>Max Supply</span>
                    <h3>{totalsupply.toLocaleString()}</h3>
                  </div>
                  <div className="flexRow listBox">
                    <span>Total Burned</span>
                    <h3>{burnbalance}</h3>
                  </div>
                  <div className="flexRow listBox">
                    <span>ETHAX Price</span>
                    <h3>${ethaxprice}</h3>
                  </div>
                  <div className="flexRow listBox">
                    <span>Total Supply</span>
                    <h3>{totalsupply.toLocaleString()}</h3>
                  </div>
                </div>
              </GridItem>
            </GridContainer>

            <GridContainer className="mt-4">
              <GridItem xs={12} sm={6} md={5} className="mx-auto">
                <div className="white_box home_bottom_box text-center fsBox">
                  <h5>Total Value Locked (TVL)</h5>
                  <h1 className="white_box_title">$ {parseInt(lockedtotal).toLocaleString()}</h1>
                  <h5>Across all LPs and Pools</h5>
                </div>
              </GridItem>
            </GridContainer>

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
