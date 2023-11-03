import BigNumber from 'bignumber.js'
import { getTotalValueLocked } from '../../ContractActions/MasterChefAction'
import lpAprs from './lpAprs.json'
export const BIG_ZERO = new BigNumber(0)
export const BIG_ONE = new BigNumber(1)
export const BIG_NINE = new BigNumber(9)
export const BIG_TEN = new BigNumber(10)

export const filterFarmsByQuoteToken = (
  farms,
  preferredQuoteTokens = ['BUSD', 'WBNB'],
) => {
  const preferredFarm =farms && farms.find((farm) => {
    return preferredQuoteTokens.some((quoteToken) => {
      return farm.quoteTokenSymbol === quoteToken
    })
  })
  return preferredFarm || farms[0]
}

const getFarmFromTokenSymbol = (
  farms,
  tokenSymbol,
  preferredQuoteTokens,
) => {
  const farmsWithTokenSymbol = farms.filter((farm) => farm.tokensymbol === tokenSymbol)
  const filteredFarm = filterFarmsByQuoteToken(farmsWithTokenSymbol, preferredQuoteTokens)
  return filteredFarm
}

const getFarmBaseTokenPrice = (
  farm,
  quoteTokenFarm,
  bnbPriceBusd,
) => {
  const hasTokenPriceVsQuote = farm && (farm.tokenPriceVsQuote) ? true : false;
  if (farm.quoteTokenSymbol === 'BUSD') {
    return hasTokenPriceVsQuote ? parseFloat(farm.tokenPriceVsQuote) : 0
  }
  if (farm.quoteTokenSymbol === 'WBNB') {
    return hasTokenPriceVsQuote ? parseFloat(bnbPriceBusd) * parseFloat(farm.tokenPriceVsQuote) : 0
  }
  if (!quoteTokenFarm) {
    return 0
  }
  if (quoteTokenFarm.quoteTokenSymbol === 'WBNB') {
    const quoteTokenInBusd = parseFloat(bnbPriceBusd) * parseFloat(quoteTokenFarm.tokenPriceVsQuote)
    return hasTokenPriceVsQuote && quoteTokenInBusd
      ? parseFloat(farm.tokenPriceVsQuote) * parseFloat(quoteTokenInBusd)
      : 0
  }
  if (quoteTokenFarm.quoteTokenSymbol === 'BUSD') {
    const quoteTokenInBusd = quoteTokenFarm.tokenPriceVsQuote
    return hasTokenPriceVsQuote && quoteTokenInBusd
      ? parseFloat(farm.tokenPriceVsQuote) * parseFloat(quoteTokenInBusd)
      : 0
  }
  return 0
}

const getFarmQuoteTokenPrice = (
  farm,
  quoteTokenFarm,
  bnbPriceBusd,
) => {
  if (farm.quoteTokenSymbol === 'BUSD') {
    return BIG_ONE
  }
  if (farm.quoteTokenSymbol === 'WBNB') {
    return bnbPriceBusd
  }
  if (!quoteTokenFarm) {
    return 0
  }
  if (quoteTokenFarm.quoteTokenSymbol === 'WBNB') {
    return quoteTokenFarm.tokenPriceVsQuote ? bnbPriceBusd * (quoteTokenFarm.tokenPriceVsQuote) : 0
  }
  if (quoteTokenFarm.quoteTokenSymbol === 'BUSD') {
    return quoteTokenFarm.tokenPriceVsQuote ? (quoteTokenFarm.tokenPriceVsQuote) : 0
  }
  return 0
}

export const fetchFarmsPrices = async () => {
  const farms = await getTotalValueLocked();
  const bnbBusdFarm =farms && farms.find((farm) => farm.pid === 1)
  const bnbPriceBusd = bnbBusdFarm.tokenPriceVsQuote ? 1 / parseFloat(bnbBusdFarm.tokenPriceVsQuote) : 0;
  const farmsWithPrices = farms.map((farm) => {
    const quoteTokenFarm = getFarmFromTokenSymbol(farms, farm.quoteTokenSymbol)
    const tokenPriceBusd = getFarmBaseTokenPrice(farm, quoteTokenFarm, bnbPriceBusd)
    const quoteTokenPriceBusd = getFarmQuoteTokenPrice(farm, quoteTokenFarm, bnbPriceBusd)
    return {
      ...farm,
      tokenPriceBusd: parseFloat(tokenPriceBusd),
      quoteTokenPriceBusd: parseFloat(quoteTokenPriceBusd),
    }
  })
  return farmsWithPrices
}

export const getFarmApr = (cakePriceUsd, poolLiquidityUsd, farmAddress) => {
  const yearlyCakeRewardAllocation = new BigNumber(1)
  const cakeRewardsApr = yearlyCakeRewardAllocation * (cakePriceUsd) / (poolLiquidityUsd) * (100)
  let cakeRewardsAprAsNumber = null
  if ((cakeRewardsApr !== NaN) && parseFloat(cakeRewardsApr) > 0) {
    cakeRewardsAprAsNumber = parseFloat(cakeRewardsApr)
  }
  const lpRewardsApr = lpAprs[farmAddress?.toLocaleLowerCase()] ?? 0
  return { cakeRewardsApr: cakeRewardsAprAsNumber, lpRewardsApr }
}

export const getPriceCakeBusd = async () => {
  const farm = await getTotalValueLocked();
  return farm[0].tokenPriceVsQuote ? (farm[0].tokenPriceVsQuote) : 0;
}

export const getTopForm = async () => {
  let farmsState = await fetchFarmsPrices();
  const farmsWithPrices = farmsState.filter(
    (farm) =>
      farm.lpTotalInQuoteToken &&
      farm.quoteTokenPriceBusd &&
      farm.pid !== 5
  )
  const farmsWithApr = await Promise.all(farmsWithPrices && farmsWithPrices.map(async (farm) => {
    const cakePriceBusd = await getPriceCakeBusd();
    const totalLiquidity = farm.lpTotalInQuoteToken * (farm.quoteTokenPriceBusd)
    const { cakeRewardsApr, lpRewardsApr } = getFarmApr(cakePriceBusd, totalLiquidity, farm.lpAddresses)
    let sortbyApr = cakeRewardsApr + lpRewardsApr
    return { ...farm, apr: cakeRewardsApr, lpRewardsApr, sortbyApr }
  }))
  const strDescending = [...farmsWithApr].sort((a, b) =>
    a.sortbyApr > b.sortbyApr ? -1 : 1,
  );
  return strDescending
}

export const getLpTokenPrice = async (symbol) => {
  const farms = await fetchFarmsPrices();
  const getfarm =farms && farms.find((farm) => farm.lpSymbol === symbol)
  const farmTokenPriceInUsd = getfarm ? (getfarm.tokenPriceBusd) : 0
  let lpTokenPrice = 0
  if (getfarm && getfarm.lpTotalSupply > (0) && getfarm.lpTotalInQuoteToken > (0)) {
    const valueOfBaseTokenInFarm = farmTokenPriceInUsd * (getfarm.tokenAmountTotal)
    const overallValueOfAllTokensInFarm = valueOfBaseTokenInFarm * (2)
    var totalLpTokens = (getfarm.lpTotalSupply)
    totalLpTokens = totalLpTokens / 1e18
    lpTokenPrice = overallValueOfAllTokensInFarm / (totalLpTokens)
  }
  return lpTokenPrice
}