// @ts-nocheck
import { Tags, TokenInfo, TokenList } from "@uniswap/token-lists";
import {
  ChainId,
  Currency,
  CurrencyAmount,
  ETHER,
  JSBI,
  Token,
  TokenAmount,
  Trade,
  WETH,
  Pair,
  Percent,
  currencyEquals,
  Fraction,
} from '@pancakeswap/sdk';
// import JSBI from 'jsbi'
import { bignumber, multiply } from "mathjs";


import { parseUnits } from "@ethersproject/units";
import flatMap from "lodash/flatMap";
import { BigNumber } from "@ethersproject/bignumber";
import { abi as IUniswapV2PairABI } from "@uniswap/v2-core/build/IUniswapV2Pair.json";
import { abi as IUniswapV2FactoryABI } from "@uniswap/v2-core/build/IUniswapV2Factory.json";

import { ethers } from "ethers";
import MultiCallAbi from "./Multicall.json";
import { Multicall, ContractCallResults } from "ethereum-multicall";

import Web3 from "web3";

import config from "../../../config/config";

import FactoryABI from "../../../ABI/FactoryABI.json"

export const ZERO_PERCENT = new Percent('0')
export const ONE_HUNDRED_PERCENT = new Percent('1')
export const BETTER_TRADE_LESS_HOPS_THRESHOLD = new Percent(JSBI.BigInt(50), JSBI.BigInt(10000))

const BASE_FEE = new Percent(JSBI.BigInt(25), JSBI.BigInt(10000))
const ONE_HUNDRED_PERCENT1 = new Percent(JSBI.BigInt(10000), JSBI.BigInt(10000))
const INPUT_FRACTION_AFTER_FEE = ONE_HUNDRED_PERCENT1.subtract(BASE_FEE)

export function formatExecutionPrice(
  trade?: Trade,
  inverted?: boolean
): string {
  if (!trade) {
    return "";
  }
  return inverted
    ? `${trade.executionPrice.invert().toSignificant(6)} ${trade.inputAmount.currency.symbol
    } / ${trade.outputAmount.currency.symbol}`
    : `${trade.executionPrice.toSignificant(6)} ${trade.outputAmount.currency.symbol
    } / ${trade.inputAmount.currency.symbol}`;
}

export async function getMinumumReceived(details: any) {
  var fromAmt = parseFloat(details.fromAmt);
  var toAmt = parseFloat(details.toAmt);
  var id = details.id;
  var slippageValue = details.slippageValue;
  var minimumrecevied = 0
  if (id === "from") {
    var A = (toAmt * slippageValue) / 100;
    minimumrecevied = toAmt - A;
  } else {
    var B = (fromAmt * slippageValue) / 100;
    minimumrecevied = B + fromAmt;
  }
  return minimumrecevied;
}

export function addmultiply(amount: any, deci: any): string {
  try {
    var decimal = bignumber(deci);
    var price = bignumber(amount);
    var price1 = multiply(price, decimal);
    return price1.toString();
  } catch (err) {
    return "";
  }
}

export async function getMethod(details: any) {
  // var index = tokenList.findIndex((val: any) => val.symbol === config.ETHSYMBOL);
  // var WrappedETH = tokenList[index].address;
  var method = "";
  var fromField = "";
  var toField = "";


  var fromAddress = (details && details.from && details.from.address) ? details.from.address : ""
  var toAddress = (details && details.to && details.to.address) ? details.to.address : ""

  if (fromAddress.toLowerCase() === "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c") {
    if (details.isExactIn) {
      method = "swapExactETHForTokens";
      fromField = "payableAmount";
      toField = "amountOutMin";
    } else {
      method = "swapETHForExactTokens";
      fromField = "payableAmount";
      toField = "amountOut";
    }
  } else if (toAddress.toLowerCase() === "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c") {
    if (details.isExactIn) {
      method = "swapExactTokensForETH";
      fromField = "amountIn";
      toField = "amountOutMin";
    } else {
      method = "swapTokensForExactETH";
      fromField = "amountInMax";
      toField = "amountOut";
    }
  } else if (details.isExactIn) {
    method = "swapExactTokensForTokens";
    fromField = "amountIn";
    toField = "amountOutMin";
  } else {
    method = "swapTokensForExactTokens";
    fromField = "amountInMax";
    toField = "amountOut";
  }
  return {
    method,
    fromField,
    toField,
  };
}
type TagDetails = Tags[keyof Tags];
export interface TagInfo extends TagDetails {
  id: string;
}

export interface Call {
  address: string; // Address of the contract
  name: string; // Function name on the contract (example: balanceOf)
  params?: any[]; // Function params
}

const getContract = (
  abi: any,
  address: string,
  signer?: ethers.Signer | ethers.providers.Provider
) => {
  const signerOrProvider =
    signer ??
    new ethers.providers.JsonRpcProvider(
      config.netWorkUrl
    );
  return new ethers.Contract(address, abi, signerOrProvider);
};

export const getMulticallContract = (
  signer?: ethers.Signer | ethers.providers.Provider
) => {
  return getContract(
    MultiCallAbi,
    "0x8F3273Fb89B075b1645095ABaC6ed17B2d4Bc576",
    signer
  );
};

export type TokenAddressMap = Readonly<{
  [chainId in ChainId]: Readonly<{
    [tokenAddress: string]: { token: WrappedTokenInfo; list: TokenList };
  }>;
}>;

const EMPTY_LIST: TokenAddressMap = {
  [ChainId.MAINNET]: {},
  [ChainId.TESTNET]: {},
}
export class WrappedTokenInfo extends Token {
  public readonly tokenInfo: TokenInfo;

  public readonly tags: TagInfo[];

  constructor(tokenInfo: TokenInfo, tags: TagInfo[]) {
    super(
      tokenInfo.chainId,
      tokenInfo.address,
      tokenInfo.decimals,
      tokenInfo.symbol,
      tokenInfo.name
    );
    this.tokenInfo = tokenInfo;
    this.tags = tags;
  }

  public get logoURI(): string | undefined {
    return this.tokenInfo.logoURI;
  }
}

const listCache: WeakMap<TokenList, TokenAddressMap> | null =
  typeof WeakMap !== "undefined"
    ? new WeakMap<TokenList, TokenAddressMap>()
    : null;

export function listToTokenMap(list: TokenList): TokenAddressMap {
  const result = listCache?.get(list);
  if (result) return result;

  const map = list.tokens.reduce<TokenAddressMap>(
    (tokenMap, tokenInfo) => {
      const tags: TagInfo[] =
        tokenInfo.tags
          ?.map((tagId) => {
            if (!list.tags?.[tagId]) return undefined;
            return { ...list.tags[tagId], id: tagId };
          })
          ?.filter((x): x is TagInfo => Boolean(x)) ?? [];
      const token = new WrappedTokenInfo(tokenInfo, tags);
      if (tokenMap[token.chainId][token.address] !== undefined)
        throw Error("Duplicate tokens.");
      return {
        ...tokenMap,
        [token.chainId]: {
          ...tokenMap[token.chainId],
          [token.address]: {
            token,
            list,
          },
        },
      };
    },
    { ...EMPTY_LIST }
  );
  listCache?.set(list, map);
  return map;
}

export function listToTokenMapValue(list: any) {
  try {
    const token = new WrappedTokenInfo(list, []);
    return token;
  } catch (err) {
  }

}

export function tryParseAmount(
  value?: string,
  currency?: Currency
): CurrencyAmount | undefined {
  if (!value || !currency) {
    return undefined;
  }
  try {
    const typedValueParsed = parseUnits(value, currency.decimals).toString();
    if (typedValueParsed !== "0" && typedValueParsed !== undefined && typedValueParsed !== null && typedValueParsed !== '') {
      return currency instanceof Token
        ? new TokenAmount(currency, JSBI.BigInt(typedValueParsed))
        : CurrencyAmount.ether(JSBI.BigInt(typedValueParsed));
    }
  } catch (error) {
    console.debug(`Failed to parse input amount: "${value}"`, error);
  }
  // necessary for all paths to return a value
  return undefined;
}

export function wrappedCurrency(
  currency: Currency | undefined,
  chainId: ChainId | undefined
): Token | undefined {
  return chainId && currency === ETHER
    ? WETH[chainId]
    : currency instanceof Token
      ? currency
      : undefined;
}

type ChainTokenList = {
  readonly [chainId in ChainId]: Token[];
};


// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  [ChainId.MAINNET]: [],
  [ChainId.TESTNET]: [],
}

//[wbnb, sbt, busd,treebank,MetaIndex]
export const ADDITIONAL_BASES: { [chainId in ChainId]?: { [tokenAddress: string]: Token[] } } = {
  [ChainId.MAINNET]: {},
}

export const CUSTOM_BASES: { [chainId in ChainId]?: { [tokenAddress: string]: Token[] } } = {
  [ChainId.MAINNET]: {},
}

export enum PairState {
  LOADING,
  NOT_EXISTS,
  EXISTS,
  INVALID,
}
type MethodArg = string | number | BigNumber;
type MethodArgs = Array<MethodArg | MethodArg[]>;
type OptionalMethodInputs =
  | Array<MethodArg | MethodArg[] | undefined>
  | undefined;

export interface ListenerOptions {
  // how often this data should be fetched, by default 1
  readonly blocksPerFetch?: number;
}

interface CallState {
  readonly valid: boolean;
  // the result, or undefined if loading or errored/no data
  readonly result: Result | undefined;
  // true if the result has never been fetched
  readonly loading: boolean;
  // true if the result is not for the latest block
  readonly syncing: boolean;
  // true if the call was made and is synced, but the return data is invalid
  readonly error: boolean;
}

export interface Result extends ReadonlyArray<any> {
  readonly [key: string]: any;
}

export interface Call {
  address: string;
  callData: string;
}



export async function getAllCommonPairsList(
  currencyA?: Currency,
  currencyB?: Currency,
  bestPath?: any,
): Promise<Pair[]> {
  const chainId = 56;
  // const chainId = 97;
  const [tokenA, tokenB] = chainId
    ? [wrappedCurrency(currencyA, chainId), wrappedCurrency(currencyB, chainId)]
    : [undefined, undefined];

  const common = bestPath ?? []
  const additionalA = tokenA ? ADDITIONAL_BASES[chainId]?.[tokenA.address] ?? [] : []
  const additionalB = tokenB ? ADDITIONAL_BASES[chainId]?.[tokenB.address] ?? [] : []
  const returndata = [...common, ...additionalA, ...additionalB]
  const bases: Token[] = returndata;

  const basePairs: [Token, Token][] = flatMap(bases, (base): [Token, Token][] => bases?.map((otherBase) => [base, otherBase]));

  const allPairCombinations: [Token, Token][] =
    tokenA && tokenB
      ? [
        // the direct pair


        [tokenA, tokenB],
        //token A against all bases
        ...bases?.map((base): [Token, Token] => [tokenA, base]),
        // token B against all bases
        ...bases?.map((base): [Token, Token] => [tokenB, base]),
        // each base against all bases
        ...basePairs,
      ]
        .filter((tokens): tokens is [Token, Token] =>
          Boolean(tokens[0] && tokens[1])
        )
        .filter(([t0, t1]) => t0.address !== t1.address)
        .filter(([tokenA_, tokenB_]) => {
          if (!chainId) return true;
          const customBases = CUSTOM_BASES[chainId];

          const customBasesA: Token[] | undefined =
            customBases?.[tokenA_.address];
          const customBasesB: Token[] | undefined =
            customBases?.[tokenB_.address];

          if (!customBasesA && !customBasesB) return true;

          if (
            customBasesA &&
            !customBasesA.find((base) => tokenB_.equals(base))
          )
            return false;
          if (
            customBasesB &&
            !customBasesB.find((base) => tokenA_.equals(base))
          )
            return false;

          return true;
        })
      : [];

  var allPairs = await getPairs(allPairCombinations);
  // var allPairs = [currencyA,currencyB];
  var allPairs1: any = [];
  if (allPairs && allPairs.length > 0) {
    allPairs1 = Object.values(
      allPairs
        // filter out invalid pairs
        .filter((result): result is [PairState.EXISTS, Pair] =>
          Boolean(result[0] === PairState.EXISTS && result[1])
        )
        // filter out duplicated pairs
        .reduce<{ [pairAddress: string]: Pair }>((memo, [, curr]) => {
          memo[curr.liquidityToken.address] =
            memo[curr.liquidityToken.address] ?? curr;
          return memo;
        }, {})
    );
  }


  return allPairs1;
}

export async function getPairs(
  currencies: [Currency | undefined, Currency | undefined][]
): Promise<[PairState, Pair | null][]> {
  const chainId = config.NetworkId;
  var web3 = new Web3(
    config.netWorkUrl
  );
  const multicall = new Multicall({
    web3Instance: web3,
  });

  const tokens = currencies?.map(([currencyA, currencyB]) => [
    wrappedCurrency(currencyA, chainId),
    wrappedCurrency(currencyB, chainId),
  ]);

  var pairAddresses = tokens?.map(([tokenA, tokenB]) => {
    return tokenA && tokenB && !tokenA.equals(tokenB)
      ? Pair.getAddress(tokenA, tokenB)
      : undefined;
  });
  
  var originalPairs = await getallPairs1(tokens);

  var getValidpair = [];
  for (var p = 0; p < pairAddresses.length; p++) {
    if (pairAddresses && pairAddresses[p]) {
      const pair: string = pairAddresses[p] as string;

      var index = originalPairs.findIndex(
        (val) => val?.toLocaleLowerCase() == pair.toLocaleLowerCase()
      );
      if (index != -1) {
        getValidpair.push({
          reference: pair,
          contractAddress: pair,
          abi: IUniswapV2PairABI,
          calls: [
            {
              reference: "getReserves",
              methodName: "getReserves",
              methodParameters: [],
            },
          ],
        });
      }
    }
  }
  const results3: ContractCallResults = await multicall.call(getValidpair);

  var pairDetail = [];
  for (var t = 0; t < pairAddresses.length; t++) {
    var getReserves = await getFormatMulticall1(results3, pairAddresses[t], 0);

    if (getReserves) {
      pairDetail.push({
        error: false,
        loading: false,
        result: getReserves,
        syncing: true,
        valid: true,
      });
    } else {
      pairDetail.push({
        error: false,
        loading: false,
        result: undefined,
        syncing: true,
        valid: true,
      });
    }
  }

  var resp = pairDetail?.map((result, i) => {

    const { result: reserves, loading } = result;
    const tokenA = tokens[i][0];
    const tokenB = tokens[i][1];

    if (loading) return [PairState.LOADING, null];
    if (!tokenA || !tokenB || tokenA.equals(tokenB))
      return [PairState.INVALID, null];
    if (!reserves) return [PairState.NOT_EXISTS, null];
    //const { reserve0, reserve1 } = reserves
    const reserve0 = reserves[0].hex;
    const reserve1 = reserves[1].hex;

    const [token0, token1] = tokenA.sortsBefore(tokenB)
      ? [tokenA, tokenB]
      : [tokenB, tokenA];
    const testtt = [
      PairState.EXISTS,
      new Pair(
        new TokenAmount(token0, reserve0.toString()),
        new TokenAmount(token1, reserve1.toString())
      ),
    ];
    return [
      PairState.EXISTS,
      new Pair(
        new TokenAmount(token0, reserve0.toString()),
        new TokenAmount(token1, reserve1.toString())
      ),
    ];
  });
  return resp && resp.length > 0 ? resp : (null as any);
}

export async function getallPairs1(tokens: any) {
  try {
    const chainId = config.NetworkId;
    var web3 = new Web3(
      config.netWorkUrl
    );
    const multicall = new Multicall({
      web3Instance: web3,
    });

    // return tokenA && tokenB && !tokenA.equals(tokenB)

    var getPairList = [];
    for (var t = 0; t < tokens.length; t++) {

      if (
        tokens[t] &&
        tokens[t][0] &&
        tokens[t][1] &&
        tokens[t][0].address &&
        tokens[t][1].address &&
        tokens[t][0].address != "" &&
        tokens[t][1].address != ""
      ) {

        getPairList.push({
          reference: "pairs-" + t,
          contractAddress: config.Factory,
          abi: IUniswapV2FactoryABI,
          calls: [
            {
              reference: "getPair",
              methodName: "getPair",
              methodParameters: [tokens[t][0].address, tokens[t][1].address],
            },
          ],
        });
      }
    }

    const pairsresult: ContractCallResults = await multicall.call(getPairList);

    var pairList = [];
    if(tokens?.length > 0) {
      for (var t = 0; t < tokens.length; t++) {
        var pairAddr = await getFormatMulticall(pairsresult, "pairs-" + t, 0);
        var index = pairList.findIndex((val: any) => val.toLowerCase() === pairAddr.toLowerCase());
        if (
          pairAddr != "0x0000000000000000000000000000000000000000" &&
          pairAddr != "" && index == -1
        ) {
          pairList.push(pairAddr);
        }
      }
    }
    return pairList;
  } catch (err) {
    console.log(err, "err..........");
    return [];
  }
}

export async function getAllowedPairs(
  currencyIn?: Currency,
  currencyOut?: Currency,
  bestPath?: Currency,
) {
  const allowedPairs = await getAllCommonPairsList(
    currencyIn,
    currencyOut,
    bestPath
  );
  return allowedPairs;
}

export async function SwapTradeExactIn(
  currencyAmountIn?: CurrencyAmount,
  currencyOut?: Currency,
  singleHopOnly?: any,
  allowedPairs?: any
) {
  
  if (
    currencyAmountIn &&
    currencyOut &&
    allowedPairs &&
    allowedPairs.length > 0
  ) {
    if (singleHopOnly) {

      return (
        Trade.bestTradeExactIn(allowedPairs, currencyAmountIn, currencyOut, {
          maxHops: 1,
          maxNumResults: 1,
        })[0] ?? null
      );
    }

    var bestTradeSoFar: Trade | null = null;

    const MAX_HOPS = 3;
    
    for (let i = 1; i <= MAX_HOPS; i++) {
      try {
        const currentTrade: Trade | null =
          Trade.bestTradeExactIn(allowedPairs, currencyAmountIn, currencyOut, {
            maxHops: i,
            maxNumResults: 1,
          })[0] ?? null;

        // if current trade is best yet, save it
        if (
          isTradeBetter(
            bestTradeSoFar,
            currentTrade,
            BETTER_TRADE_LESS_HOPS_THRESHOLD
          )
        ) {
          bestTradeSoFar = currentTrade;
        }
       
      } catch (err) {
        console.log(err, 'errerrerrerrbbbb')
      }
    }
    return bestTradeSoFar;
  }
  return null;
}


export async function swapTradeExactOut(
  currencyIn?: Currency,
  currencyAmountOut?: CurrencyAmount,
  singleHopOnly?: any,
  allowedPairs?: any
) {

  const MAX_HOPS = 3;

  if (
    currencyIn &&
    currencyAmountOut &&
    allowedPairs &&
    allowedPairs.length > 0
  ) {

    if (singleHopOnly) {

      return (
        Trade.bestTradeExactOut(allowedPairs, currencyIn, currencyAmountOut, {
          maxHops: 1,
          maxNumResults: 1,
        })[0] ?? null
      );
    }
   
    // search through trades with varying hops, find best trade out of them
    let bestTradeSoFar: Trade | null = null;
    for (let i = 1; i <= MAX_HOPS; i++) {
      const currentTrade =
        Trade.bestTradeExactOut(allowedPairs, currencyIn, currencyAmountOut, {
          maxHops: i,
          maxNumResults: 1,
        })[0] ?? null;
  
      if (

        isTradeBetter(
          bestTradeSoFar,
          currentTrade,
          BETTER_TRADE_LESS_HOPS_THRESHOLD
        )
      ) {


        bestTradeSoFar = currentTrade;
      }
    }
    return bestTradeSoFar;
  }
}


export function isTradeBetter(
  tradeA: Trade | undefined | null,
  tradeB: Trade | undefined | null,
  minimumDelta: Percent = ZERO_PERCENT
): boolean | undefined {
  if (tradeA && !tradeB) return false;
  if (tradeB && !tradeA) return true;
  if (!tradeA || !tradeB) return undefined;

  if (
    tradeA.tradeType !== tradeB.tradeType ||
    !currencyEquals(tradeA.inputAmount.currency, tradeB.inputAmount.currency) ||
    !currencyEquals(tradeB.outputAmount.currency, tradeB.outputAmount.currency)
  ) {
    throw new Error("Trades are not comparable");
  }

  if (minimumDelta.equalTo(ZERO_PERCENT)) {
    return tradeA.executionPrice.lessThan(tradeB.executionPrice);
  }
  return tradeA.executionPrice.raw
    .multiply(minimumDelta.add(ONE_HUNDRED_PERCENT))
    .lessThan(tradeB.executionPrice);
}

export function computeTradePriceBreakdown(
  trade?: Trade | null
): { priceImpactWithoutFee: Percent | undefined; realizedLPFee: CurrencyAmount | undefined | null } {
  // console.log(trade,'tradeetereeeeeeeeeeeeeeeeeeeeeeeeeeeeeee')
  // for each hop in our trade, take away the x*y=k price impact from 0.3% fees
  // e.g. for 3 tokens/2 hops: 1 - ((1 - .03) * (1-.03))
  const realizedLPFee = !trade
    ? undefined
    : ONE_HUNDRED_PERCENT.subtract(
      trade.route.pairs.reduce<Fraction>(
        (currentFee: Fraction): Fraction => currentFee.multiply(INPUT_FRACTION_AFTER_FEE),
        ONE_HUNDRED_PERCENT
      )
    )
    // console.log(trade,'realizedLPFeerealizedLPFeerealizedLPFee')

  // remove lp fees from price impact
  const priceImpactWithoutFeeFraction = trade && realizedLPFee ? trade.priceImpact.subtract(realizedLPFee) : undefined
  // console.log('priceImpactWithoutttttttttttFeeFraction: ', priceImpactWithoutFeeFraction);

  // the x*y=k impact
  const priceImpactWithoutFeePercent = priceImpactWithoutFeeFraction
    ? new Percent(priceImpactWithoutFeeFraction?.numerator, priceImpactWithoutFeeFraction?.denominator)
    : undefined
  // the amount of the input that accrues to LPs
  const realizedLPFeeAmount =
    realizedLPFee &&
    trade &&
    (trade.inputAmount instanceof TokenAmount
      ? new TokenAmount(trade.inputAmount.token, realizedLPFee.multiply(trade.inputAmount.raw).quotient)
      : CurrencyAmount.ether(realizedLPFee.multiply(trade.inputAmount.raw).quotient))
      // console.log(priceImpactWithoutFeePercent?.toFixed(6),'priceImpactWithoutFeePercentassdsdsdsdsdsd')

  return { priceImpactWithoutFee: priceImpactWithoutFeePercent, realizedLPFee: realizedLPFeeAmount }
}

export async function getFormatMulticall(results: any, name: any, pos: any) {
  try {
    var returnVal =
      results &&
        results.results &&
        results.results[name] &&
        results.results[name].callsReturnContext &&
        results.results[name].callsReturnContext &&
        results.results[name].callsReturnContext[pos] &&
        results.results[name].callsReturnContext[pos].returnValues &&
        results.results[name].callsReturnContext[pos].returnValues[0]
        ? results.results[name].callsReturnContext[pos].returnValues[0]
        : "";
    return returnVal;
  } catch (err) {
    return "";
  }
}

export async function getFormatMulticall1(results: any, name: any, pos: any) {
  try {
    var returnVal =
      results &&
        results.results &&
        results.results[name] &&
        results.results[name].callsReturnContext &&
        results.results[name].callsReturnContext &&
        results.results[name].callsReturnContext[pos] &&
        results.results[name].callsReturnContext[pos].returnValues &&
        results.results[name].callsReturnContext[pos].returnValues
        ? results.results[name].callsReturnContext[pos].returnValues
        : "";
    return returnVal;
  } catch (err) {
    return "";
  }
}

export async function getBestTokens(list: any) {
  var bestList = [];
  for (var t = 0; t < list.length; t++) {
    if (list[t].symbol == "ETHAX" || list[t].symbol == "WBNB" || list[t].symbol == "Tether-USDT" || list[t].symbol == "BUSD"
    ) {
      var routeToken = new Token(
        list[t].chainId,
        list[t].address,
        list[t].decimals,
        list[t].symbol,
        list[t].name,
      );
      bestList.push(routeToken);
    }

  }

  return bestList;

}

export async function getallPairs() {

  try {
    var web3 = new Web3(
      config.netWorkUrl
    );
    const multicall = new Multicall({
      web3Instance: web3,
    });

    var allPairsLength = [{
      reference: "allPairsLength",
      contractAddress: config.Factory,
      abi: IUniswapV2FactoryABI,
      calls: [
        {
          reference: "allPairsLength",
          methodName: "allPairsLength",
          methodParameters: [],
        },
      ],
    }];
    const pairsresult: ContractCallResults = await multicall.call(allPairsLength);
    var length = await getFormatMulticall(pairsresult, "allPairsLength", 0);
    length = parseInt(length.hex)
    var pairPos = [];
    for (var p = 0; p < length; p++) {

      pairPos.push({
        reference: "pair-" + p,
        contractAddress: config.Factory,
        abi: FactoryABI,
        calls: [
          {
            reference: "allPairs",
            methodName: "allPairs",
            methodParameters: [p],
          },
        ],
      });
    }
    const results3: ContractCallResults = await multicall.call(pairPos);
    var pairList = [];
    for (var t = 0; t < length; t++) {
      var pairAddr = await getFormatMulticall(results3, "pair-" + t, 0);
      pairList.push(pairAddr)
    }

    return pairList;
  } catch (err) {
    return [];
  }

}


