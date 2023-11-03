import {
    allowance,
    getLPbalance
} from "../../ContractActions/bep20Actions";

import {
    getPair,
} from "../../ContractActions/factoryActions";


import {
    convertToWei,
    numberFloatOnly,
    division,
    multiply,
    divideDecimal,
    toFixedWithoutRound,
    ChecktokenDecimal
} from "../../helper/custommath";

import {
    getTotalSupply
} from "../../ContractActions/LPTokenActions";

import config from "../../config/config"
import { convert } from "../../helper/convert";

export async function calculateValue(
    id,
    value,
    setfromValue,
    fromValue,
    settoValue,
    toValue,
    setswapcurrent,
    pairDetails,
    setshareofPoolToken,
    setreceivedPool,
    firstliqutity
) {

    try {
        var status = await numberFloatOnly(value);
        if (status) {

            if (id === "from") {
                setfromValue({ ...fromValue, ...{ "amount": value, "showamount": value, value: value } });
            } else if (id === "to") {
                settoValue({ ...toValue, ...{ "amount": value, "showamount": value, value: value } });
            }

            setswapcurrent(id);
           
            if (fromValue.address !== "" && toValue.address !== "" && parseFloat(value) > 0) {

                var fromdecimals = fromValue.decimals;
                var todecimals = toValue.decimals;

                var enterAmount = await convertToWei(value, (id === "from") ? fromdecimals : todecimals);

                var reserveA = parseFloat(pairDetails.fromLPbalance);
                var reserveADecimal = fromdecimals;
                reserveA = reserveA / 10 ** reserveADecimal;
                var reserveB = parseFloat(pairDetails.toLPbalance);
                var reserveBDecimal = todecimals;
                reserveB = reserveB / 10 ** reserveBDecimal;

                if (id === "from") {
                    reserveA = pairDetails.toLPbalance;
                    reserveADecimal = todecimals;
                    reserveA = reserveA / 10 ** reserveADecimal

                    reserveB = pairDetails.fromLPbalance;
                    reserveBDecimal = fromdecimals;
                    reserveB = reserveB / 10 ** reserveBDecimal
                }

                var InOutAmount = (id === "from") ? toValue.amount : fromValue.amount;

                if (reserveA > 0 && reserveB > 0) {
                    var divAmt = await division(reserveA, reserveB);
                    var mulAmt = await multiply(parseFloat(value), parseFloat(divAmt));
                    mulAmt = parseFloat(await ChecktokenDecimal(mulAmt, (id === "from") ? todecimals : fromdecimals));

                    InOutAmount = await convertToWei(mulAmt, (id === "from") ? todecimals : fromdecimals);
                    

                }

                var fromAmt = (id === "from") ? enterAmount : InOutAmount;
                var toAmt = (id === "to") ? enterAmount : InOutAmount;

                if (firstliqutity) {
                    reserveA = fromAmt / 10 ** fromdecimals;
                    reserveB = toAmt / 10 ** todecimals;
                }

                var { youWillReceive, lpAmt } = await calculateShareReceived(pairDetails, fromAmt, toAmt);

                setshareofPoolToken((lpAmt > 0) ? await toFixedWithoutRound(lpAmt, 4) : 0);
                setreceivedPool(youWillReceive);

                return {
                    fromAmt,
                    toAmt,
                    status,
                    reserveA,
                    reserveB
                }
            } else if (firstliqutity) {
                var InOutAmount = (id === "from") ? toValue.amount : fromValue.amount;
                var fromAmt = (id === "from") ? enterAmount : InOutAmount;
                var toAmt = (id === "to") ? enterAmount : InOutAmount;

                if (firstliqutity) {
                    reserveA = fromAmt / 10 ** fromdecimals;
                    reserveB = toAmt / 10 ** todecimals;
                }

                var { youWillReceive, lpAmt } = await calculateShareReceived(pairDetails, fromAmt, toAmt);

                setshareofPoolToken((lpAmt > 0) ? await toFixedWithoutRound(lpAmt, 4) : 0);
                setreceivedPool(youWillReceive);

                return {
                    fromAmt: (fromAmt > 0) ? fromAmt : "",
                    toAmt: (toAmt > 0) ? toAmt : "",
                    status,
                    reserveA,
                    reserveB
                }


            } else if (value === "") {
                setfromValue({ ...fromValue, ...{ "amount": "", showamount: "" } });
                settoValue({ ...toValue, ...{ "amount": "", showamount: "" } });
                setshareofPoolToken(0);
                return {
                    fromAmt: 0,
                    toAmt: 0,
                    status: false,
                    reserveA: 0,
                    reserveB: 0
                }

            }
        } else {
            return {
                fromAmt: 0,
                toAmt: 0,
                status: false,
                reserveA: 0,
                reserveB: 0
            }
        }
    } catch (err) {
        return {
            fromAmt: 0,
            toAmt: 0,
            status: false,
            reserveA: 0,
            reserveB: 0
        }
    }


}

async function calculateShareReceived(pairdetail, fromamt, toamt) {
    try {
        var lpAmt = 0;
        if (pairdetail.fromLPbalance) {
            var totalAmt = parseFloat(fromamt) + parseFloat(pairdetail.fromLPbalance);
            lpAmt = fromamt / totalAmt * 100;
        }

        var amount_from = fromamt;
        var amount_to = toamt;
        var Supply = await getTotalSupply(pairdetail.pairAddress);
        var TotalSupply = Supply.value;
        var reserve_from = pairdetail.fromLPbalance;
        var reserve_to = pairdetail.toLPbalance;

        var receiveAmt = Math.min(amount_from * TotalSupply / reserve_from, amount_to * TotalSupply / reserve_to)
        var youWillReceive = await divideDecimal(receiveAmt, 18)

        return {
            youWillReceive,
            lpAmt
        }
    } catch (err) {
        return {
            youWillReceive: 0,
            lpAmt: 0
        }
    }

}

export async function checkAllowance(id, amount, address, balanceof, symbol, decimals) {

    var value1 = await allowance(address, config.Router);
    var bal = value1.value;

    balanceof = parseFloat(balanceof) / 10 ** parseFloat(decimals);
    bal = parseFloat(bal) / 10 ** parseFloat(decimals);
    amount = parseFloat(amount) / 10 ** parseFloat(decimals);
    // balanceof = await convert(balanceof)
    var fromallowance = "no";
    var toallowance = "no";
    var frominsuffucient = "no";
    var toinsuffucient = "no";

    if (amount > 0) {
        if (id === "from") {
            if (parseFloat(bal) < parseFloat(amount) && symbol !== config.ETHSYMBOL) {
                fromallowance = "yes";
            }
            if (parseFloat(amount) > parseFloat(balanceof)) {
                frominsuffucient = "yes";
            }
        }
        if (id === "to") {
            if (parseFloat(bal) < parseFloat(amount) && symbol !== config.ETHSYMBOL) {
                toallowance = "yes";
            }
            if (parseFloat(amount) > parseFloat(balanceof)) {
                toinsuffucient = "yes";
            }
        }
    }

    return {
        fromallowance,
        toallowance,
        frominsuffucient,
        toinsuffucient
    }
}



export async function getLiqutityLPdetails(tokenA, tokenB) {
    var checkExits = await getPair(tokenA, tokenB, config.Factory);
    var pairAddress = checkExits.value;
    var frombalance = await getLPbalance(tokenA, pairAddress);
    var tobalance = await getLPbalance(tokenB, pairAddress);
    return {
        pairAddress,
        frombalance,
        tobalance
    }

}
