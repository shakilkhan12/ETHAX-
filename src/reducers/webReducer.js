// import constant
import {
    SET_WEB3
} from '../constant';

const initialState = {
    web3: "",
    address: "",
    network: 0,
    provider: ""
};

const web3Reucer = (state = initialState, action) => {
    switch (action.type) {
        case SET_WEB3:
            return {
                ...state,
                ...action.payload
            };
        default:
            return state;
    }
}

export default web3Reucer;