// import constant
import {
    THEME_VALUE
} from '../constant';

const initialState = {
    value: "white"
};

const themeReducer = (state = initialState, action) => {
    switch (action.type) {
        case THEME_VALUE:
            return {
                ...state,
                ...action.payload
            };
        default:
            return state;
    }
}

export default themeReducer;