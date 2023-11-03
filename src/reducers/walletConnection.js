// import constant
import {
    WALLET_CONNECT
} from '../constant';

const initialState = {
    connect: "no",
    iswallet: "no",
};

const walletConnection = (state = initialState, action) => {
    switch (action.type) {
        case WALLET_CONNECT:
            return {
                ...state,
                ...action.payload
            };
        default:
            return state;
    }
}

export default walletConnection;