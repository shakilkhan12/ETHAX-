import MasterChef from "../ABI/MasterChef.json";
import LPABI from "../ABI/LPABI.json";
import BEP20 from "../ABI/BEP20.json";
import ABI from "../ABI/abi";
import config from "../config/config";
import Web3 from "web3";
import { connection } from "../helper/connection";
import JSBI from 'jsbi/dist/jsbi.mjs';
import {
  Multicall
} from "ethereum-multicall";

import {
  convertToWei,
  divideDecimal
} from "../helper/custommath";
import BigNumber from "bignumber.js";

import {
  convert
} from "../helper/convert"
import { getFormData, } from '../Api/FarmActions';
import { getPoolData } from '../Api/PoolActions';
import farmsTokenlists from "../views/Tokenlists/farmsTokenlists.json"
import poolsTokenlists from '../views/Tokenlists/poolsTokenlists.json'
import farmsconfig from "../views/HomeCalculation/AllTokens.json"

var zeroAddr = "0x0000000000000000000000000000000000000000";

export async function getFormsDetails(data) {
  var get = await connection();
  try {

    var web3 = get.web3;
    if (web3 === "" || !web3) {
      web3 = new Web3(config.netWorkUrl);
    }
    var address = zeroAddr;
    if (get.address && get.address !== "") {
      address = get.address;
    }

    // let { result } = await getFormData(data);
    // var range = (result && result.length > 0) ? result : [];
    var range = farmsTokenlists && farmsTokenlists.tokens ? farmsTokenlists.tokens : []


    const multicall = new Multicall({
      web3Instance: web3,
    });

    var pollArray = [];
    var obj = {};
    if (range && range.length > 0) {
      for (var i in range) {
        var ran = range[i].pid;

        var masterChefContract = [
          {
            reference: "poolInfo",
            contractAddress: config.MasterChef,
            abi: MasterChef,
            calls: [
              {
                reference: "poolInfo",
                methodName: "poolInfo",
                methodParameters: [ran],
              },
              {
                reference: "userInfo",
                methodName: "userInfo",
                methodParameters: [ran, address],
              },
              {
                reference: "ethaxApy",
                methodName: "ethaxApy",
                methodParameters: [],
              },
            ]
          }
        ];

        const poolresults = await multicall.call(masterChefContract);

        var poolinfo = await getFormatMulticall(poolresults, "poolInfo", 0);
        var stakeBal = await getFormatMulticall(poolresults, "poolInfo", 1);
        var ethaxApy = await getFormatMulticall(poolresults, "poolInfo", 2);

        var contractCallContext = [
          {
            reference: "LPtokengetBalanceof",
            contractAddress: poolinfo[0],
            abi: LPABI,
            calls: [
              {
                reference: "balanceOf",
                methodName: "balanceOf",
                methodParameters: [address],
              },
              {
                reference: "balanceOf",
                methodName: "balanceOf",
                methodParameters: [config.MasterChef],
              },
              {
                reference: "allowance",
                methodName: "allowance",
                methodParameters: [address, config.MasterChef],
              }
              // {
              //   reference: "symbol",
              //   methodName: "symbol",
              // },
            ],
          }
        ];

        const results = await multicall.call(contractCallContext);

        var LPtokengetBalanceof = await getFormatMulticall(results, "LPtokengetBalanceof", 0);
        var LPtokengettotalSupply = await getFormatMulticall(results, "LPtokengetBalanceof", 1);
        var ApprovedAlready = await getFormatMulticall(results, "LPtokengetBalanceof", 2);
        // var symboll = await getFormatMulticall(results, "LPtokengetBalanceof", 3);

        LPtokengettotalSupply = await divideDecimal(parseInt(LPtokengettotalSupply.hex), 18);
        LPtokengetBalanceof = await divideDecimal(parseInt(LPtokengetBalanceof.hex), 18);
        ApprovedAlready = await divideDecimal(parseInt(ApprovedAlready.hex), 18);
        var stakeBalance = await divideDecimal(parseInt(stakeBal[0].hex), 18);

        obj = {
          tokenA: range[i].tokenSymbol,
          tokenB: range[i].quoteTokenSymbol,
          lpSymbol: range[i].lpSymbol,
          TotalSupply: LPtokengettotalSupply,
          LPBalance: LPtokengetBalanceof,
          endsIn: 0,
          LPaddress: poolinfo[0],
          allowance: ApprovedAlready,
          pid: ran,
          stakeBal: stakeBalance,
          stakeBalOf: parseInt(stakeBal[0].hex),
          earned: 0,
          apr: 0,
          logoURI: range[i].logoURI,
          depositFee: poolinfo[1] / 100,
          apy: parseInt(ethaxApy.hex) / 100,
          status: range[i].status,
          symboll: range[i].addsymbol
        };

        pollArray.push(obj);

      }
    }
    return {
      value: pollArray,
      status: true,
    };

  } catch (err) {
    console.log('err: ', err);
    return {
      value: "Ero",
      status: false,
    };
  }
}

export async function fetchPoolsDetails(data) {
  var get = await connection();
  // return;
  try {

    var web3 = get.web3;
    if (web3 === "" || !web3) {
      web3 = new Web3(config.netWorkUrl);
    }
    var address = zeroAddr;
    if (get.address && get.address !== "") {
      address = get.address;
    }

    // let { result} = await getPoolData(data);
    // var range = (result && result.length > 0) ? result : [];
    var range = poolsTokenlists && poolsTokenlists.tokens ? poolsTokenlists.tokens : []

    const multicall = new Multicall({
      web3Instance: web3,
    });

    var pollArray = [];
    var obj = {};
    if (range) {
      for (var i in range) {
        var ran = range[i].pid;

        var masterChefContract = [
          {
            reference: "poolInfo",
            contractAddress: config.MasterChef,
            abi: MasterChef,
            calls: [
              {
                reference: "poolInfo",
                methodName: "poolInfo",
                methodParameters: [ran],
              },
              {
                reference: "userInfo",
                methodName: "userInfo",
                methodParameters: [ran, address],
              },
              {
                reference: "ethaxApy",
                methodName: "ethaxApy",
                methodParameters: [],
              },
            ]
          }
        ];

        const poolresults = await multicall.call(masterChefContract);


        var poolinfo = await getFormatMulticall(poolresults, "poolInfo", 0);
        var stakeBal = await getFormatMulticall(poolresults, "poolInfo", 1);
        var ethaxApy = await getFormatMulticall(poolresults, "poolInfo", 2);

        const contractCallContext = [
          {
            reference: "LPtokengetBalanceof",
            contractAddress: poolinfo[0],
            abi: LPABI,
            calls: [
              {
                reference: "balanceOf",
                methodName: "balanceOf",
                methodParameters: [address],
              },
              {
                reference: "balanceOf",
                methodName: "balanceOf",
                methodParameters: [config.MasterChef],
              },
              {
                reference: "allowance",
                methodName: "allowance",
                methodParameters: [address, config.MasterChef],
              },
            ],
          }
        ];

        const results = await multicall.call(contractCallContext);

        var LPtokengetBalanceof1 = await getFormatMulticall(results, "LPtokengetBalanceof", 0);
        var LPtokengettotalSupply1 = await getFormatMulticall(results, "LPtokengetBalanceof", 1);
        var ApprovedAlready = await getFormatMulticall(results, "LPtokengetBalanceof", 2);

        var TotalSupply = await divideDecimal(parseInt(LPtokengettotalSupply1.hex), 18);
        LPtokengetBalanceof1 = await divideDecimal(parseInt(LPtokengetBalanceof1.hex), 18);
        ApprovedAlready = await divideDecimal(parseInt(ApprovedAlready.hex), 18);
        var stakeBal = await divideDecimal(parseInt(stakeBal[0].hex), 18);

        obj = {
          lpSymbol: range[i].lpSymbol,
          TotalSupply: parseFloat(TotalSupply),
          LPBalance: parseFloat(LPtokengetBalanceof1),
          LPaddress: poolinfo[0],
          allowance: ApprovedAlready,
          pid: ran,
          stakeBal: stakeBal,
          earned: 0,
          apy: parseInt(ethaxApy.hex) / 100,
          lastRewardBlock: 0,
          logoURI: range[i].logoURI,
          depositFee: poolinfo[1] / 100,
          status: range[i].status,
          sousID: range[i].sousId,
          earnedDollarValue: 0
        };


        pollArray.push(obj);

      }
    }
    return {
      value: pollArray,
      status: true,
    };

  } catch (err) {
    console.log('eeererrr: ', err);
    return {
      value: "Ero",
      status: false,
    };
  }
}

export async function getDetails(type, data) {
  var get = await connection();
  // return;
  try {

    var web3 = get.web3;
    if (web3 === "" || !web3) {
      web3 = new Web3(config.netWorkUrl);
    }
    var address = zeroAddr;
    if (get.address && get.address !== "") {
      address = get.address;
    }

    var range = [];
    var count = 0;
    var apy = 0;
    if (type === "farm") {
      // let { result, totalrecords } = await getFormData(data);
      // var getForms = farmsList.filter(val => val.isTokenOnly == false);
      var range = farmsTokenlists && farmsTokenlists.tokens ? farmsTokenlists.tokens : []

      // range = result;
      count = 2;
      // apy=apy;
    } else {
      // let { result, totalrecords } = await getPoolData(data);
      var range = poolsTokenlists && poolsTokenlists.tokens ? poolsTokenlists.tokens : []


      // var getForms1 = farmsList.filter(val => val.isTokenOnly == true);
      // range = result;
      count = 1;
      // apy=apy;
    }

    const multicall = new Multicall({
      web3Instance: web3,
    });

    var pollArray = [];
    var obj = {};
    if (range) {
      for (var i in range) {
        var ran = range[i].pid;

        var masterChefContract = [
          {
            reference: "poolInfo",
            contractAddress: config.MasterChef,
            abi: MasterChef,
            calls: [
              {
                reference: "poolInfo",
                methodName: "poolInfo",
                methodParameters: [ran],
              },
              {
                reference: "userInfo",
                methodName: "userInfo",
                methodParameters: [ran, address],
              },
            ]
          }
        ];

        const poolresults = await multicall.call(masterChefContract);

        var poolinfo = await getFormatMulticall(poolresults, "poolInfo", 0);
        var stakeBal = await getFormatMulticall(poolresults, "poolInfo", 1);


        if (type === "farm") {

          var contractCallContext = [
            {
              reference: "LPtokengetBalanceof",
              contractAddress: poolinfo[0],
              abi: LPABI,
              calls: [
                {
                  reference: "balanceOf",
                  methodName: "balanceOf",
                  methodParameters: [address],
                },
                {
                  reference: "balanceOf",
                  methodName: "balanceOf",
                  methodParameters: [config.MasterChef],
                },
                {
                  reference: "allowance",
                  methodName: "allowance",
                  methodParameters: [address, config.MasterChef],
                }
              ],
            }
          ];

          const results = await multicall.call(contractCallContext);

          var LPtokengetBalanceof = await getFormatMulticall(results, "LPtokengetBalanceof", 0);
          var LPtokengettotalSupply = await getFormatMulticall(results, "LPtokengetBalanceof", 1);
          var ApprovedAlready = await getFormatMulticall(results, "LPtokengetBalanceof", 2);

          LPtokengettotalSupply = await divideDecimal(parseInt(LPtokengettotalSupply.hex), 18);
          LPtokengetBalanceof = await divideDecimal(parseInt(LPtokengetBalanceof.hex), 18);
          ApprovedAlready = await divideDecimal(parseInt(ApprovedAlready.hex), 18);
          var stakeBalance = await divideDecimal(parseInt(stakeBal[0].hex), 18);

          obj = {
            tokenA: range[i].tokenSymbol,
            tokenB: range[i].quoteTokenSymbol,
            lpSymbol: range[i].lpSymbol,
            TotalSupply: LPtokengettotalSupply,
            LPBalance: LPtokengetBalanceof,
            endsIn: 0,
            LPaddress: poolinfo[0],
            allowance: ApprovedAlready,
            pid: ran,
            stakeBal: stakeBalance,
            stakeBalOf: parseInt(stakeBal[0].hex),
            earned: 0,
            apr: 0,
            logoURI: range[i].logoURI,
            depositFee: poolinfo[1] / 100,
            apy: parseInt(poolinfo[2].hex) / 100,
            status: range[i].status,
          };

          pollArray.push(obj);
        } else if (type === "pool") {

          const contractCallContext = [
            {
              reference: "LPtokengetBalanceof",
              contractAddress: poolinfo[0],
              abi: LPABI,
              calls: [
                {
                  reference: "balanceOf",
                  methodName: "balanceOf",
                  methodParameters: [address],
                },
                {
                  reference: "balanceOf",
                  methodName: "balanceOf",
                  methodParameters: [config.MasterChef],
                },
                {
                  reference: "allowance",
                  methodName: "allowance",
                  methodParameters: [address, config.MasterChef],
                },
              ],
            }
          ];

          const results = await multicall.call(contractCallContext);

          var LPtokengetBalanceof1 = await getFormatMulticall(results, "LPtokengetBalanceof", 0);
          var LPtokengettotalSupply1 = await getFormatMulticall(results, "LPtokengetBalanceof", 1);
          var ApprovedAlready = await getFormatMulticall(results, "LPtokengetBalanceof", 2);

          var TotalSupply = await divideDecimal(parseInt(LPtokengettotalSupply1.hex), 18);
          LPtokengetBalanceof1 = await divideDecimal(parseInt(LPtokengetBalanceof1.hex), 18);
          ApprovedAlready = await divideDecimal(parseInt(ApprovedAlready.hex), 18);
          var stakeBal = await divideDecimal(parseInt(stakeBal[0].hex), 18);

          obj = {
            lpSymbol: range[i].lpSymbol,
            TotalSupply: parseFloat(TotalSupply),
            LPBalance: parseFloat(LPtokengetBalanceof1),
            LPaddress: poolinfo[0],
            allowance: ApprovedAlready,
            pid: ran,
            stakeBal: stakeBal,
            earned: 0,
            apy: parseInt(poolinfo[2].hex) / 100,
            lastRewardBlock: 0,
            logoURI: range[i].logoURI,
            depositFee: poolinfo[1] / 100,
            status: range[i].status,
          };


          pollArray.push(obj);
        }
      }
    }
    return {
      value: pollArray,
      count: count,
      status: true,
    };

  } catch (err) {
    return {
      value: "Ero",
      status: false,
    };
  }
}

export async function approvetoken(LPaddress) {
  var get = await connection();
  try {
    if (get && get.web3) {
      var web3 = get.web3;
      var address = get.address;

      var Contract = new web3.eth.Contract(LPABI, LPaddress);

      var approveAmt = (100000000) * (10 ** 18);
      approveAmt = await convert(approveAmt);

      await Contract.methods
        .approve(config.MasterChef, approveAmt.toString())
        .send({ from: address });

      return {
        value: "Approved success",
        status: true,
        approveAmt
      };
    } else {
      return {
        value: "Web3 Error",
        status: false,
        approveAmt: 0
      };
    }
  } catch (err) {
    return {
      value: "Ero",
      status: false,
      approveAmt: 0
    };
  }
}

export async function stake(pid, amount, LPaddress, lpBal) {

  var get = await connection();
  try {
    if (get && get.web3) {
      var web3 = get.web3;
      var address = get.address;

      var Contract = new web3.eth.Contract(LPABI, LPaddress);
      var bal = await Contract.methods.balanceOf(address).call();
      var amo = await convertToWei(amount, 18);
      amo = amo.toString();

      var checkallowance = await Contract.methods.allowance(
        address,
        config.MasterChef
      ).call();
      checkallowance = parseFloat(checkallowance) / 1e18;
      checkallowance = parseFloat(checkallowance).toFixed(config.toFixed);



      if (parseFloat(lpBal) === parseFloat(amount)) {
        amo = JSBI.BigInt(await Contract.methods.balanceOf(address).call());
        amo = String(amo);
      }

      if (parseFloat(bal) < parseFloat(amo)) {

        return {
          value: "Your balance is too low",
          status: false,
        };
      }

      var ContractM = new web3.eth.Contract(MasterChef, config.MasterChef);
      //var amo = amount * 1000000000000000000;


      try {
        if (parseFloat(checkallowance) < parseFloat(amount)) {

          var Contract = new web3.eth.Contract(LPABI, LPaddress);
          var approveAmt = (100000000) * (10 ** 18);
          approveAmt = await convert(approveAmt);

          await Contract.methods
            .approve(config.MasterChef, approveAmt.toString())
            .send({ from: address });

          await ContractM.methods.deposit(pid, amo).estimateGas({ from: address });
          await ContractM.methods.deposit(pid, amo).send({ from: address });
        }

        else {
          await ContractM.methods.deposit(pid, amo).estimateGas({ from: address });
          await ContractM.methods.deposit(pid, amo).send({ from: address });
        }

      } catch (err) {
        console.log(err, 'errerrerrerrerr')
        return {
          value: "Ero",
          status: false,
        };

      }

      return {
        value: "Staked success",
        status: true,
      };
    } else {
      return {
        value: "Web3 Error",
        status: false,
      };
    }
  } catch (err) {
    console.log(err, 'errerrerrerrerr')
    return {
      value: "Ero",
      status: false,
    };
  }
}

export async function stakePool(pid, amount, LPaddress, lpBal) {

  var get = await connection();
  try {
    if (get && get.web3) {

      var web3 = get.web3;
      var address = get.address;

      var Contract = new web3.eth.Contract(BEP20, LPaddress);
      var bal = await Contract.methods.balanceOf(address).call();

      var checkallowance = await Contract.methods.allowance(
        address,
        config.MasterChef
      ).call();
      checkallowance = parseFloat(checkallowance) / 1e18;
      checkallowance = parseFloat(checkallowance).toFixed(config.toFixed);


      if (parseFloat(bal) < parseFloat(amount)) {
        return {
          value: "Your balance is too low",
          status: false,
        };
      }

      var ContractM = new web3.eth.Contract(MasterChef, config.MasterChef);
      var amo = await convertToWei(amount, 18);
      amo = amo.toString()

      if (parseFloat(lpBal) === parseFloat(amount)) {
        amo = JSBI.BigInt(await Contract.methods.balanceOf(address).call());
        amo = String(amo);
      }
      try {
        if (parseFloat(checkallowance) < parseFloat(amount)) {

          var Contract = new web3.eth.Contract(BEP20, LPaddress);

          var approveAmt = (100000000) * (10 ** 18);
          approveAmt = await convert(approveAmt);

          await Contract.methods
            .approve(config.MasterChef, approveAmt.toString())
            .send({ from: address });

          await ContractM.methods.deposit(pid, amo).estimateGas({ from: address });
          await ContractM.methods.deposit(pid, amo).send({ from: address });

        }
        else {
          await ContractM.methods.deposit(pid, amo).estimateGas({ from: address });
          await ContractM.methods.deposit(pid, amo).send({ from: address });
        }


      } catch (err) {
        console.log('errerer: ', err);
        return {
          value: "Ero",
          status: false,
        };
      }


      return {
        value: "Staked success",
        status: true,
      };
    } else {
      return {
        value: "Web3 Error",
        status: false,
      };
    }
  } catch (err) {
    console.log('err33333: ', err);
    return {
      value: "Ero",
      status: false,
    };
  }
}


export async function harverstpool(pid, type) {
  var get = await connection();
  try {
    if (get && get.web3) {
      var web3 = get.web3;
      var address = get.address;
      var ContractM = new web3.eth.Contract(MasterChef, config.MasterChef);
      var bal = await ContractM.methods.pendingEthax(pid, address).call();
      bal = await convert(bal)

      if (bal === 0 || bal === "0" || parseFloat(bal) < 0) {
        return {
          value: "Insufficient reward earned",
          status: false,
        };
      }

      if (type == 'harvest') {
     
        await ContractM.methods
          .deposit(pid, 0)
          .send({ from: address });
        return {
          value: "Withdraw Successful",
          status: true,
        };
      }
      else {
        try {
          var Contract = new web3.eth.Contract(BEP20, config.EthaxAddress);
          var checkallowance = await Contract.methods.allowance(
            address,
            config.MasterChef
          ).call();
          checkallowance = parseFloat(checkallowance) / 1e18;
          // checkallowance = parseFloat(checkallowance).toFixed(config.toFixed);
          var balance = parseFloat(bal) / 1e18

          if (parseFloat(checkallowance) < parseFloat(balance)) {
            var approveAmt = (100000000) * (10 ** 18);
            approveAmt = await convert(approveAmt);

            await Contract.methods
              .approve(config.MasterChef, approveAmt.toString())
              .send({ from: address });

            await ContractM.methods.deposit(pid, bal).estimateGas({ from: address });
            await ContractM.methods.deposit(pid, bal).send({ from: address });
            return {
              value: "Deposit Successful",
              status: true,
            };
          }
          else {
            await ContractM.methods.deposit(pid, bal).estimateGas({ from: address });
            await ContractM.methods.deposit(pid, bal).send({ from: address });
            return {
              value: "Deposit Successful",
              status: true,
            };
          }


        } catch (err) {
          console.log('errerer: ', err);
          return {
            value: "Ero",
            status: false,
          };
        }
      }

    } else {
      return {
        value: "Web3 Error",
        status: false,
      };
    }
  } catch (err) {
    console.log('errssswews: ', err);
    return {
      value: "Ero",
      status: false,
    };
  }
}


export async function harverst(pid) {
  var get = await connection();
  try {
    if (get && get.web3) {
      var web3 = get.web3;
      var address = get.address;

      var ContractM = new web3.eth.Contract(MasterChef, config.MasterChef);

      var bal = await ContractM.methods.pendingEthax(pid, address).call();

      if (bal === 0 || bal === "0" || parseFloat(bal) < 0) {
        return {
          value: "Insufficient reward earned",
          status: false,
        };
      }

      await ContractM.methods
        .deposit(pid, 0)
        .send({ from: address });

      return {
        value: "Withdraw Successful",
        status: true,
      };
    } else {
      return {
        value: "Web3 Error",
        status: false,
      };
    }
  } catch (err) {
    return {
      value: "Ero",
      status: false,
    };
  }
}

export async function getreward(details) {
  var get = await connection();
  try {
    if (get && get.web3) {
      var web3 = get.web3;
      var address = get.address;
      var ContractM = new web3.eth.Contract(MasterChef, config.MasterChef);
      var pollArray = [];
      if (details) {
        for (var i in details) {
          var ran = details[i].pid;
          var bal = await ContractM.methods.pendingEthax(ran, address).call();
          pollArray.push({
            bal: bal,
            pid: ran
          });
        }
      }

      return {
        value: pollArray,
        status: true,
      };
    } else {
      return {
        value: "Web3 Error",
        status: false,
      };
    }
  } catch (err) {
    return {
      value: "Ero",
      status: false,
    };
  }
}

export async function unstake(amount, pid, unstakeBal) {
  var get = await connection();
  try {

    if (get && get.web3) {
      var web3 = get.web3;
      var address = get.address;
      var ContractM = new web3.eth.Contract(MasterChef, config.MasterChef);

      var stakeBalance = await ContractM.methods.userInfo(pid, address).call();
      var stakeBal = (stakeBalance && stakeBalance[0]) ? parseFloat(stakeBalance[0]) / 10 ** 18 : 0

      if (unstakeBal < amount) {
        return {
          value: "Invalid Amount",
          status: true,
        };
      }

      var amo = await convertToWei(amount, 18);
      amo = amo.toString();
      if (parseFloat(amount) === parseFloat(unstakeBal)) {
        amo = JSBI.BigInt(stakeBalance[0]);
        amo = String(amo);
      }

      try {
        await ContractM.methods.withdraw(pid, amo).estimateGas({ from: address });
        await ContractM.methods.withdraw(pid, amo).send({ from: address });
      } catch (err) {
        console.log(err, "unstack error ----------122")
        return {
          value: "Web3 Error",
          status: false,
        };
      }


      return {
        value: "Staked success",
        status: true,
      };
    } else {
      return {
        value: "Web3 Error",
        status: false,
      };
    }
  } catch (err) {
    console.log('err: ', err);
    return {
      value: "Ero",
      status: false,
    };
  }
}

export async function getStakeUnstakeBalance(pid, lpaddress) {

  var get = await connection();
  // return;
  try {

    var web3 = get.web3;
    if (web3 === "" || !web3) {
      web3 = new Web3(config.netWorkUrl);
    }
    var address = zeroAddr;
    if (get.address && get.address !== "") {
      address = get.address;
    }
    const multicall = new Multicall({
      web3Instance: web3,
    });
    var masterChefContract = [
      {
        reference: "poolInfo",
        contractAddress: config.MasterChef,
        abi: MasterChef,
        calls: [

          {
            reference: "userInfo",
            methodName: "userInfo",
            methodParameters: [pid, address],
          },
        ]
      },
      {
        reference: "LPtokengetBalanceof",
        contractAddress: lpaddress,
        abi: LPABI,
        calls: [
          {
            reference: "balanceOf",
            methodName: "balanceOf",
            methodParameters: [address],
          },
          {
            reference: "balanceOf",
            methodName: "balanceOf",
            methodParameters: [config.MasterChef],
          },
        ]
      }
    ];


    const poolresults = await multicall.call(masterChefContract);
    var stakeBal = await getFormatMulticall(poolresults, "poolInfo", 0);
    var lpBal = await getFormatMulticall(poolresults, "LPtokengetBalanceof", 0);
    var totalSupply = await getFormatMulticall(poolresults, "LPtokengetBalanceof", 1);

    stakeBal = (stakeBal && stakeBal[0] && stakeBal[0].hex) ? await divideDecimal(parseInt(stakeBal[0].hex), 18) : 0;
    lpBal = (lpBal && lpBal.hex) ? await divideDecimal(parseInt(lpBal.hex), 18) : 0;
    totalSupply = (totalSupply && totalSupply.hex) ? await divideDecimal(parseInt(totalSupply.hex), 18) : 0;

    return {
      stakeBal: parseFloat(stakeBal),
      lpBal: parseFloat(lpBal),
      totalSupply: parseFloat(totalSupply),
    }

  } catch (err) {
    console.log(err, 'errerrerrerrerrerrerr')
    return {
      stakeBal: 0,
      lpBal: 0
    }
  }

}

export async function getEthaxHomeDetails() {

  var get = await connection();
  // return;
  try {

    var web3 = get.web3;
    if (web3 === "" || !web3) {
      web3 = new Web3(config.netWorkUrl);
    }
    var address = zeroAddr;
    if (get.address && get.address !== "") {
      address = get.address;
    }
    const multicall = new Multicall({
      web3Instance: web3,
    });
    var masterChefContract = [
      {
        reference: "poolInfo",
        contractAddress: config.MasterChef,
        abi: MasterChef,
        calls: [

          {
            reference: "userInfo",
            methodName: "userInfo",
            methodParameters: [0, address],
          },
          {
            reference: "userInfo1",
            methodName: "userInfo",
            methodParameters: [1, address],
          },
          {
            reference: "userInfo2",
            methodName: "userInfo",
            methodParameters: [2, address],
          },
          {
            reference: "pendingEthax",
            methodName: "pendingEthax",
            methodParameters: [0, address],
          },
          {
            reference: "pendingEthax1",
            methodName: "pendingEthax",
            methodParameters: [1, address],
          },
          {
            reference: "pendingEthax2",
            methodName: "pendingEthax",
            methodParameters: [2, address],
          }
        ]
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
      {
        reference: "balanceOfUser",
        contractAddress: config.EthaxAddress,
        abi: ABI,
        calls: [
          {
            reference: "balanceOf",
            methodName: "balanceOf",
            methodParameters: [address],
          }
        ],
      },
    ];


    const poolresults = await multicall.call(masterChefContract);


    var EthlpBAl = await getFormatMulticall(poolresults, "balanceOfETHLP", 0);
    EthlpBAl = new BigNumber(EthlpBAl.hex, 16);
    EthlpBAl = EthlpBAl.toString(10);
    EthlpBAl = EthlpBAl / 1e18;


    var balanceOfUser = await getFormatMulticall(poolresults, "balanceOfUser", 0);
    balanceOfUser = new BigNumber(balanceOfUser.hex, 16);
    balanceOfUser = balanceOfUser.toString(10);
    balanceOfUser = balanceOfUser / 1e18;

    var BusdLpbal = await getFormatMulticall(poolresults, "balanceOfBusdLP", 0);

    BusdLpbal = new BigNumber(BusdLpbal.hex, 16);
    BusdLpbal = BusdLpbal.toString(10);
    BusdLpbal = BusdLpbal / 1e18;

    var busdprice = BusdLpbal / EthlpBAl;

    let lockeddollarvalue = parseFloat(balanceOfUser).toFixed(3) * parseFloat(busdprice).toFixed(3)

    var stakeBal = await getFormatMulticall(poolresults, "poolInfo", 0);
    var stakeBalone = await getFormatMulticall(poolresults, "poolInfo", 1);
    var stakeBaltwo = await getFormatMulticall(poolresults, "poolInfo", 2);

    var pendingEthax = await getFormatMulticall(poolresults, "poolInfo", 3);
    var pendingEthaxOne = await getFormatMulticall(poolresults, "poolInfo", 4);
    var pendingEthaxTwo = await getFormatMulticall(poolresults, "poolInfo", 5);

    pendingEthax = (pendingEthax && pendingEthax && pendingEthax.hex) ? await divideDecimal(parseInt(pendingEthax.hex), 18) : 0;
    pendingEthaxOne = (pendingEthaxOne && pendingEthaxOne && pendingEthaxOne.hex) ? await divideDecimal(parseInt(pendingEthaxOne.hex), 18) : 0;
    pendingEthaxTwo = (pendingEthaxTwo && pendingEthaxTwo && pendingEthaxTwo.hex) ? await divideDecimal(parseInt(pendingEthaxTwo.hex), 18) : 0;

    var finalpendingValue = parseFloat(pendingEthax) + parseFloat(pendingEthaxOne) + parseFloat(pendingEthaxTwo);
    var totalpendingValue = parseFloat(busdprice) * parseFloat(finalpendingValue)


    stakeBal = (stakeBal && stakeBal[0] && stakeBal[0].hex) ? await divideDecimal(parseInt(stakeBal[0].hex), 18) : 0;
    stakeBalone = (stakeBalone && stakeBalone[0] && stakeBalone[0].hex) ? await divideDecimal(parseInt(stakeBalone[0].hex), 18) : 0;
    stakeBaltwo = (stakeBaltwo && stakeBaltwo[0] && stakeBaltwo[0].hex) ? await divideDecimal(parseInt(stakeBaltwo[0].hex), 18) : 0;
    var lockedValue = parseFloat(stakeBal) + parseFloat(stakeBalone) + parseFloat(stakeBaltwo)
    lockedValue = parseFloat(busdprice) * parseFloat(lockedValue)

    return {
      lockedValue: parseFloat(lockedValue),
      finalpendingValue: parseFloat(finalpendingValue),
      totalpendingValue: parseFloat(totalpendingValue),
      balanceOfUser: parseFloat(balanceOfUser),
      lockeddollarvalue: parseFloat(lockeddollarvalue)
    }

  } catch (err) {
    console.log(err, 'errerrerrerrerrerrerr')
    return {
      lockedValue: 0,
      finalpendingValue: 0,
      totalpendingValue: 0,
      balanceOfUser: 0,
      lockeddollarvalue: 0
    }
  }

}

export const BIG_TEN = new BigNumber(10)

export async function getTotalValueLocked() {
  var get = await connection();
  // return;
  try {
    var web3 = get.web3;
    if (web3 === "" || !web3) {
      web3 = new Web3(config.netWorkUrl);
    }
    var address = zeroAddr;
    if (get.address && get.address !== "") {
      address = get.address;
    }
    const multicall = new Multicall({
      web3Instance: web3,
    });
    const datas = await Promise.all(farmsconfig && farmsconfig.tokens && farmsconfig.tokens.length > 0
      && farmsconfig.tokens.map(async (farmConfig) => {
        const lpAdress = farmConfig.lpAddresses[config.NetworkId];
        var masterChefContract = [
          {
            reference: "InfoOne",
            contractAddress: farmConfig.tokenAddresses,
            abi: ABI,
            calls: [
              {
                reference: "balanceOf",
                methodName: "balanceOf",
                methodParameters: [lpAdress]
              }
            ]
          },

          {
            reference: "InfoTwo",
            contractAddress: farmConfig.quoteTokenAdresses,
            abi: ABI,
            calls: [
              {
                reference: "balanceOf",
                methodName: "balanceOf",
                methodParameters: [lpAdress]
              }
            ]
          },

          {
            reference: "InfoThree",
            contractAddress: lpAdress,
            abi: LPABI,
            calls: [
              {
                reference: "balanceOf",
                methodName: "balanceOf",
                methodParameters: [config.MasterChef]
              }
            ]
          },
          {
            reference: "InfoFour",
            contractAddress: lpAdress,
            abi: LPABI,
            calls: [
              {
                reference: "totalSupply",
                methodName: "totalSupply",
              }
            ]
          },

          {
            reference: "InfoFive",
            contractAddress: farmConfig.tokenAddresses,
            abi: ABI,
            calls: [
              {
                reference: "decimals",
                methodName: "decimals",
              }
            ]
          },
          {
            reference: "InfoSix",
            contractAddress: farmConfig.quoteTokenAdresses,
            abi: ABI,
            calls: [
              {
                reference: "decimals",
                methodName: "decimals",
              }
            ]
          },
          {
            reference: "Infoseven",
            contractAddress: config.MasterChef,
            abi: MasterChef,
            calls: [
              {
                reference: "poolInfo",
                methodName: "poolInfo",
                methodParameters: [farmConfig.pid]

              }
            ]
          }
        ];
        const poolresults = await multicall.call(masterChefContract);

        let tokenBalanceLP = await getFormatMulticall(poolresults, "InfoOne", 0);
        let quoteTokenBalanceLP = await getFormatMulticall(poolresults, "InfoTwo", 0);
        let lpTokenBalanceMC = await getFormatMulticall(poolresults, "InfoThree", 0);
        let lpTotalSupply = await getFormatMulticall(poolresults, "InfoFour", 0);
        let tokenDecimals = await getFormatMulticall(poolresults, "InfoFive", 0);
        let quoteTokenDecimals = await getFormatMulticall(poolresults, "InfoSix", 0);
        let info = await getFormatMulticall(poolresults, "Infoseven", 0);

        const aprValue = (info && info[4] && info[4].hex) ?
          new BigNumber(info[4].hex) / (100) : new BigNumber(0)

        tokenBalanceLP = new BigNumber(tokenBalanceLP.hex, 16);
        tokenBalanceLP = tokenBalanceLP.toString(10);

        quoteTokenBalanceLP = new BigNumber(quoteTokenBalanceLP.hex, 16);
        quoteTokenBalanceLP = quoteTokenBalanceLP.toString(10);

        lpTokenBalanceMC = new BigNumber(lpTokenBalanceMC.hex, 16);
        lpTokenBalanceMC = lpTokenBalanceMC.toString(10);

        lpTotalSupply = new BigNumber(lpTotalSupply.hex, 16);
        lpTotalSupply = lpTotalSupply.toString(10);


        const lpTokenRatio = parseFloat(lpTokenBalanceMC) / parseFloat(lpTotalSupply)
        const tokenAmountTotal = parseFloat(tokenBalanceLP) / (10 ** 18)
        const quoteTokenAmountTotal = parseFloat(quoteTokenBalanceLP) / (10 ** (18))
        const quoteTokenAmountMc = (quoteTokenAmountTotal) * (lpTokenRatio)
        const lpTotalInQuoteToken = quoteTokenAmountMc * (new BigNumber(2))

        // console.log({
        //   tokenAmountTotal: tokenAmountTotal,
        //   lpTotalSupply: (lpTotalSupply),
        //   lpTotalInQuoteToken: lpTotalInQuoteToken,
        //   tokenPriceVsQuote: quoteTokenAmountTotal / tokenAmountTotal,
        //   poolWeight: "100",
        //   multiplier: '1X',
        //   pid: farmConfig.pid,
        //   token: farmConfig.tokenAddresses,
        //   quoteToken: farmConfig.quoteTokenAdresses,
        //   quoteTokenSymbol: farmConfig.quoteTokenSymbol,
        //   tokensymbol: farmConfig.tokensymbol,
        //   lpSymbol: farmConfig.lpSymbol,
        //   aprPercenatage: aprValue
        // }, 'uuuuuuuuuuuuuuuuurrrrrrrrrrree')
        return {
          tokenAmountTotal: tokenAmountTotal,
          lpTotalSupply: (lpTotalSupply),
          lpTotalInQuoteToken: lpTotalInQuoteToken,
          tokenPriceVsQuote: quoteTokenAmountTotal / tokenAmountTotal,
          poolWeight: "100",
          multiplier: '1X',
          pid: farmConfig.pid,
          token: farmConfig.tokenAddresses,
          quoteToken: farmConfig.quoteTokenAdresses,
          quoteTokenSymbol: farmConfig.quoteTokenSymbol,
          tokensymbol: farmConfig.tokensymbol,
          lpSymbol: farmConfig.lpSymbol,
          aprPercenatage: aprValue
        }
      }))
    return datas
  } catch (err) {
    console.log(err, 'errerrerrerdddrerrerrerr')
    return {
      tokenAmountTotal: 0,
      lpTotalSupply: 0,
      lpTotalInQuoteToken: 0,
      tokenPriceVsQuote: 0,
      poolWeight: "0",
      multiplier: '0X',
      pid: 0,
      token: 0,
      quoteToken: 0,
      quoteTokenSymbol: 0,
      tokensymbol: 0,
      lpSymbol: 0,
      aprPercenatage: 0
    }
  }
}



export const fetchPoolsTotalStaking = async () => {
  var get = await connection();
  // return;
  try {
    var web3 = get.web3;
    if (web3 === "" || !web3) {
      web3 = new Web3(config.netWorkUrl);
    }
    var address = zeroAddr;
    if (get.address && get.address !== "") {
      address = get.address;
    }
    const multicall = new Multicall({
      web3Instance: web3,
    });


    const nonBnbPools = poolsTokenlists && poolsTokenlists.tokens.filter((p) => p.lpSymbol !== 'BNB')
    // console.log('nonBnbPools: ', nonBnbPools);
    const bnbPool = poolsTokenlists && poolsTokenlists.tokens.filter((p) => p.lpSymbol === 'BNB')


    const callsBnbPools = await Promise.all(bnbPool && bnbPool.map(async (Configg) => {

      var masterChefContract = [
        {
          reference: "balanceOnee",
          contractAddress: config.WBNB,
          abi: ABI,
          calls: [
            {
              reference: "balanceOf",
              methodName: "balanceOf",
              methodParameters: [config.MasterChef]
            }
          ]
        },
      ];
      const poolresults = await multicall.call(masterChefContract);

      var balanceTwo = await getFormatMulticall(poolresults, "balanceOnee", 0);
      balanceTwo = new BigNumber(balanceTwo.hex, 16);
      balanceTwo = balanceTwo.toString(10);

      // return {
      //   ...nonBnbPools.map((p, index) => ({
      //     sousId: p.sousId,
      //     totalStaked: balanceTwo,
      //   })),
      // }
      return balanceTwo
    }))



    const callsNonBnbPools = await Promise.all(nonBnbPools && nonBnbPools.map(async (farmConfig) => {

      var masterChefContract = [
        {
          reference: "balance",
          contractAddress: farmConfig.stakingToken,
          abi: ABI,
          calls: [
            {
              reference: "balanceOf",
              methodName: "balanceOf",
              methodParameters: [config.MasterChef]
            }
          ]
        },


      ];
      const poolresults = await multicall.call(masterChefContract);

      var balanceeone = await getFormatMulticall(poolresults, "balance", 0);
      balanceeone = new BigNumber(balanceeone.hex, 16);
      balanceeone = balanceeone.toString(10);

      return balanceeone
      // return [
      //   ...bnbPool.map((p, index) => ({
      //     sousId: p.sousId,
      //     totalStaked: balanceeone,
      //   })),
      // ]
    }))

    return {
      callsBnbPools, callsNonBnbPools
    }
  }
  catch (err) {
    console.log(err, 'errerrerrderdddrerrerrerr')
    return {
      balanceeone: 0,
      balanceTwo: 0
    }
  }



}


// export async function getTotalValueLocked() {
//   var get = await connection();
//   // return;
//   try {
//     var web3 = get.web3;
//     if (web3 === "" || !web3) {
//       web3 = new Web3(config.netWorkUrl);
//     }
//     var address = zeroAddr;
//     if (get.address && get.address !== "") {
//       address = get.address;
//     }
//     const multicall = new Multicall({
//       web3Instance: web3,
//     });
//     const datas = await Promise.all(farmsconfig && farmsconfig.tokens && farmsconfig.tokens.length > 0
//       && farmsconfig.tokens.map(async (farmConfig) => {
//         const lpAdress = farmConfig.lpAddresses[config.NetworkId];
//         var masterChefContract = [
//           {
//             reference: "InfoOne",
//             contractAddress: farmConfig.tokenAddresses[config.NetworkId],
//             abi: ABI,
//             calls: [
//               {
//                 reference: "balanceOf",
//                 methodName: "balanceOf",
//                 methodParameters: [lpAdress]
//               }
//             ]
//           },
//           {
//             reference: "InfoTwo",
//             contractAddress: farmConfig.quoteTokenAdresses,
//             abi: ABI,
//             calls: [
//               {
//                 reference: "balanceOf",
//                 methodName: "balanceOf",
//                 methodParameters: [lpAdress]
//               }
//             ]
//           },
//           {
//             reference: "InfoThree",
//             contractAddress: farmConfig.isTokenOnly ? farmConfig.tokenAddresses[config.NetworkId] : lpAdress,
//             abi: farmConfig.isTokenOnly ? ABI : LPABI,
//             calls: [
//               {
//                 reference: "balanceOf",
//                 methodName: "balanceOf",
//                 methodParameters: [config.MasterChef]
//               }
//             ]
//           },
//           {
//             reference: "InfoFour",
//             contractAddress: lpAdress,
//             abi: LPABI,
//             calls: [
//               {
//                 reference: "totalSupply",
//                 methodName: "totalSupply",
//               }
//             ]
//           },
//           {
//             reference: "InfoFive",
//             contractAddress: farmConfig.tokenAddresses[config.NetworkId],
//             abi: ABI,
//             calls: [
//               {
//                 reference: "decimals",
//                 methodName: "decimals",
//               }
//             ]
//           },
//           {
//             reference: "InfoSix",
//             contractAddress: farmConfig.quoteTokenAdresses,
//             abi: ABI,
//             calls: [
//               {
//                 reference: "decimals",
//                 methodName: "decimals",
//               }
//             ]
//           }
//         ];
//         const poolresults = await multicall.call(masterChefContract);

//         let tokenBalanceLP = await getFormatMulticall(poolresults, "InfoOne", 0);
//         let quoteTokenBlanceLP = await getFormatMulticall(poolresults, "InfoTwo", 0);
//         let lpTokenBalanceMC = await getFormatMulticall(poolresults, "InfoThree", 0);
//         let lpTotalSupply = await getFormatMulticall(poolresults, "InfoFour", 0);
//         let tokenDecimals = await getFormatMulticall(poolresults, "InfoFive", 0);
//         let quoteTokenDecimals = await getFormatMulticall(poolresults, "InfoSix", 0);

//         let tokenAmount;
//         let lpTotalInQuoteToken;
//         let tokenPriceVsQuote;

//         if (farmConfig.isTokenOnly) {
//           tokenAmount = new BigNumber(lpTokenBalanceMC.hex, 16);

//           tokenAmount = tokenAmount.toString(10);
//           // tokenAmount = parseFloat(tokenAmount) / tokenDecimals
//           tokenAmount = parseFloat(tokenAmount) / 1e18


//           if (farmConfig.tokenSymbol === "BUSD" && farmConfig.quoteTokenSymbol === "BUSD") {
//             tokenPriceVsQuote = new BigNumber(1);

//           } else {

//             //  tokenPriceVsQuote = new BigNumber(quoteTokenBlanceLP).div(new BigNumber(tokenBalanceLP));

//             tokenPriceVsQuote = new BigNumber(quoteTokenBlanceLP.hex, 16);
//             tokenPriceVsQuote = tokenPriceVsQuote.toString(10);

//             tokenBalanceLP = new BigNumber(tokenBalanceLP.hex, 16);
//             tokenBalanceLP = tokenBalanceLP.toString(10);

//             tokenPriceVsQuote = parseFloat(tokenPriceVsQuote) / parseFloat(tokenBalanceLP)
//           }


//           lpTotalInQuoteToken = parseFloat(tokenAmount) * parseFloat(tokenPriceVsQuote);

//         } else {
//           var lpTokenRatioo = new BigNumber(lpTokenBalanceMC.hex, 16);
//           lpTokenRatioo = lpTokenRatioo.toString(10);

//           let LPtotalsupply = new BigNumber(lpTotalSupply.hex, 16)
//           LPtotalsupply = LPtotalsupply.toString(10);


//           const lpTokenRatio = lpTokenRatioo / LPtotalsupply;

//           // Total value in staking in quote token value
//           lpTotalInQuoteToken = new BigNumber(quoteTokenBlanceLP.hex)
//             .div(new BigNumber(10).pow(18))
//             .times(new BigNumber(2))
//             .times(lpTokenRatio)


//           // lpTotalInQuoteToken = new BigNumber(quoteTokenBlanceLP.hex, 16);
//           // lpTotalInQuoteToken = lpTotalInQuoteToken.toString(10);
//           // lpTotalInQuoteToken = lpTotalInQuoteToken / 1e18;
//           // lpTotalInQuoteToken = lpTotalInQuoteToken * new BigNumber(2) * lpTokenRatio;

//           tokenAmount = new BigNumber(tokenBalanceLP.hex, 16);
//           tokenAmount = tokenAmount.toString(10);
//           tokenAmount = (tokenAmount / 1e18) * lpTokenRatio;

//           var quoteTokenBlanceLPP = new BigNumber(quoteTokenBlanceLP.hex, 16);
//           quoteTokenBlanceLPP = quoteTokenBlanceLPP.toString(10);
//           quoteTokenBlanceLPP = quoteTokenBlanceLPP / 1e18;

//           const quoteTokenAmount = quoteTokenBlanceLPP * lpTokenRatio


//           if (parseFloat(tokenAmount) > 0) {
//             tokenPriceVsQuote = quoteTokenAmount / (tokenAmount);
//           } else {
//             tokenPriceVsQuote = new BigNumber(quoteTokenBlanceLP.hex, 16);
//             tokenPriceVsQuote = tokenPriceVsQuote.toString(10);

//             let tokenBalanceLP = new BigNumber(tokenBalanceLP.hex, 16);
//             tokenBalanceLP = tokenBalanceLP.toString(10);
//             tokenPriceVsQuote = tokenPriceVsQuote / tokenBalanceLP
//           }
//         }
//         console.log({
//           tokenAmount: tokenAmount,
//           // quoteTokenAmount: quoteTokenAmount,
//           lpTotalInQuoteToken: parseFloat(lpTotalInQuoteToken),
//           tokenPriceVsQuote: tokenPriceVsQuote,
//           quoteTokenSymbol: farmConfig.quoteTokenSymbol
//         }, 'jjjjjjjjjjjjjjjjjjjjjkkkk')
//         return {
//           // ...farmConfig,
//           tokenAmount: tokenAmount,
//           // quoteTokenAmount: quoteTokenAmount,
//           lpTotalInQuoteToken: lpTotalInQuoteToken,
//           tokenPriceVsQuote: tokenPriceVsQuote,
//           quoteTokenSymbol: farmConfig.quoteTokenSymbol

//         }
//       }))

//     return datas





//   } catch (err) {
//     console.log(err, 'errerrerrerrerrerrerr')
//     return {
//       tokenAmount: 0,
//       lpTotalInQuoteToken: 0,
//       tokenPriceVsQuote: 0,
//     }
//   }

// }

export async function getBusdTokenPricee() {

  var get = await connection();
  // return;
  try {

    var web3 = get.web3;
    if (web3 === "" || !web3) {
      web3 = new Web3(config.netWorkUrl);
    }
    var address = zeroAddr;
    if (get.address && get.address !== "") {
      address = get.address;
    }
    const multicall = new Multicall({
      web3Instance: web3,
    });
    var masterChefContract = [
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


    const poolresults = await multicall.call(masterChefContract);


    var EthlpBAl = await getFormatMulticall(poolresults, "balanceOfETHLP", 0);
    EthlpBAl = new BigNumber(EthlpBAl.hex, 16);
    EthlpBAl = EthlpBAl.toString(10);
    EthlpBAl = EthlpBAl / 1e18;

    var BusdLpbal = await getFormatMulticall(poolresults, "balanceOfBusdLP", 0);
    BusdLpbal = new BigNumber(BusdLpbal.hex, 16);
    BusdLpbal = BusdLpbal.toString(10);
    BusdLpbal = BusdLpbal / 1e18;

    var busdprice = BusdLpbal / EthlpBAl;

    return {
      busdprice: parseFloat(busdprice)
    }

  } catch (err) {
    console.log(err, 'errerrerrerrerrerrerr')
    return {
      busdprice: 0
    }
  }

}

export async function transactionFunction(address,setTransctiondetails) {
  try {
    // let datas = localStorage.getItem(address)

    // console.log('datasdatasdatasdatatatatatttttttt: ', datas);
    let getdatas = JSON.parse(localStorage.getItem(address));
    // if (!isEmpty(getdatas)) {
    //   console.log('gesssssssssssddddddtdatas: ', getdatas);
      if (getdatas && getdatas.length > 20) {
        // const existingEntries = JSON.parse(localStorage.getItem(address));
        getdatas.splice(0, 1);
        localStorage.setItem(address, JSON.stringify(getdatas));
        setTransctiondetails(getdatas)
      }
      else {
        setTransctiondetails(getdatas)
      }
    // }
    // else {
    //   setTransctiondetails([])
    // }
  }
  catch (err) {

  }
}







export async function getFormatMulticall(results, name, pos) {
  try {
    var returnVal =
      results &&
        results.results &&
        results.results[name].callsReturnContext &&
        results.results[name].callsReturnContext &&
        results.results[name].callsReturnContext[pos] &&
        results.results[name].callsReturnContext[pos].returnValues &&
        results.results[name].callsReturnContext[pos].returnValues[0]
        ? (results.results[name].callsReturnContext[pos].returnValues.length > 1) ?
          results.results[name].callsReturnContext[pos].returnValues : results.results[name].callsReturnContext[pos].returnValues[0]
        : "";

    return returnVal;
  } catch (err) {
    return "";
  }
}