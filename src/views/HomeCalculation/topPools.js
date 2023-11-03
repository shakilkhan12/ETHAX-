import { fetchPoolsTotalStaking, getTotalValueLocked } from '../../ContractActions/MasterChefAction';
import poolsConfig from '../../views/Tokenlists/poolsTokenlists.json'
import { fetchFarmsPrices } from './topfarms';

export const getTokenPricesFromFarm = async () => {
    const farmdata = await fetchFarmsPrices()
    return farmdata.reduce((prices, farm) => {
        const quoteTokenAddress = farm.quoteToken.toLocaleLowerCase()
        const tokenAddress = farm.token.toLocaleLowerCase()
        /* eslint-disable no-param-reassign */
        if (!prices[quoteTokenAddress]) {
            prices[quoteTokenAddress] = (farm.quoteTokenPriceBusd)
        }
        if (!prices[tokenAddress]) {
            prices[tokenAddress] = (farm.tokenPriceBusd)
        }
        return prices
    }, {})
}

export const fetchPoolsPublicDataAsync = async () => {
    // const blockLimits = await fetchPoolsBlockLimits()
    // const totalStakings = await fetchPoolsTotalStaking()
    const prices = await getTokenPricesFromFarm()
    const totakstaked = await fetchPoolsTotalStaking()

    const liveData = poolsConfig && poolsConfig.tokens && poolsConfig.tokens.map((pool) => {
        //   const blockLimit = blockLimits.find((entry) => entry.sousId === pool.sousId)
        //   const totalStaking = totalStakings.find((entry) => entry.sousId === pool.sousId)
        //   const isPoolEndBlockExceeded = currentBlock > 0 && blockLimit ? currentBlock > Number(blockLimit.endBlock) : false
        //   const isPoolFinished = pool.isFinished || isPoolEndBlockExceeded
        let gettotalstaked = totakstaked && totakstaked.callsNonBnbPools;
        gettotalstaked = gettotalstaked[0]
        // gettotalstaked = parseFloat(gettotalstaked) / 1e18
        var stakingTokenAddress = pool.stakingToken ? pool.stakingToken.toLocaleLowerCase() : null
        var stakingTokenPrice = stakingTokenAddress ? prices[stakingTokenAddress] : 0
        var earningTokenAddress = pool.earningToken ? pool.earningToken.toLowerCase() : null
        var earningTokenPrice = earningTokenAddress ? prices[earningTokenAddress] : 0
        return {
            stakingTokenPrice,
            gettotalstaked,
            earningTokenPrice,
        }
    })
    return liveData
}