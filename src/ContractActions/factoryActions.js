import FactoryABI from "../ABI/FactoryABI.json";
import config from "../config/config";
import { connection } from "../helper/connection";
import LPTokenABI from "../ABI/LPABI.json";

import {
    divideDecimal
} from "../helper/custommath";

import {
    Multicall
} from "ethereum-multicall";

export async function getallPairsLength(method) {

    var get = await connection();

    try {
        if (get && get.web3) {

            var web3 = get.web3;
            var Contract = new web3.eth.Contract(FactoryABI, config.Factory);
            var result = await Contract.methods[method]().call();

            return {
                value: result,
                status: true
            };
        } else {
            return {
                value: "",
                status: false
            };
        }
    } catch (err) {

        return {
            value: "",
            status: false
        };
    }

}

export async function getPairaddress(method, pos) {

    var get = await connection();

    try {
        if (get && get.web3) {
            var web3 = get.web3;
            var Contract = new web3.eth.Contract(FactoryABI, config.Factory);
            var result = await Contract.methods[method](pos).call();
            return {
                value: result,
                status: true
            };
        } else {
            return {
                value: "",
                status: false
            };
        }
    } catch (err) {
        return {
            value: "",
            status: false
        };
    }

}

export async function getPair(tokena, tokenb, Factory) {

    var get = await connection();

    try {
        if (get && get.web3) {
            var web3 = get.web3;
            var Contract = new web3.eth.Contract(FactoryABI, Factory);
            var result = await Contract.methods.getPair(tokena, tokenb).call();
            return {
                value: result,
                status: true
            };
        } else {
            return {
                value: "",
                status: false
            };
        }
    } catch (err) {
        return {
            value: "",
            status: false
        };
    }

}


export async function getLiqutityAllList(length, AllToken) {

    try {
        var get = await connection();
        if (get && get.web3) {
            var web3 = get.web3;
            var address = get.address;

            const multicall = new Multicall({
                web3Instance: web3,
            });
            var pairPos = [];
            for (var p = 0; p < length; p++) {
                pairPos.push({
                    reference: "allPairs",
                    methodName: "allPairs",
                    methodParameters: [p],
                })
            }

            const contractCallContext = [
                {
                    reference: "allPairs",
                    contractAddress: config.Factory,
                    abi: FactoryABI,
                    calls: pairPos,
                }
            ];

            const results = await multicall.call(contractCallContext);

            var pairAddrs = [];
            var contractCallContext1 = [];
            for (var i = 0; i < pairPos.length; i++) {

                var pair = await getFormatMulticall(results, "allPairs", i);
                pairAddrs.push({
                    pairaddress: pair,
                    balance: 0,
                    balanceOf: 0,
                    tokenA: "",
                    tokenB: "",
                    TotalSupply: 0
                });

                contractCallContext1.push({
                    reference: "balanceOf" + i,
                    contractAddress: pair,
                    abi: LPTokenABI,
                    calls: [
                        {
                            reference: "balanceOf",
                            methodName: "balanceOf",
                            methodParameters: [address],
                        },
                        {
                            reference: "totalSupply",
                            methodName: "totalSupply",
                            methodParameters: [],
                        },
                        {
                            reference: "token0",
                            methodName: "token0",
                            methodParameters: [],
                        },
                        {
                            reference: "token1",
                            methodName: "token1",
                            methodParameters: [],
                        }
                    ],
                })

            }

            const results1 = await multicall.call(contractCallContext1);
            var contractCallContext2 = [];
            for (var j = 0; j < pairAddrs.length; j++) {
                var dynamic = "balanceOf" + j;

                var balanceVal = await getFormatMulticall(results1, dynamic, 0);
                var totalSupply = await getFormatMulticall(results1, dynamic, 1);
                var token0 = await getFormatMulticall(results1, dynamic, 2);
                var token1 = await getFormatMulticall(results1, dynamic, 3);

                pairAddrs[j].tokenA = token0;
                pairAddrs[j].tokenB = token1;
                pairAddrs[j].balance = parseInt(balanceVal.hex);
                pairAddrs[j].balanceOf = parseInt(balanceVal.hex);
                pairAddrs[j].TotalSupply = parseInt(totalSupply.hex);


                contractCallContext2.push({
                    reference: "token0Detail" + j,
                    contractAddress: token0,
                    abi: LPTokenABI,
                    calls: [
                        {
                            reference: "balanceOf",
                            methodName: "balanceOf",
                            methodParameters: [pairAddrs[j].pairaddress],
                        },
                        {
                            reference: "symbol",
                            methodName: "symbol",
                            methodParameters: [],
                        },
                        {
                            reference: "decimals",
                            methodName: "decimals",
                            methodParameters: [],
                        }
                    ],
                }, {
                    reference: "token1Detail" + j,
                    contractAddress: token1,
                    abi: LPTokenABI,
                    calls: [
                        {
                            reference: "balanceOf",
                            methodName: "balanceOf",
                            methodParameters: [pairAddrs[j].pairaddress],
                        },
                        {
                            reference: "symbol",
                            methodName: "symbol",
                            methodParameters: [],
                        },
                        {
                            reference: "decimals",
                            methodName: "decimals",
                            methodParameters: [],
                        }
                    ],
                })

            }
            const results2 = await multicall.call(contractCallContext2);

            var liquidityList = [];

            for (let k = 0; k < pairAddrs.length; k++) {

                var dynamic1 = "token0Detail" + k;
                var dynamic2 = "token1Detail" + k;

                var reserve_from = await getFormatMulticall(results2, dynamic1, 0);
                reserve_from = parseInt(reserve_from.hex);
                var tokenAsymbol = await getFormatMulticall(results2, dynamic1, 1);
                var tokenAdecimal = await getFormatMulticall(results2, dynamic1, 2);
                tokenAdecimal = (tokenAdecimal > 0) ? tokenAdecimal : 18;

                var reserve_to = await getFormatMulticall(results2, dynamic2, 0);
                reserve_to = parseInt(reserve_to.hex);
                var tokenBsymbol = await getFormatMulticall(results2, dynamic2, 1);
                var tokenBdecimal = await getFormatMulticall(results2, dynamic2, 2);
                tokenBdecimal = (tokenBdecimal > 0) ? tokenBdecimal : 18;

                var TotalSupply = pairAddrs[k].TotalSupply;

                var balance = 0;
                if (pairAddrs[k].balance && parseFloat(pairAddrs[k].balance) > 0) {
                    balance = await divideDecimal(pairAddrs[k].balance, 18);
                }
                var supply = pairAddrs[k].balance;

                var fromAmt = reserve_from * (supply / parseFloat(TotalSupply));
                var toAmt = reserve_to * (supply / parseFloat(TotalSupply));

                fromAmt = (fromAmt > 0) ? await divideDecimal(fromAmt, tokenAdecimal) : 0;
                toAmt = (toAmt > 0) ? await divideDecimal(toAmt, tokenBdecimal) : 0;

                var shareOfPool = parseFloat(supply) / parseFloat(TotalSupply) * 100;

                var tokenAindex = AllToken.findIndex(val => val.address.toLowerCase() === pairAddrs[k].tokenA.toLowerCase());
                var tokenBindex = AllToken.findIndex(val => val.address.toLowerCase() === pairAddrs[k].tokenB.toLowerCase());

                if (supply > 0 && tokenAindex !== -1 && tokenBindex !== -1) {
                    liquidityList.push({
                        balance: pairAddrs[k].balance,
                        displayamt: balance,
                        tokenA: pairAddrs[k].tokenA,
                        tokenAAmt: fromAmt,
                        tokenAsymbol: tokenAsymbol,
                        tokenB: pairAddrs[k].tokenB,
                        tokenBAmt: toAmt,
                        shareOfPool: shareOfPool,
                        tokenBsymbol: tokenBsymbol
                    });
                }

            }

            return liquidityList;

        }

    } catch (err) {
        console.log('err: ', err);

        return []
    }

}

export async function getFormatMulticall(results, name, pos) {

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
