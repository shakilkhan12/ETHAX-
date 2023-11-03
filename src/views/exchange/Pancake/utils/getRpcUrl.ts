import sample from 'lodash/sample'

const REACT_APP_NODE_1 = "https://data-seed-prebsc-1-s2.binance.org:8545/"
const REACT_APP_NODE_2 = "https://data-seed-prebsc-1-s2.binance.org:8545/"
const REACT_APP_NODE_3 = "https://data-seed-prebsc-1-s2.binance.org:8545/"

if (
  process.env.NODE_ENV !== 'production' &&
  (!REACT_APP_NODE_1 || !REACT_APP_NODE_2 || !REACT_APP_NODE_3)
) {
  throw Error('One base RPC URL is undefined')
}

// Array of available nodes to connect to
export const nodes = [REACT_APP_NODE_1, REACT_APP_NODE_2, REACT_APP_NODE_3]

const getNodeUrl = () => {
  // Use custom node if available (both for development and production)
  // However on the testnet it wouldn't work, so if on testnet - comment out the REACT_APP_NODE_PRODUCTION from env file
  // if (process.env.REACT_APP_NODE_PRODUCTION) {
  //   return process.env.REACT_APP_NODE_PRODUCTION
  // }
  return sample(nodes)
}

export default getNodeUrl
