import {
    SET_WEB3,
    WALLET_CONNECT,
    TOKEN_LIST,
    ALLOWED_PAIRS
} from '../constant';

export const setWeb3 = details => {
    return {
        type: SET_WEB3,
        payload: details
    };
};

export const setWallet = details => {
    return {
        type: WALLET_CONNECT,
        payload: details
    };
};

export const setTokens = details => {
    return {
        type: TOKEN_LIST,
        payload: details
    };
};

export const setPairs = details => {
    return {
        type: ALLOWED_PAIRS,
        payload: details
    };
};








