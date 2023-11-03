import { ChainId, Token } from '@uniswap/sdk'

const { MAINNET, GÖRLI } = ChainId

export const mainnetTokens = {
  busd: new Token(
    MAINNET,
      '0xb6b12c94d75b7ab557819cffef5926e64ed95346',
      18,
      'Sparco',
      'Sparco Token'
  ),
  indcoin: new Token(
    MAINNET,
      '0xba090abead1ec56bc2691b4f0c500dbe1cfaf842',
      18,
      'BUSD',
      'Binance USD'
  ),
}

  export const testnetTokens = {
    weth: new Token(
      GÖRLI,
        '0x8079d7f88b4a97630052a70b324245e8402c8e17',
        18,
        'WBNB',
        'Wrapped BNB'
    ),
    busd: new Token(
      GÖRLI,
        '0xb6b12c94d75b7ab557819cffef5926e64ed95346',
        18,
        'Sparco',
        'Sparco Token'
    ),
    indcoin: new Token(
      GÖRLI,
        '0xba090abead1ec56bc2691b4f0c500dbe1cfaf842',
        18,
        'BUSD',
        'Binance USD'
    ),
    usdt  : new Token(
      GÖRLI,
        '0x350fbf9431e15ecb491723ef2324c51d8f1e6758',
        18,
        'TreeBank',
        'TreeBank'
    )
  }