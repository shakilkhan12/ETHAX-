import { combineReducers } from "redux";

import web3Reucer from './webReducer';
import walletConnection from '../reducers/walletConnection';
import themeReducer from "../reducers/themeReducer";
import allowedPairs from '../reducers/allowedPairs'

export default combineReducers({
    web3Reucer,
    walletConnection,
    theme: themeReducer,
    allowedPairs: allowedPairs
});