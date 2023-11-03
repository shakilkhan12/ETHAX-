import RouterABI from "../ABI/RouterABI.json";
import config from "../config/config";
import { connection } from "../helper/connection";
import { convert } from "../helper/convert";
import { getdeadline, ChecktokenDecimal, multiply } from "../helper/custommath";
import { transferAmount } from "../ContractActions/bep20Actions";
import { addSwapFee } from "../Api/SwapActions";


export async function getAmountsInOut(method, args, args1, router) {
  var get = await connection();

  try {
    if (get && get.web3) {
      var web3 = get.web3;
      var Contract = new web3.eth.Contract(RouterABI, router);
      var amount = await convert(args);
      var amounts = await Contract.methods[method](
        amount.toString(),
        args1
      ).call();
      return {
        value: amounts,
        status: true,
      };
    } else {
      return {
        value: ["0", "0"],
        status: false,
      };
    }
  } catch (err) {

    return {
      value: ["0", "0"],
      status: false,
      error: err.message ? err.message : "",
    };
  }
}

export async function swapping(
  swapdata
) {
  var get = await connection();
  try {

    if (get && get.web3) {
      var web3 = get.web3;
      var address = get.address;
      var result = {};
      var Contract = new web3.eth.Contract(RouterABI, config.Router);
      var deadlineval = await getdeadline(5);

      if (swapdata.fromsymbol === config.ETHSYMBOL || swapdata.tosymbol === config.ETHSYMBOL) {

        if (swapdata.fromsymbol === config.ETHSYMBOL) {
          if (swapdata.id === "from") {

            let estimateGas = await Contract.methods.swapExactETHForTokens(
              swapdata.amountOutMin.toString(),
              swapdata.path,
              address,
              deadlineval.toString()
            ).estimateGas({ from: address, value: swapdata.payableAmount.toString() });
            let gesFee = parseFloat(estimateGas) + parseFloat(1000);

            let resp = await Contract.methods.swapExactETHForTokens(
              swapdata.amountOutMin.toString(),
              swapdata.path,
              address,
              deadlineval.toString()
            ).send({ from: address, value: swapdata.payableAmount.toString(), gas: gesFee });
            result = resp;

          } else {
            let estimateGas = await Contract.methods.swapETHForExactTokens(
              swapdata.amountOut.toString(),
              swapdata.path,
              address,
              deadlineval.toString()
            ).estimateGas({ from: address, value: swapdata.payableAmount.toString() });
            let gesFee = parseFloat(estimateGas) + parseFloat(1000);

            let resp = await Contract.methods.swapETHForExactTokens(
              swapdata.amountOut.toString(),
              swapdata.path,
              address,
              deadlineval.toString()
            ).send({ from: address, value: swapdata.payableAmount.toString(), gas: gesFee });
            result = resp;
          }
        } else {
          if (swapdata.id === "from") {
            let estimateGas = await Contract.methods.swapExactTokensForETH(
              swapdata.amountIn.toString(),
              swapdata.amountOutMin.toString(),
              swapdata.path,
              address,
              deadlineval.toString()
            ).estimateGas({ from: address });
            let gesFee = parseFloat(estimateGas) + parseFloat(1000);

            let resp = await Contract.methods.swapExactTokensForETH(
              swapdata.amountIn.toString(),
              swapdata.amountOutMin.toString(),
              swapdata.path,
              address,
              deadlineval.toString()
            ).send({ from: address, gas: gesFee });
            result = resp;
          } else {
            let estimateGas = await Contract.methods.swapTokensForExactETH(
              swapdata.amountOut.toString(),
              swapdata.amountInMax.toString(),
              swapdata.path,
              address,
              deadlineval.toString()
            ).estimateGas({ from: address });
            let gesFee = parseFloat(estimateGas) + parseFloat(1000);

            let resp = await Contract.methods.swapTokensForExactETH(
              swapdata.amountOut.toString(),
              swapdata.amountInMax.toString(),
              swapdata.path,
              address,
              deadlineval.toString()
            ).send({ from: address, gas: gesFee });
            result = resp;
          }
        }



      } else {


        if (swapdata.id === "from") {

          let estimateGas = await Contract.methods.swapExactTokensForTokens(
            swapdata.amountIn.toString(),
            swapdata.amountOutMin.toString(),
            swapdata.path,
            address,
            deadlineval.toString()
          ).estimateGas({ from: address });

          let gesFee = parseFloat(estimateGas) + parseFloat(1000);

          let resp = await Contract.methods.swapExactTokensForTokens(
            swapdata.amountIn.toString(),
            swapdata.amountOutMin.toString(),
            swapdata.path,
            address,
            deadlineval.toString()
          ).send({ from: address, gas: gesFee });
          result = resp;
        } else {
          let estimateGas = await Contract.methods.swapTokensForExactTokens(
            swapdata.amountOut.toString(),
            swapdata.amountInMax.toString(),
            swapdata.path,
            address,
            deadlineval.toString()
          ).estimateGas({ from: address });

          let gesFee = parseFloat(estimateGas) + parseFloat(1000);

          let resp = await Contract.methods.swapTokensForExactTokens(
            swapdata.amountOut.toString(),
            swapdata.amountInMax.toString(),
            swapdata.path,
            address,
            deadlineval.toString()
          ).send({ from: address, gas: gesFee });
          result = resp;
        }


      }


      return {
        value: result,
        status: true,
      };
    } else {
      return {
        value: "",
        status: false,
        error: "",
      };
    }
  } catch (err) {
    return {
      value: "",
      status: false,
      error: err && err.message ? err.message : "",
    };
  }
}

export async function adminFee(fromValue, fee, get, adminAddr) {

  try {

    var web3 = get.web3;
    var address = get.address;
    var txId = "";

    fee = await ChecktokenDecimal(fee, fromValue.decimals);
    var servicefee = await multiply(fee, 10 ** fromValue.decimals);
    var createTransaction = {};
    if (fromValue.symbol === config.ETHSYMBOL) {

      createTransaction = await web3.eth.sendTransaction(
        {
          from: address,
          to: adminAddr,
          value: web3.utils.toHex(servicefee),
          gas: '200000',
        }
      );
      txId = (createTransaction && createTransaction.transactionHash) ? createTransaction.transactionHash : "";
    } else {
      try {
        createTransaction = await transferAmount(fromValue.address, servicefee, adminAddr);
        txId = (createTransaction && createTransaction && createTransaction.value && createTransaction.value.transactionHash) ? createTransaction.value.transactionHash : "";
      } catch (err) {
      }

    }
    var feeDetails = {
      from: address,
      to: config.bitdriveReferal,
      token: fromValue.address,
      tokensymbol: fromValue.symbol,
      txId: txId,
      amount: fee
    }

    // addSwapFee(feeDetails);

    return feeDetails;
  } catch (err) {
  }
}

export async function addliqutity(
  tokenA,
  tokenB,
  amountADesired,
  amountBDesired,
  amountAMin,
  amountBMin
) {
  var get = await connection();
  try {
    if (get && get.web3) {
      var web3 = get.web3;
      var address = get.address;
      var Contract = new web3.eth.Contract(RouterABI, config.Router);
      var deadline = await getdeadline(2);

      var percentage = (amountAMin * 0.2) / 100;
      amountAMin = amountAMin - percentage;

      var percentage1 = (amountBMin * 0.2) / 100;
      amountBMin = amountBMin - percentage1;

      amountADesired = await convert(amountADesired);
      amountBDesired = await convert(amountBDesired);
      amountAMin = await convert(amountAMin);
      amountBMin = await convert(amountBMin);

      var result = await Contract.methods
        .addLiquidity(
          tokenA,
          tokenB,
          amountADesired.toString(),
          amountBDesired.toString(),
          amountAMin.toString(),
          amountBMin.toString(),
          address,
          deadline
        )
        .send({ from: address });

      var lpValue = (result && result.events && result.events[4] &&
        result.events[4].raw && result.events[4].raw.data) ? result.events[4].raw.data : "";
      var lpAmount = 0;
      if (lpValue !== "") {
        lpAmount = parseFloat(await web3.utils.hexToNumberString(lpValue));
      }


      return {
        value: result,
        lpAmount: lpAmount,
        status: true,
      };
    } else {
      return {
        value: "",
        status: false,
      };
    }
  } catch (err) {
    return {
      value: "",
      status: false,
    };
  }
}

export async function addliqutityETH(
  token,
  amountTokenDesired,
  amountTokenMin,
  amountETHMin
) {
  var get = await connection();
  try {
    if (get && get.web3) {

      var web3 = get.web3;
      var address = get.address;
      var Contract = new web3.eth.Contract(RouterABI, config.Router);

      var deadline = await getdeadline(2);

      var amountETHMin1 = parseFloat(amountETHMin) * 2 / 100;
      amountETHMin1 = amountETHMin1 - amountETHMin1;

      amountTokenDesired = await convert(amountTokenDesired);
      amountTokenMin = await convert(amountTokenMin);
      amountETHMin1 = await convert(amountETHMin1);

      var result = await Contract.methods
        .addLiquidityETH(
          token,
          amountTokenDesired.toString(),
          amountTokenMin.toString(),
          amountETHMin1.toString(),
          address,
          deadline
        )
        .send({ from: address, value: amountETHMin });
      return {
        value: result,
        status: true,
      };
    } else {
      return {
        value: "",
        status: false,
      };
    }
  } catch (err) {

    return {
      value: "",
      status: false,
    };
  }
}

export async function removeLiquidity(
  tokenA,
  tokenB,
  liquidity,
  amountAMin,
  amountBMin
) {
  var get = await connection();
  try {
    if (get && get.web3) {
      var web3 = get.web3;
      var address = get.address;
      var Contract = new web3.eth.Contract(RouterABI, config.Router);
      var deadline = await getdeadline(2);
      var liquidityVal = liquidity.toString();

      await Contract.methods
        .removeLiquidity(
          tokenA,
          tokenB,
          liquidityVal,
          amountAMin,
          amountBMin,
          address,
          deadline
        )
        .estimateGas({ from: address });

      var result = await Contract.methods
        .removeLiquidity(
          tokenA,
          tokenB,
          liquidityVal,
          amountAMin,
          amountBMin,
          address,
          deadline
        )
        .send({ from: address });

      return {
        value: result,
        status: true,
      };
    } else {

      return {
        value: "",
        status: false,
      };
    }
  } catch (err) {

    return {
      value: "",
      status: false,
    };
  }
}

export async function removeLiquidityETH(
  token,
  removeLiq,
  amountAMin,
  amountBMin
) {
  var get = await connection();
  try {
    if (get && get.web3) {
      var web3 = get.web3;
      var address = get.address;
      var Contract = new web3.eth.Contract(RouterABI, config.Router);
      var deadline = await getdeadline(2);
      var liquidityVal = removeLiq.toString();

      await Contract.methods
        .removeLiquidityETH(
          token,
          liquidityVal,
          amountAMin,
          amountBMin,
          address,
          deadline
        )
        .estimateGas({ from: address });

      var result = await Contract.methods
        .removeLiquidityETH(
          token,
          liquidityVal,
          amountAMin,
          amountBMin,
          address,
          deadline
        )
        .send({ from: address });
      return {
        value: result,
        status: true,
      };
    } else {
      return {
        value: "",
        status: false,
      };
    }
  } catch (err) {

    return {
      value: "",
      status: false,
    };
  }
}
