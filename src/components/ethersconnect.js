import {  WalletClient } from 'wagmi'
export function walletClientToSigner( WalletClient) {
    const { account, chain, transport } = WalletClient
    const network = {
        chainId: chain.id,
        name: chain.name,
        ensAddress: chain.contracts?.ensRegistry?.address,
    }
    return {
        transport
    }
}

