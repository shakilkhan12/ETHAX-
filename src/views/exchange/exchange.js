import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from 'react-i18next';
import { Slider } from '@material-ui/core';
// core components
import GridContainer from "../../components/Grid/GridContainer.js";
import GridItem from "../../components/Grid/GridItem.js";
import {
    Button,
} from "@material-ui/core";
import Header from "../../components/Header/Header.js";
import HeaderDashboard from "../../components/Header/HeaderDashboard.js";
import ReactLoading from "react-loading";
import FooterHome from "../../components/Footer/FooterHome.js";
// Datatable
import WalletModal from "../../components/WalletModal";
import TokenModal from "../../components/TokenModal";
import SwapModal from "../../components/SwapModal";
import SlippageModal from "../../components/SlippageModal";

import { toastAlert } from "../../helper/toastAlert";
import LPABI from "../../ABI/LPABI.json";
import { connection } from "../../helper/connection";
import { Link } from "react-router-dom";
import pancakeTokenlists from '../../views/Tokenlists/pancakeTokenlists.json'


import {
    getbalance,
    approveSwap,
    allowance
} from "../../ContractActions/bep20Actions";

import {
    numberFloatOnly,
    percentage,
    toFixedWithoutRound,
} from "../../helper/custommath";

import { convert } from "../../helper/convert";
// import { tokenDetails } from "../../Api/TokenActions";
import config from "../../config/config";
import { setPairs } from "../../reducers/Actions"

import {
    listToTokenMapValue,
    tryParseAmount,
    formatExecutionPrice,
    getMinumumReceived,
    getMethod,
    addmultiply,
    swapTradeExactOut,
    computeTradePriceBreakdown,
    getBestTokens,
    getAllowedPairs,
    SwapTradeExactIn
} from "./Pancake/hooks";

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



const dashboardRoutes = [];

var initialData = {
    "name": "",
    "symbol": "",
    "address": "",
    "amount": "",
    "showamount": "",
    "value": "",
    "decimals": "",
    "payamount": "",
    "chainId": config.NetworkId,
}

var initialData1 = {
    "priceper": 0,
    "priceperinvert": 0,
    "minimumReceived": 0,
    "liquidityFee": 0,
    "priceimpact": 0,
    "fromamount": 0,
    "fromdecimal": 0,
    "toamount": 0,
    "todecimal": 0,
    "path": [],
    "isRoutes": []
}
var currPair = '';


// Scroll to Top
function ScrollToTopOnMount() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    return null;
}

export default function Exchange(props) {

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
    const [frombalance, setfrombalance] = useState({ "balance": "Loading", "balanceOf": 0 });
    const [tobalance, settobalance] = useState({ "balance": 0, "balanceOf": 0 });

    //const [showapprove, setshowapprove] = useState(false);
    const [approvebtn, setapprovebtn] = useState(false);

    const [insufficienterror, setinsufficienterror] = useState(false);
    const [Insufficienttoken, setInsufficienttoken] = useState("");
    const [insufficientliqerror, setinsufficientliqerror] = useState(false);


    const [checkallowance, setcheckallowance] = useState(false);
    const [showswap, setshowswap] = useState(false);

    const [slippageValue, setslippageValue] = useState(0.5);
    const [transdeadline, settransdeadline] = useState(5);

    const [swaploading, setswaploading] = useState(false);
    const [tokenList, settokenList] = useState([]);


    const [enterValue, setenterValue] = useState(0);

    const [loadslider, setloadslider] = useState(true);

    const [swapdata, setswapdata] = useState(initialData1);
    const [best_to_check_trades, setbest_to_check_trades] = useState([]);
    const [isPair, setisPair] = useState(true);
    const [singleHopOnly, setsingleHopOnly] = useState(false);

    const [currentPair, setcurrentPair] = useState("");


    useEffect(() => {
        setInitial();
        //eslint-disable-next-line
    }, [web3Reducer]);


    async function setInitial() {

        let userAddress = ""
        if (web3Reducer && web3Reducer.address && web3Reducer.address !== "") userAddress = web3Reducer.address;
        // var getToken = await tokenDetails({ useraddress: userAddress });

        var getnewtokens = pancakeTokenlists && pancakeTokenlists.tokens
         
        var tokenList = getnewtokens;
        if (tokenList && tokenList.length > 0) {

            var resp = await getBestTokens(tokenList);
           
            setbest_to_check_trades(resp);

            var index = 0;
            var index1 = 1;

            try {
                var fromData = {
                    "name": tokenList[index].name,
                    "symbol": tokenList[index].symbol,
                    "address": tokenList[index].address,
                    "decimals": tokenList[index].decimals,
                    "chainId": tokenList[index].chainId,
                    "logoURI" :tokenList[index].logoURI
                }

                var toData = {
                    "name": tokenList[index1].name,
                    "symbol": tokenList[index1].symbol,
                    "address": tokenList[index1].address,
                    "decimals": tokenList[index1].decimals,
                    "chainId": tokenList[index1].chainId,
                    "logoURI" :tokenList[index1].logoURI
                }

                settokenList(tokenList);
                setfromValue({ ...fromValue, ...fromData });
                settoValue({ ...toValue, ...toData });
                setTimeout(function () {
                    getuserbal(tokenList[index].address, tokenList[index].symbol)
                }, 500)
                setTimeout(function () {
                    getuserbal1(tokenList[index1].address,tokenList[index1].symbol)
                }, 500);

                setFromDetails(fromData);
                setTimeout(function () {
                    setToDetails(toData);
                }, 1000);


                loadPairs(fromData, toData, resp)

            } catch (err) {

                console.error("Error: could not load tokens due to following message: ", err.message)
            }
        }
    }

    async function loadPairs(from, to, best) {
        setisPair(false)
        try {
            // let index2 = tokenList.findIndex((val) => val.address.toLowerCase() === from.toLowerCase())
            // let index3 = tokenList.findIndex((val) => val.address.toLowerCase() === to.toLowerCase())
            // let inputToken = tokenList[index2];
            // let outputToken = tokenList[index3];

            var fromVal = Object.assign({ chainId: config.NetworkId }, from);
            var toVal = Object.assign({ chainId: config.NetworkId }, to);

            let inputToken = fromVal;
            let outputToken = toVal;

            var inputCurrency = await listToTokenMapValue(inputToken);
            // console.log('inputCurrennnnnnncy: ', inputCurrency);
            var outputCurrency = await listToTokenMapValue(outputToken);
            var getPairs = await getAllowedPairs(inputCurrency ?? undefined, outputCurrency ?? undefined, best ?? undefined)
            dispatch(setPairs({ pairs: getPairs }));
        } catch (err) {

        }
        setisPair(true)
        return true;
    }

    async function getuserbal(from, symbol) {
        var value = await getbalance(from, symbol);
        setfrombalance({ balance: value.balance, balanceOf: value.balanceOf });
    }
    async function getuserbal1(to, symbol) {
        var value = await getbalance(to, symbol);
        settobalance({ balance: value.balance, balanceOf: value.balanceOf });
    }

    function setCurr(item) {
        setswapcurrent(item);
    }

    async function swapChange() {

        if (fromValue.address !== "" && toValue.address !== "") {

            var fromD = toValue;
            var toD = fromValue;
            var fromBal = tobalance;
            setfromValue(fromD);
            settoValue(toD);
            setfrombalance(tobalance);
            settobalance(frombalance);
            var value = enterValue;

            if (value && value > 0) {
                setshowswap(false);
                setswaploading(true);
            }

            var id = (swapcurrent === "from") ? "to" : "from";
            await loadPairs(fromD, toD, best_to_check_trades)
            if (value && value > 0) {
                await calculateAmount(id, value, fromD, toD, "yes", slippageValue, fromBal);
            }

            // if (toD.symbol === "ETH" || fromD.symbol === "ETH") {
            //   setshowapprove(false);
            // } else {
            //   setshowapprove(true);
            // }

        }

    }

    const inputChange = async (event) => {
        
        var id = event.target.id;
        var value = event.target.value;
        calculateAmount(id, value, fromValue, toValue, "no", slippageValue);
        setenterValue(value);
    }

    async function calculateAmount(id, value, fromData, toData, interchange, slippage, fromBal) {

        setswaploading(true);
        setinsufficienterror(false);
        setinsufficientliqerror(false)

        var pairs = pairValue.pairs;
        var status = await numberFloatOnly(value);
        setswapcurrent(id);
        var str = value.toString();
        var res = str.charAt(str.length - 1);

        if (id === "from") {
            setfromValue({ ...fromData, ...{ "amount": value, "showamount": value, value } });
        } else if (id === "to") {
            settoValue({ ...toData, ...{ "amount": value, "showamount": value, value } });
        }

        if (status && res !== "." && parseFloat(value) > 0) {

            var isExactIn = (id === "from") ? true : false;
            //var singleHopOnly = false;
            var typedValue = value;
            var from = fromData.address;
            var to = toData.address;

            let inputToken = fromData;
            let outputToken = toData;

            var inputCurrency = await listToTokenMapValue(inputToken);
            var outputCurrency = await listToTokenMapValue(outputToken);

            const parsedAmount = tryParseAmount(typedValue, (isExactIn ? inputCurrency : outputCurrency) ?? undefined)
            var trade = null;

            if (isExactIn) {
                trade = await SwapTradeExactIn(isExactIn ? parsedAmount : undefined, outputCurrency ?? undefined, singleHopOnly ?? undefined, pairs ?? undefined)
            } else {
                trade = await swapTradeExactOut(inputCurrency ?? undefined, !isExactIn ? parsedAmount : undefined, singleHopOnly ?? undefined, pairs ?? undefined)
            }

            if (trade) {


                let pairAddr = (trade.route && trade.route.pairs && trade.route.pairs[0] && trade.route.pairs[0].liquidityToken && trade.route.pairs[0].liquidityToken.address) ? trade.route.pairs[0].liquidityToken.address : ""

                setcurrentPair(pairAddr);
                currPair = pairAddr;

                let inputAmount = (trade && trade.route && trade.inputAmount) ? (id === "from") ? typedValue : trade.inputAmount.toSignificant(6) : null;
                let outputAmount = (trade && trade.route && trade.outputAmount) ? (id === "to") ? typedValue : trade.outputAmount.toSignificant(6) : null;
                var path = (trade && trade.route && trade.route.path) ? trade.route.path : null

                var priceper = "0";
                var priceperinvert = "0";
                if (trade && trade) {
                    priceper = formatExecutionPrice(trade, true)
                    priceperinvert = formatExecutionPrice(trade, false)
                }

                var bestpath = [];
                var isRoutes = [];
                if (path) {
                    for (var p = 0; p < path.length; p++) {
                        bestpath.push(path[p].address)
                        isRoutes.push(path[p].symbol)
                    }
                } else {
                    return;
                }

                const { priceImpactWithoutFee, realizedLPFee } = computeTradePriceBreakdown(trade)

                var minReceived = {
                    "fromAmt": (inputAmount) ? inputAmount : 0,
                    "toAmt": (outputAmount) ? parseFloat(outputAmount) : 0,
                    "id": (isExactIn) ? "from" : "no",
                    "slippageValue": slippage
                }

                var minVal = await getMinumumReceived(minReceived);
                const priceImpact = (priceImpactWithoutFee) ? priceImpactWithoutFee.toFixed(2) : "0";
                const liqutityfee = (realizedLPFee) ? realizedLPFee.toSignificant(6) : "0";

                var data = {
                    isExactIn: isExactIn,
                    from: inputToken,
                    to: outputToken
                }
            
                var { method, fromField, toField } = await getMethod(data)
                // console.log('methodsssssssssoField: ', method, fromField, toField);

                var paths = (bestpath && bestpath.length > 0) ? bestpath : []

                var amount1 = (isExactIn) ? addmultiply(inputAmount, 10 ** fromValue.decimals) : addmultiply(minVal, 10 ** fromValue.decimals);
                amount1 = await convert(amount1);

                var checkDeci = amount1.split('.')
                if (checkDeci.length === 2) {
                    amount1 = checkDeci[0]
                }

                var amount2 = (!isExactIn) ? addmultiply(outputAmount, 10 ** toValue.decimals) : addmultiply(minVal, 10 ** toValue.decimals);
                amount2 = await convert(amount2);

                var checkDeci1 = amount2.split('.')
                if (checkDeci1.length === 2) {
                    amount2 = checkDeci1[0]
                }

                var fromAmount = inputAmount;
                //var toAmount = outputAmount;

                setfromValue({ ...fromData, ...{ "amount": amount1, showamount: fromAmount, value: (id === "from") ? value : fromAmount } });
                settoValue({ ...toData, ...{ "amount": amount2, showamount: outputAmount, value: (id === "to") ? value : outputAmount } });
                setshowswap(true);

                if (fromData.address !== "") {
                    ValidateAllowance(fromData.address, fromAmount, fromData.symbol);
                }

                var checkFromBal = parseFloat(frombalance.balanceOf);
                if (interchange === "yes") {
                    checkFromBal = parseFloat(fromBal.balanceOf);
                }

                if (parseFloat(amount1) > parseFloat(checkFromBal)) {
                    setinsufficienterror(true);
                    setInsufficienttoken(fromValue.symbol);
                    return;
                }

                setswapdata({
                    priceper: parseFloat(priceper),
                    priceperinvert: parseFloat(priceperinvert),
                    minimumReceived: parseFloat(minVal),
                    liquidityFee: parseFloat(liqutityfee),
                    priceimpact: (priceImpact === 0) ? "<0.01" : priceImpact,
                    [fromField]: amount1,
                    fromdecimal: fromData.decimals,
                    [toField]: amount2,
                    todecimal: toData.decimals,
                    path: paths,
                    method: method,
                    id: id,
                    fromsymbol: fromData.symbol,
                    tosymbol: toData.symbol,
                    isRoutes: isRoutes
                })
                setswaploading(false);

            } else {
                if (value !== "") {
                    setinsufficientliqerror(true)
                }

                resetSwap(fromData, toData, id, value)
            }
        } else if (value === "") {
            resetSwap(fromData, toData)
        } else if (!status) {
            resetSwap(fromData, toData)
        }

    }


    function resetSwap(fromData, toData, id, value) {

        var fAmt = "";
        var tAmt = "";
        if (id && id === "from") {
            fAmt = value;
        } else if (id && id === "to") {
            tAmt = value;
        }

        setswapdata({
            priceper: 0,
            priceperinvert: 0,
            minimumReceived: 0,
            liquidityFee: 0,
            priceimpact: 0,
            fromamount: 0,
            fromdecimal: 0,
            toamount: 0,
            todecimal: 0,
            path: [],
            method: "",
            isRoutes: []
        });
        setfromValue({ ...fromData, ...{ "amount": "", showamount: fAmt, value: "" } });
        settoValue({ ...toData, ...{ "amount": "", showamount: tAmt, value: "" } });
        setswaploading(false);

    }

    async function ValidateAllowance(address, amounts0, symbol) {

        var value1 = await allowance(address, config.Router);
        setcheckallowance(false);
        if (parseFloat(value1.value) < parseFloat(amounts0) && symbol !== config.ETHSYMBOL) {
            setcheckallowance(true);
            setshowswap(false);
        } else {
            setshowswap(true);
        }

        setswaploading(false);
    }

    async function approveToken() {

        var value = await getbalance(fromValue.address, fromValue.symbol);
        try {
            var balance = value.balance;
            var amt = parseFloat(fromValue.amount) / 1e18;

            if (balance >= amt) {
                setapprovebtn(true);
                var approveAmt = 10000000 * (10 ** 18);
                approveAmt = await convert(approveAmt);
                var result = await approveSwap(fromValue.address, approveAmt, config.Router);
                if (result.status) {
                    //setshowapprove(false);
                    setshowswap(true);
                    setcheckallowance(false);
                    setapprovebtn(false);
                    toastAlert('success', "Approve Success", 'balance');
                } else {
                    setapprovebtn(false);
                }
            } else {
                setapprovebtn(false);
                toastAlert('error', "Insuffucient balance", 'balance');
            }
        } catch (err) {
            setapprovebtn(false);
        }

    }

    async function showSwapModal() {
        //check to current price update
        await calculateAmount(swapcurrent, enterValue, fromValue, toValue, "no", slippageValue);
        window.$('#swap_modal').modal('show');
    }

    async function confirmSupply() {
        await calculateAmount(swapcurrent, enterValue, fromValue, toValue, "no", slippageValue);
        return true;
    }

    function childSettingClick(value) {
        if (value && value.settings) {
            setslippageValue(value.settings);
            calculateAmount("from", fromValue.showamount, fromValue, toValue, "no", parseFloat(value.settings));

        }
        if (value && value.deadline) {
            settransdeadline(value.deadline);
        }

        if (value && value.ismultiHops) {
            var isHops = (value.ismultiHops === "true") ? true : false
            setsingleHopOnly(isHops);
            resetSwap(fromValue, toValue)
        }
    }

    async function childTokenClick(item, currentTab) {
       


        window.$('#token_modal').modal('hide');
        if (currentTab === "from" && item && item.address !== "") {
            setfromValue({ ...fromValue, ...item });
            if (fromValue.showamount > 0) {
                setswaploading(true);
                setshowswap(false);
            }
            await loadPairs(item, toValue, best_to_check_trades)
            if (fromValue.showamount > 0) {
                calculateAmount("from", fromValue.showamount, item, toValue, "no", slippageValue);
            }
            setFromDetails(item);


        } else if (item && item.address !== "") {
            if (toValue.showamount > 0) {
                setswaploading(true);
                setshowswap(false);
            }
            settoValue({ ...toValue, ...item });
            setToDetails(item);
            await loadPairs(fromValue, item, best_to_check_trades)
            if (toValue.showamount > 0) {
                calculateAmount("to", toValue.showamount, fromValue, item, "no", slippageValue);
            }
        }

    }

    async function setFromDetails(item) {
        var value = await getbalance(item.address, item.symbol);
        setfrombalance({ balance: value.balance, balanceOf: value.balanceOf });
        // if (item.symbol !== "ETH") {
        //   setshowapprove(true);
        // } else {
        //   setshowapprove(false);
        // }

    }
    async function setToDetails(item) {
        if (item === undefined || item === "") {
            settobalance({ balance: 0, balanceOf: 0 });
        } else {
            var value = await getbalance(item.address, item.symbol);
            settobalance({ balance: value.balance, balanceOf: value.balanceOf });
            // if (fromValue.symbol !== "") {
            //   setshowapprove(true);
            // }
        }
    }

    const sliderChange = async (value) => {

        setloadslider(false)
        setenterValue("");

        if (frombalance && frombalance.balance > 0) {

            var calculate = await percentage(frombalance.balance, value, 'percentage');
            if (value === 100) {
                var bal = await toFixedWithoutRound(frombalance.balance, 4);
                calculate = bal;
            }

            setenterValue(calculate.toString());
            await calculateAmount("from", calculate.toString(), fromValue, toValue, "no", slippageValue);
        }
        setloadslider(true)
    }

    async function childSwapModal() {

        setisPair(false)
        setTimeout(function () {
            loadPairs(fromValue, toValue, best_to_check_trades)
        }, 2000)

        setTimeout(function () {
            getuserbal(fromValue.address, fromValue.symbol)
        }, 500)
        setTimeout(function () {
            getuserbal1(toValue.address, toValue.symbol)
        }, 500);

        setfromValue({ ...fromValue, ...{ "amount": "", showamount: "" } });
        settoValue({ ...toValue, ...{ "amount": "", showamount: "" } });
        setswapdata(initialData1);
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
                <div className="inner_pageheader">
                    
                    <div className="inner_content_wrapper">
                        <div className="container">
                            <GridContainer>
                                
                                <GridItem lg={5} md={6} sm={12} className="m-auto">
                                    <div className="exchange_div" data-aos="fade-up" data-aos-duration="2000">                                        
                                        <div className="whitebox swap_box">
                                            <div className="trade_wrap_title">
                                                <div>
                                                    <h2>{t('EXCHANGE')}</h2>
                                                    <h5>Trade tokens in an instant</h5>
                                                </div>
                                                <div>
                                                    <Button className="round_btn" data-toggle="modal" data-target="#settings_modal"><i className="fas fa-cog"></i></Button>
                                                    {/* <Button className="round_btn" data-toggle="modal" data-target="#settings_modal"><i className="fas fa-cog"></i></Button> */}
                                                </div>
                                            </div>
                                            <div className="input_panel">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <label>{t('FROM')}</label>
                                                    <label>{t('BALANCE')}<span>{(frombalance.balance > 0 && web3Reducer &&
                                                        web3Reducer.address !== "") ? parseFloat(frombalance.balance) : 0}</span></label>
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <input
                                                        type="text"
                                                        placeholder="0.0"
                                                        className="custom_inp"
                                                        onChange={inputChange}
                                                        value={fromValue.showamount}
                                                        id="from"
                                                        disabled={(!isPair) ? true : false}
                                                    ></input>
                                                    <Button className="token_btn" data-toggle="modal" data-target="#token_modal" onClick={() => { setCurr("from"); modalRef.current.handleModalOpen(); }}>
                                                        {fromValue.address && fromValue.address !== "" &&
                                                            <img src={fromValue.logoURI} alt="Logo" className="img-fluid" onError={(e) => { e.target.onerror = null; e.target.src = config.defaultLogo }} />}
                                                         {/* <img src={config.imageUrl + fromValue.address.toLowerCase() + '.png'} alt="Logo" className="img-fluid" onError={(e) => { e.target.onerror = null; e.target.src = config.defaultLogo }} />} */}
                                                        {fromValue.symbol} <i className="bi bi-chevron-down"></i>
                                                    </Button>
                                                </div>
                                            </div>
                                            {/* <div className="slide">
                                                {loadslider ?
                                                    <Slider onChangeCommitted={(_, v) => sliderChange(v)}
                                                        className="mt-1" defaultValue={0} getAriaValueText={valuetext}
                                                        aria-labelledby="discrete-slider-custom" step={1}
                                                        valueLabelDisplay="auto" marks={marks} />
                                                    :
                                                    <Slider
                                                        className="mt-1" defaultValue={0} getAriaValueText={valuetext}
                                                        aria-labelledby="discrete-slider-custom" step={1}
                                                        valueLabelDisplay="auto" marks={marks} />
                                                }
                                            </div> */}


                                            <div className="text-center mt-3 mb-3">
                                                <img onClick={() => swapChange()} src={require("../../assets/images/exchange_icon.png")} alt="Logo" className="img-fluid" />
                                            </div>

                                            <div className="input_panel mb-4">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <label>{t('TO')}</label>
                                                    <label>{t('BALANCE')}<span>{(tobalance.balance > 0 && web3Reducer && web3Reducer.address !== "") ? parseFloat(tobalance.balance) : 0}</span></label>
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <input
                                                        type="text"
                                                        placeholder="0.0"
                                                        className="custom_inp"
                                                        onChange={inputChange}
                                                        value={toValue.showamount}
                                                        id="to"
                                                        disabled={(!isPair) ? true : false}
                                                    >

                                                    </input>
                                                    <Button className="token_btn" data-toggle="modal" data-target="#token_modal" onClick={() => { setCurr("to"); modalRef.current.handleModalOpen(); }}>
                                                        {toValue && <img src={toValue.logoURI} onError={(e) => { e.target.onerror = null; e.target.src = config.defaultLogo }} alt="Logo" className="img-fluid" />}
                                                        {(toValue.symbol !== "") ? toValue.symbol : "Select a currency"}
                                                        <i className="bi bi-chevron-down"></i>
                                                    </Button>
                                                </div>
                                            </div>
                                            {/* <div className="equivalent_value mt-2">
                        <p>1 ETH = 2239.69 USDT</p>
                        <i className="fas fa-sync"></i>
                      </div> */}
                                            {web3Reducer && web3Reducer.address !== "" ?
                                                <div>
                                                    {(insufficientliqerror) ?
                                                        <div className="text-center mt-2">
                                                            <Button className="primary_btn blue_btn">{t('INSUFFICIENT_LIQUIDITY')}</Button>
                                                        </div>
                                                        :
                                                        (fromValue.amount === "" || toValue.amount === "") ?
                                                            <div className="text-center mt-2">
                                                                <Button className="primary_btn blue_btn">{t('ENTER_AMOUNT')}</Button>
                                                            </div>
                                                            :
                                                            (insufficienterror) ?
                                                                <div className="text-center mt-2">
                                                                    <Button className="primary_btn blue_btn">{t('INSUFFICIENT_BALANCE')} {Insufficienttoken}.</Button>
                                                                </div>

                                                                : (swapdata && swapdata.priceimpact && parseFloat(swapdata.priceimpact) > 15) ?
                                                                    <div className="text-center mt-2">
                                                                        <Button className="primary_btn blue_btn">{t('PRICE_IMPACT_HIGH')}</Button>
                                                                    </div>
                                                                    :
                                                                    (checkallowance) ?
                                                                        <div className="text-center mt-2">
                                                                            
                                                                            <Button disabled={approvebtn} onClick={() => { approveToken() }} className="primary_btn blue_btn">{t('ENABLE')} {fromValue.symbol}</Button>
                                                                        </div>
                                                                        :
                                                                        (showswap && swapdata && swapdata.priceimpact && parseFloat(swapdata.priceimpact) <= 15) ?

                                                                            <div className="text-center mt-2">
                                                                                <Button onClick={() => { showSwapModal() }} className="primary_btn blue_btn">{t('SWAP')}</Button>
                                                                            </div>
                                                                            : ("")
                                                    }
                                                </div>
                                                :
                                                <div className="text-center mt-2" data-toggle="modal" data-target="#wallet_modal">
                                                    <Button className="primary_btn blue_btn">{t('UNLOCK_WALLET')}</Button>
                                                </div>

                                            }

                                            {(swaploading || approvebtn) &&
                                                <div className="text-center mt-2">
                                                    <ReactLoading type={"bars"} color={config.reactLoadr} className="loading" />
                                                </div>
                                            }


                                            <hr />
                                            <div className="trade_notes">
                                                {/* <div>                                                    
                                                    <span>{t((swapcurrent === "to") ? ('MAXIMUM_SOLD') : "MINIMUM_RECEIVED_C")}</span>
                                                    <span>{(swapdata && swapdata.minimumReceived && parseFloat(swapdata.minimumReceived) > 0) ? parseFloat(swapdata.minimumReceived).toFixed(4) : 0}</span>
                                                </div> */}
                                                <div>
                                                    <span>{t('SLIPPAGE_TOLERANCE')}</span>
                                                    <span>{(slippageValue && parseFloat(slippageValue) > 0) ? slippageValue : 0} %</span>
                                                </div>
                                                {/* <div>
                                                    <span>{t('LIQUIDITY_PROV_FEE')}</span>
                                                    <span>{(swapdata && swapdata.liquidityFee && parseFloat(swapdata.liquidityFee) > 0) ? parseFloat(swapdata.liquidityFee).toFixed(4) : 0}</span>
                                                </div>
                                                <div>
                                                    <span>{t('PRICE_IMPACTS')}</span>
                                                    <span>{swapdata.priceimpact} %</span>
                                                </div>
                                                {swapdata && swapdata.isRoutes && swapdata.isRoutes.length > 2 &&
                                                    <div className="bestRoutes">
                                                        <span>{t('ROUTE')}</span>
                                                        <div>
                                                            {swapdata.isRoutes.map((item, i) => {
                                                                var total = swapdata.isRoutes.length - 1;
                                                                var pathname = (i !== total) ? item + " >" : item;
                                                                return (
                                                                    <span className="px-1">{pathname}</span>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                } */}

                                                <a class="accordian_link pool-details-link collapsed justify-content-center" data-toggle="collapse" href="#collapseExample" role="button" aria-expanded="false" aria-controls="collapseExample">
                                                    {t("DETAILS")}
                                                </a>
                                                <div class="collapse" id="collapseExample">
                                                    <div className="trade_notes">
                                                        <div>
                                                            {/* <span>{(swapcurrent === "to") ? "Maximum sold" : "Minimum Received"}:</span> */}
                                                            <span>{t((swapcurrent === "to") ? ('MAXIMUM_SOLD') : "MINIMUM_RECEIVED_C")}</span>
                                                            <span>{(swapdata && swapdata.minimumReceived && parseFloat(swapdata.minimumReceived) > 0) ? parseFloat(swapdata.minimumReceived).toFixed(4) : 0}</span>
                                                        </div>
                                                        <div>
                                                            <span>{t('LIQUIDITY_PROV_FEE')}</span>
                                                            <span>{(swapdata && swapdata.liquidityFee && parseFloat(swapdata.liquidityFee) > 0) ? parseFloat(swapdata.liquidityFee).toFixed(4) : 0}</span>
                                                        </div>
                                                        <div>
                                                            <span>{t('PRICE_IMPACTS')}</span>
                                                            <span>{swapdata.priceimpact} %</span>
                                                        </div>
                                                        {swapdata && swapdata.isRoutes && swapdata.isRoutes.length > 2 &&
                                                            <div className="bestRoutes">
                                                                <span>{t('ROUTE')}</span>
                                                                <div>
                                                                    {swapdata.isRoutes.map((item, i) => {
                                                                        var total = swapdata.isRoutes.length - 1;
                                                                        var pathname = (i !== total) ? item + " >" : item;
                                                                        return (
                                                                            <span className="px-1">{pathname}</span>
                                                                        )
                                                                    })}
                                                                </div>
                                                            </div>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </GridItem>
                            </GridContainer>
                        </div>
                    </div>
                </div>
            </div>

            <FooterHome />

            {/*  Select Token Modal */}
            <TokenModal
                fromValue={fromValue}
                toValue={toValue}
                swapcurrent={swapcurrent}
                onChildTokenClick={childTokenClick}
                ref={modalRef}
            />

            <SwapModal
                fromValue={fromValue}
                toValue={toValue}
                swapcurrent={swapcurrent}
                slippage={slippageValue}
                deadline={transdeadline}
                onchildSwapModal={childSwapModal}
                settobalance={settobalance}
                onchildconfirmSupply={confirmSupply}
                swapdata={swapdata}
            />

            {/*  Wallet Token Modal */}
            <WalletModal />

            {/*  Settings Modal */}
            <SlippageModal
                onChildClick={childSettingClick}
            />

        </div>
    );

}