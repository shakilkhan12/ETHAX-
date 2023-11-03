import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import PropTypes from "prop-types";
import GridContainer from "../../components/Grid/GridContainer";
import GridItem from "../../components/Grid/GridItem";
import { withStyles } from "@material-ui/core/styles";
import { Link, useParams, useHistory } from "react-router-dom";
import { Button, Tooltip, Typography } from '@material-ui/core';
import CssBaseline from "@material-ui/core/CssBaseline";
import Header from "../../components/Header/Header.js";
import FooterHome from "../../components/Footer/FooterHome.js";
import HeaderLinks from "../../components/Header/HeaderLinks.js";
import HeaderDashboard from "../../components/Header/HeaderDashboard.js";
import { useSelector } from 'react-redux';
import ReactLoading from "react-loading";
import { Slider } from '@material-ui/core';
import { connection } from "../../helper/connection";

import WalletModal from "../../components/WalletModal";

import { KeyboardBackspace, HelpOutline } from '@material-ui/icons';

import { toastAlert } from "../../helper/toastAlert";

import JSBI from 'jsbi/dist/jsbi.mjs';

import {
  removeLiquidity,
  removeLiquidityETH
} from "../../ContractActions/routerActions";

import {
  getBalanceof,
  getTotalSupply
} from "../../ContractActions/LPTokenActions";

import {
  approve,
  getLPbalance
} from "../../ContractActions/bep20Actions";

import {
  convertToWei,
  toFixedFormat,
  getdeadline,
  division,
  toFixedWithoutRound,
  percentage,
  ChecktokenDecimal
} from "../../helper/custommath";

import {
  convert
} from "../../helper/convert";

import {
  getPair
} from "../../ContractActions/factoryActions";

import {
  tokenDetails
} from "../../Api/TokenActions";
import pancakeTokenlists from '../../views/Tokenlists/pancakeTokenlists.json'

// import {
//   removeliqutityValue
// } from "../../Api/LiqutityActions";

import config from "../../config/config";

const drawerWidth = 250;
const dashboardRoutes = [];

const HtmlTooltip = withStyles((theme) => ({
  tooltip: {
    backgroundColor: '#fff',
    color: '#787878',
    maxWidth: 220,
    fontSize: '12px',
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

const styles = theme => ({
  root: {
    display: "flex"
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 36
  },
  menuButtonIconClosed: {
    transition: theme.transitions.create(["transform"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    transform: "rotate(0deg)"
  },
  menuButtonIconOpen: {
    transition: theme.transitions.create(["transform"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    transform: "rotate(180deg)"
  },
  hide: {
    display: "none"
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap"
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  drawerClose: {
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    overflowX: "hidden",
    width: theme.spacing.unit * 7 + 1,
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing.unit * 6.8 + 1
    }
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    marginTop: theme.spacing.unit,
    justifyContent: "flex-end",
    padding: "0 8px",
    ...theme.mixins.toolbar
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing.unit * 3
  },
  grow: {
    flexGrow: 1
  }
});



const marks = [
  {
    value: 0,
    label: '0%',
  },
  {
    value: 25,
    label: '25%',
  },
  {
    value: 50,
    label: '50%',
  },
  {
    value: 75,
    label: '75%',
  },
  {
    value: 100,
    label: '100%',
  },
];

function valuetext(value) {
  return `${value}%`;
}

var initialData = {
  "name": "",
  "symbol": "",
  "address": "",
  "logoURI": "",
  "amount": 0,
  "showamount": "-"
}

const AddLiquidity = (props) => {


  var { tokena } = useParams();
  var { tokenb } = useParams();
  const { t } = useTranslation();
  const { ...rest } = props;

  const [open, setOpen] = useState(true)
  const [anchorEl, setAnchorEl] = useState(null);
  const history = useHistory();

  const [from, setfrom] = useState(initialData);
  const [to, setto] = useState(initialData);
  const [fromrate, setfromrate] = useState(0);
  const [torate, settorate] = useState(0);
  const [poolLiq, setpoolLiq] = useState(0);
  const [removeLiq, setremoveLiq] = useState(0);
  const [isRemove, setisRemove] = useState(true);
  const [percentageValue, setpercentageValue] = useState(0);
  const [pairaddress, setpairaddress] = useState("");
  const [showloader, setshowloader] = useState(false);
  const [reserveFrom, setreserveFrom] = useState(0);
  const [reserveTo, setreserveTo] = useState(0);
  const [totalSupply, settotalSupply] = useState(0);
  const [isapproveBtn, setisapproveBtn] = useState(true);
  const [sliderloading, setsliderloading] = useState(true);



  const walletConnection = useSelector((state) => state.walletConnection);
  const web3Reducer = useSelector((state) => state.web3Reucer);
  const themeValue = useSelector((state) => state.theme);


  useEffect(() => {
    getTokenDetails();
    //eslint-disable-next-line
  }, []);

  const sliderChange = async (value) => {
    setisRemove(true);

    var per = (poolLiq) * parseFloat(value) / 100;
    var removedValue = await division(per, 1e18);
    var totalPool = JSBI.BigInt(poolLiq);
    var percenatgeVal = JSBI.BigInt(value);
    var multiply = JSBI.multiply(totalPool, percenatgeVal);
    var divideVal = JSBI.divide(multiply, JSBI.BigInt(100));
    var finalAmt = JSBI.BigInt(divideVal);
    var finalAmt1 = String(finalAmt);
    
    var fromAmt = reserveFrom * (parseFloat(removedValue) / totalSupply);
    var toAmt = reserveTo * (parseFloat(removedValue) / totalSupply);

    var fromData = {
      showamount: await toFixedWithoutRound(fromAmt, 8), amount: fromAmt
    }
    var toData = {
      showamount: await toFixedWithoutRound(toAmt, 8), amount: toAmt
    }

    if (value == 100) {
      var liqutityBal = await getBalanceof("balanceOf", pairaddress);
      finalAmt1 = JSBI.BigInt(liqutityBal.value);
      finalAmt1 = String(finalAmt1);
    }

    setfrom({ ...from, ...fromData });
    setto({ ...to, ...toData });
    var liqRemove = await convert(per);
    if (liqRemove > 0) {
      setisapproveBtn(false)
    } else {
      setisapproveBtn(true)
    }
    setremoveLiq(finalAmt1);
    setpercentageValue(value);

  }

  async function getTokenDetails() {

    try {

      let userAddress = ""
      if (web3Reducer && web3Reducer.address !== "" && web3Reducer.web3 && web3Reducer.address && web3Reducer.address !== "") userAddress = web3Reducer.address;

      // var getToken = await tokenDetails({ useraddress: userAddress });
      // var allToken = JSON.parse(getToken.result);

      var allToken = pancakeTokenlists && pancakeTokenlists.tokens

      var pair = await getPair(tokena, tokenb, config.Factory);
      var pairAddress = pair.value;
      var frombalance = await getLPbalance(tokena, pairAddress);
      var tobalance = await getLPbalance(tokenb, pairAddress);

      var tokenAIndex = allToken.findIndex(val => val.address.toLowerCase() === tokena.toLowerCase());
      var tokenBIndex = allToken.findIndex(val => val.address.toLowerCase() === tokenb.toLowerCase());

      var fromsymbol = (tokenAIndex !== -1) ? allToken[tokenAIndex].symbol : "";
      var fromDecimals = (tokenAIndex !== -1) ? allToken[tokenAIndex].decimals : 18;

      var tosymbol = (tokenAIndex !== -1) ? allToken[tokenBIndex].symbol : "";
      var toDecimals = (tokenBIndex !== -1) ? allToken[tokenBIndex].decimals : 18;

      var reserveA = await division(frombalance.balanceOf, 10 ** fromDecimals);
      var reserveB = await division(tobalance.balanceOf, 10 ** toDecimals);

      setreserveFrom(reserveA);
      setreserveTo(reserveB);

      var amt = await toFixedFormat(reserveB / reserveA);
      var amt1 = await toFixedFormat(reserveA / reserveB);
      var SupplyValue = await getTotalSupply(pairAddress);
      var Supply = await division(SupplyValue.value, 1e18);


      setpairaddress(pairAddress);
      var liqutityBal = await getBalanceof("balanceOf", pairAddress);
      var balance = liqutityBal.value;
      setpoolLiq(balance);

      settotalSupply(Supply);
      setfromrate(amt);
      settorate(amt1);



      var fromData = {
        symbol: fromsymbol,
        address: tokena,
        decimals: fromDecimals
      }
      var toData = {
        symbol: tosymbol,
        address: tokenb,
        decimals: toDecimals
      }

      setfrom({ ...from, ...fromData });
      setto({ ...to, ...toData });
      setsliderloading(false);

    } catch (err) {

    }

  }


  async function ApproveRemove() {

    var get = await connection();

    if (get && get.web3) {
      var web3 = get.web3;
      var address = get.address;
      var value = removeLiq;
      var deadLine = await getdeadline(2);
      var nonce = web3.utils.toHex(0);
      // var msg = "owner: " + address + "\n" + "spender:" + address + "\n" + "value:" + value + "\n"
      //     + "nonce:" + nonce + "\n" + "deadline:" + deadLine;

      var msg = `owner: ${address} \n spender: ${address} \n value: ${value} \n nonce: ${nonce} \n deadline:${deadLine}`

      setshowloader(true)
      try {
        setisapproveBtn(true)
        await web3.eth.personal.sign(msg, address);
        await approve(pairaddress, value.toString());
        setshowloader(false)
        setisRemove(false);
      } catch (err) {
        setshowloader(false)
        setisapproveBtn(false)
      }

    }

  }

  async function Remove() {

    var get = await connection();
    var result = "";
    if (get && get.web3) {
      var amountAMin = 0;
      var amountBMin = 0;
      if (from.symbol !== config.ETHSYMBOL && to.symbol !== config.ETHSYMBOL) {
        var tokenAamt = await percentage(from.amount, 3, 'minus');
        amountAMin = await convertToWei(tokenAamt, from.decimals);
        amountAMin = await ChecktokenDecimal(amountAMin, from.decimals);

        var tokenBamt = await percentage(to.amount, 3, 'minus');
        amountBMin = await convertToWei(tokenBamt, to.decimals);
        amountBMin = await ChecktokenDecimal(amountBMin, to.decimals);

        setshowloader(true);
        setisRemove(true);
        try {
          result = await removeLiquidity(
            tokena,
            tokenb,
            removeLiq,
            amountAMin,
            amountBMin
          );
          setshowloader(false);
          setisRemove(false);
          setisapproveBtn(false);

          if (result && result.status) {
            var tx = (result.value && result.value.transactionHash) ?
              result.value.transactionHash : "";
            var gasFeevalue = (result.value && result.value.gasUsed) ?
              result.value.gasUsed : 0;
            var gasFee = await division(gasFeevalue, 10 ** 18);

            let LiqData = {
              txid: tx,
              address: walletConnection.address,
              fromaddress: from.address,
              fromamount: from.showamount,
              toaddress: to.address,
              toamount: to.showamount,
              gasfee: gasFee,
              lpamount: parseFloat(removeLiq) / 10 ** 18
            }
            // await removeliqutityValue(LiqData);
            toastAlert('success', "Successfully removed", 'liqutity');
            //window.location.reload(false);
            history.push("/liquidity")
          } else {
            toastAlert('error', "Rejected", 'liqutity');
          }

        } catch (err) {

          setshowloader(false)
        }
      } else {

        let tokenAamt = await percentage(from.amount, 3, 'minus');
        amountAMin = await convertToWei(tokenAamt, from.decimals);

        let tokenBamt = await percentage(to.amount, 3, 'minus');
        amountBMin = await convertToWei(tokenBamt, to.decimals);

        var token = from.address;
        if (to.symbol !== config.ETHSYMBOL) {
          token = to.address;
        }

        var tokenMin = (from.symbol !== config.ETHSYMBOL) ? amountAMin : amountBMin;
        var tokenETHMin = (from.symbol === config.ETHSYMBOL) ? amountAMin : amountBMin;

        setshowloader(true);
        setisRemove(true);

        var removeLiq1 = await convert(removeLiq);
        amountAMin = await convert(tokenMin);
        amountAMin = await ChecktokenDecimal(amountAMin, from.decimals);

        amountBMin = await convert(tokenETHMin);
        amountBMin = await ChecktokenDecimal(tokenETHMin, to.decimals);

        try {
          result = await removeLiquidityETH(
            token,
            removeLiq1,
            amountAMin,
            amountBMin
          );
          setshowloader(false);
          setisRemove(false);
          setisapproveBtn(false)
          if (result && result.status) {

            var tx1 = (result.value && result.value.transactionHash) ?
              result.value.transactionHash : "";
            var gasFeevalue1 = (result.value && result.value.gasUsed) ?
              result.value.gasUsed : 0;
            var gasFee1 = await division(gasFeevalue1, 10 ** 18);

            let LiqData = {
              txid: tx1,
              address: walletConnection.address,
              fromaddress: from.address,
              fromamount: from.showamount,
              toaddress: to.address,
              toamount: to.showamount,
              gasfee: gasFee1,
              lpamount: parseFloat(removeLiq) / 10 ** 18
            }
            // await removeliqutityValue(LiqData);
            toastAlert('success', "Successfully removed", 'liqutity');
            //window.location.reload(false);
            history.push("/liquidity")
          } else {
            toastAlert('error', "Rejected", 'liqutity');
          }
        } catch (err) {
          setshowloader(false)
        }

      }


    }

  }

  function closePopup() {
    window.location.reload(false);
  }


  const { classes, theme } = props;

  return (
    <div className="page_wrapper page_inner_wrapper">
      <Header className="header"
        color="transparent"
        routes={dashboardRoutes}
        brand={(themeValue && themeValue.value === "dark") ? <img src={require("../../assets/images/logo.png")} alt="logo" /> : <img src={require("../../assets/images/logo.png")} alt="logo" />}
        rightLinks={<HeaderDashboard />}
        fixed
        changeColorOnScroll={{
          height: 100,
          color: "dark",
        }}
        {...rest}
      />
      <ScrollToTopOnMount />

      <main className="inner_wrapper">
        <div className="inner_pageheader container-fluid px-0" />
        
        <div className="inner_content_wrapper">
          <div className="container">
            <GridContainer>

              <GridItem lg={5} md={6} sm={12} className="m-auto">
                <div className="liquidity_div" data-aos="fade-up" data-aos-duration="2000">
                  <div className="whitebox swap_box">
                    <div className="trade_wrap_title pb-3">
                      {/* <Button className="round_btn"><Link to="/liquidity"><KeyboardBackspace /></Link></Button> */}
                      <Link to="/liquidity"><i className="fas fa-arrow-left"></i></Link>
                      <div>
                        <h2>{t('REMOVE_LIQUIDITY')}</h2>
                      </div>
                      <div>
                        {/* <Button className="round_btn" data-toggle="modal" data-target="#recent_trans_modal"><i className="bi bi-arrow-repeat"></i></Button> */}
                        <Button className="round_btn" data-toggle="modal" data-target="#settings_modal"><i className="fas fa-cog"></i></Button>
                      </div>
                    </div>
                    <div className="input_panel">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <label>{t('AMOUNT')}&nbsp;</label>
                        {percentage > 0 && <label className="remove_amt">{percentage}%</label>}
                      </div>
                      <div className="px-2">
                        {!sliderloading &&
                          <Slider
                            onChangeCommitted={(_, v) => sliderChange(v)}
                            className="mt-4" defaultValue={0}
                            getAriaValueText={valuetext}
                            aria-labelledby="discrete-slider-custom"
                            step={1}
                            valueLabelDisplay="auto"
                            marks={marks}
                          />
                        }
                        {sliderloading &&
                          <div className="d-flex justify-content-center align-items-center mb-3">
                            <ReactLoading type={"spinningBubbles"} color="#1c5c90" className="loading" />
                          </div>
                        }
                      </div>
                    </div>

                    <div className="text-center mt-4 mb-4">
                      <img src={require("../../assets/images/icon_arrow.png")} alt="Logo" className="img-fluid" />
                    </div>

                    <div className="input_panel">
                      <div className="">

                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span>{from && from.logoURI && from.logoURI != "" && <img src={from.logoURI} alt="Logo" className="img-fluid mr-2" height="35px" width="35px" />}{from.symbol}</span>
                          <span>{from.showamount}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span>{to && to.logoURI && to.logoURI != "" && <img src={to.logoURI} alt="Logo" className="img-fluid mr-2" height="35px" width="35px" />}{to.symbol}</span>
                          <span>{to.showamount}</span>

                        </div>
                      </div>

                      <label>{t('PRICE')}:</label>
                      <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <span>1 {from.symbol}</span>
                          <span>{fromrate} {to.symbol}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <span>1 {to.symbol}</span>
                          <span>{torate} {from.symbol}</span>
                        </div>
                      </div>

                      <div className="d-flex justify-content-between align-items-center">
                        <Button disabled={isapproveBtn} onClick={() => { ApproveRemove() }} className="home_primary_btn">{t('APPROVE')}</Button>
                        {removeLiq > 0 ?
                          <Button disabled={(isRemove) ? "disabled" : ""} className="home_primary_btn" onClick={() => { Remove() }}>{t('REMOVE')}</Button>
                          :
                          ("")
                        }
                        {showloader &&
                          <div className="text-center mt-2">
                            <ReactLoading type={"spinningBubbles"} color="#1c5c90" className="loading" />
                          </div>
                        }
                      </div>
                    </div>


                  </div>
                </div>
              </GridItem>

            </GridContainer>
          </div>

        </div>
      </main>

      {/*  Wallet Token Modal */}
      <WalletModal />
    </div>
  );
}

AddLiquidity.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired
};

export default withStyles(styles, { withTheme: true })(AddLiquidity);
