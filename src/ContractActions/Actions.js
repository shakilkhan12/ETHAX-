import {
    SET_WEB3,
    WALLET_CONNECT,
    THEME_VALUE
} from '../constant';

import {
    getLPbalances,
    getLPbalance
} from "../ContractActions/bep20Actions";

import {
    isNumberCheck,
    division
} from "../helper/custommath";

import {
    convert
} from "../helper/convert";

import {
    getBaseToken
} from "../Api/TokenActions";

import {
    getPair
} from "../ContractActions/factoryActions";

import {
    getBalanceof,
    getTotalSupply
} from "../ContractActions/LPTokenActions";

import config from "../config/config";


export const setWeb3 = details => {
    return {
        type: SET_WEB3,
        payload: details
    };
};

export const setWallet = details => {
    return {
        type: WALLET_CONNECT,
        payload: details
    };
};

export const setTheme = details => {
    return {
        type: THEME_VALUE,
        payload: details
    };
};


export async function calculateRoiData(roiDetails) {
    var farmApy = parseFloat(roiDetails.apr);
    var tokenPrice = parseFloat(roiDetails.tokenPrice);
    var amountInvested = parseFloat(roiDetails.stakeBal);

    var cakeEarnedPerThousand1D = await calculateCakeEarnedPerThousandDollars(1, farmApy, tokenPrice);
    var cakeEarnedPerThousand7D = await calculateCakeEarnedPerThousandDollars(7, farmApy, tokenPrice);
    var cakeEarnedPerThousand30D = await calculateCakeEarnedPerThousandDollars(30, farmApy, tokenPrice);
    var cakeEarnedPerThousand365D = await calculateCakeEarnedPerThousandDollars(365, farmApy, tokenPrice);

    var roi1 = await apyModalRoi(cakeEarnedPerThousand1D, amountInvested);
    var roi2 = await apyModalRoi(cakeEarnedPerThousand7D, amountInvested);
    var roi3 = await apyModalRoi(cakeEarnedPerThousand30D, amountInvested);
    var roi4 = await apyModalRoi(cakeEarnedPerThousand365D, amountInvested);

    roi1 = await isNumberCheck(roi1);
    roi2 = await isNumberCheck(roi2);
    roi3 = await isNumberCheck(roi3);
    roi4 = await isNumberCheck(roi4);

    cakeEarnedPerThousand1D = await isNumberCheck(cakeEarnedPerThousand1D);
    cakeEarnedPerThousand7D = await isNumberCheck(cakeEarnedPerThousand7D);
    cakeEarnedPerThousand30D = await isNumberCheck(cakeEarnedPerThousand30D);
    cakeEarnedPerThousand365D = await isNumberCheck(cakeEarnedPerThousand365D);

    if (roi1 && roi1 !== "" && roi1.toString().search("e+") > 0) {
        roi1 = 0;
    }
    if (roi2 && roi2 !== "" && roi2.toString().search("e+") > 0) {
        roi2 = 0;
    }
    if (roi3 && roi3 !== "" && roi3.toString().search("e+") > 0) {
        roi3 = 0;
    }
    if (roi4 && roi4 !== "" && roi4.toString().search("e+") > 0) {
        roi4 = 0;
    }

    if (cakeEarnedPerThousand1D && cakeEarnedPerThousand1D !== "" && cakeEarnedPerThousand1D.toString().search("e+") > 0) {
        cakeEarnedPerThousand1D = 0;
    }
    if (cakeEarnedPerThousand7D && cakeEarnedPerThousand7D !== "" && cakeEarnedPerThousand7D.toString().search("e+") > 0) {
        cakeEarnedPerThousand7D = 0;
    }
    if (cakeEarnedPerThousand30D && cakeEarnedPerThousand30D !== "" && cakeEarnedPerThousand30D.toString().search("e+") > 0) {
        cakeEarnedPerThousand30D = 0;
    }
    if (cakeEarnedPerThousand365D && cakeEarnedPerThousand365D !== "" && cakeEarnedPerThousand365D.toString().search("e+") > 0) {
        cakeEarnedPerThousand365D = 0;
    }

    var oneday = {
        percentage: roi1,
        usdvalue: cakeEarnedPerThousand1D,
    }
    var oneweek = {
        percentage: roi2,
        usdvalue: cakeEarnedPerThousand7D,
    }
    var onemonth = {
        percentage: roi3,
        usdvalue: cakeEarnedPerThousand30D,
    }
    var oneyear = {
        percentage: roi4,
        usdvalue: cakeEarnedPerThousand365D,
    }

    return {
        oneday,
        oneweek,
        onemonth,
        oneyear
    }
}

function roundToTwoDp(number) {
    return Math.round(number * 100) / 100;
}

async function calculateCakeEarnedPerThousandDollars(numberOfDays, farmApy, tokenPrice) {

    var timesCompounded = 365;
    var apyAsDecimal = farmApy / 100;
    var daysAsDecimalOfYear = numberOfDays / timesCompounded;
    var principal = 1000 / tokenPrice;
    var finalAmount = principal * (1 + apyAsDecimal / timesCompounded) ** (timesCompounded * daysAsDecimalOfYear);
    var interestEarned = finalAmount - principal;
    interestEarned = parseFloat(await convert(interestEarned));
    interestEarned = await roundToTwoDp(interestEarned);
    return interestEarned;

}

async function apyModalRoi(amountEarned, amountInvested) {
    var percentage = (amountEarned / amountInvested) * 100;
    percentage = parseFloat(await convert(percentage));
    return percentage.toFixed(2);
}


export async function getTokenPrice() {

    try {
        var getToken = await getBaseToken();

        var busdtoken = (getToken && getToken.result && getToken.result.busdtoken) ? getToken.result.busdtoken : "";
        var siteToken = (getToken && getToken.result && getToken.result.siteToken) ? getToken.result.siteToken : ""
        var getLP = await getPair(busdtoken, siteToken, config.Factory);
        var lpaddress = getLP.value;

        var getTokenBalances = await getLPbalances(busdtoken, siteToken, lpaddress);
        var tokenAbalance = getTokenBalances.tokenAbalance;
        var tokenBbalance = getTokenBalances.tokenBbalance;
        var tokenPrice = tokenAbalance / tokenBbalance;

        return {
            tokenAbalance,
            tokenBbalance,
            tokenPrice
        }
    } catch (err) {
        return {
            tokenAbalance: 0,
            tokenBbalance: 0,
            tokenPrice: 0
        }
    }


}


export async function getUserLPDetails(tokenA, tokenB, pairAddress) {

    var frombalance = await getLPbalance(tokenA, pairAddress);
    var tobalance = await getLPbalance(tokenB, pairAddress);
    var liqutityBal = await getBalanceof("balanceOf", pairAddress);
    var SupplyValue = await getTotalSupply(pairAddress);

    var reserveFrom = await division(frombalance.balanceOf, 1e18);
    var reserveTo = await division(tobalance.balanceOf, 1e18);
    var LPbalance = await division(liqutityBal.value, 1e18);
    var totalSupply = await division(SupplyValue.value, 1e18);

    var fromAmt = reserveFrom * (LPbalance / totalSupply);
    var toAmt = reserveTo * (LPbalance / totalSupply);

    return {
        reserveA: frombalance.balanceOf,
        reserveB: tobalance.balanceOf,
        userTokenA: (fromAmt > 0) ? fromAmt : 0,
        userTokenB: (toAmt > 0) ? toAmt : 0,
        LPbalance: liqutityBal.value,
        LPbalanceshow: LPbalance,
        TotalSupply: SupplyValue.value,

    }

}




