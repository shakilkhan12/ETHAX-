import Web3 from 'web3';
import config from '../config/config';
import { convert } from './convert';

export async function percentage(amount, percentage, type) {

    var result = 0;

    if (type === "minus") {
        let initialamt = parseFloat(amount) * parseFloat(percentage) / 100;
        let amt = parseFloat(amount) - parseFloat(initialamt);
        let amt1 = await convert(amt);
        result = amt1;
    } else if (type === "add") {
        let initialamt = parseFloat(amount) * parseFloat(percentage) / 100;
        let amt = parseFloat(amount) + parseFloat(initialamt);
        let amt1 = await convert(amt);
        result = amt1;
    } else if (type === "percentage") {
        let initialamt = parseFloat(amount) * parseFloat(percentage) / 100;
        let amt1 = await convert(initialamt);
        result = amt1;
    }

    result = await isNumberCheck(result);
    return result;
}

export async function convertToWei(amount, decimals) {

    try {
        var result = 0;
        var web3 = new Web3(window.ethereum);
        if (decimals === 18) {
            result = web3.utils.toWei(amount.toString());
        } else {
            result = parseFloat(amount) * parseFloat(10 ** decimals);
        }
        return result.toString();
    } catch (err) {
        return "0";
    }


}

export async function getdeadline(minutes) {

    if (minutes === "" || minutes <= 0) {
        minutes = 2;
    }
    var deadline = parseInt(Date.now() / 1000) + minutes * 60;
    return deadline;
}

export async function toFixedFormat(amount) {

    var result = 0;

    try {
        var number = amount.toString();
        var number1 = number.split(".");

        if (number1[1] && number1[1].length && number1[1].length > 0) {
            var length = number1[1].length;
            if (length > 5) {
                length = config.toFixed;
            }
            result = amount.toFixed(length);
        } else {
            result = amount;
        }

        result = await isNumberCheck(result);

        return result;

    } catch (err) {
        return result;
    }

}

export async function divideDecimal(amount, decimals) {
    var amt = amount / 10 ** decimals;
    var convertamt = await convert(amt);
    var cAmt = await toFixedFormat(convertamt);
    cAmt = await isNumberCheck(cAmt);
    return cAmt;
}

export async function numberFloatOnly(value) {
    const regxFormat = /^[]?\d*(?:[.,]\d*)?$/;
    var result = regxFormat.test(value)
    return result;
}

export async function numberOnly(value) {
    const regxFormat = /^[0-9-+()]*$/;
    var result = regxFormat.test(value)
    return result;
}

export async function formatAddress(address) {
    try {
        var addr = address.substring(0, 6);
        var addr1 = address.substring(35, 42);
        var concat = addr + "...." + addr1;
        return concat;
    } catch (err) {
        return "";
    }
}

export async function division(amountA, amountB) {
    var amt = amountA / amountB;
    var convertamt = await convert(amt);
    convertamt = await isNumberCheck(convertamt);
    return convertamt;
}

export async function multiply(amountA, amountB) {
    var amt = amountA * amountB;
    var convertamt = await convert(amt);
    convertamt = await isNumberCheck(convertamt);
    return convertamt;
}

export async function toFixedWithoutRound(amount, dec = 2) {

    try {
        const calcDec = Math.pow(10, dec);
        var withoutFixed = Math.trunc(amount * calcDec) / calcDec;
        withoutFixed = await isNumberCheck(withoutFixed);
        return withoutFixed;

    } catch (err) {
        return 0;
    }

}

export async function isNumberCheck(amount) {
    var numberVal = amount;
    var convertamt = (isFinite(numberVal) && numberVal > 0 && numberVal !== "Infinity") ? numberVal : 0;
    return convertamt;
}

export async function ChecktokenDecimal(amount, decimals) {

    var result = 0;
    var decimalsLength = 18;
    if (decimals && decimals > 0) {
        decimalsLength = decimals;
    }

    try {
        var number = amount.toString();
        var number1 = number.split(".");

        if (number1[1] && number1[1].length && number1[1].length > 0) {
            var length = number1[1].length;
            if (length > decimalsLength) {
                length = decimals;
            }
            result = amount.toFixed(length);
        } else {
            result = amount;
        }

        result = await isNumberCheck(result);

        return result;

    } catch (err) {
        return result;
    }

}

export function shortText(address) {
    try {
        var addr = address.substring(0, 4);
        var addr1 = address.substring(36, 42);
        var concat = addr + "...." + addr1;
        return concat;
    } catch (err) {
        return "";
    }
}