// import constant
import {
    ALLOWED_PAIRS
} from '../constant';

const initialState = {
    pairs: ""
};

const walletConnection = (state = initialState, action) => {
    switch (action.type) {
        case ALLOWED_PAIRS:
            return {
                ...state,
                ...action.payload
            };
        default:
            return state;
    }
}

export default walletConnection;