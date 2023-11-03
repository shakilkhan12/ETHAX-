import axios from "axios/dist/axios";
import config from "../config/config";

const baseUrl = config.baseUrl;


export const addBuytokenHistory = async (data) => {
    try {
        let respData = await axios({
            'method': 'post',
            'url': `${baseUrl}/add-buyhistory`,
            'data': data,
        });
        return {
            loading: false,
            result: respData.data.message,
            status: respData.data.status
        }
    }
    catch (err) {
        return {
            loading: false,
            error: returnErr(err)
        }
    }
}


function returnErr(err) {
    if (err.response && err.response.data && err.response.data.errors) {
        return err.response.data.errors;
    }
    else {
        return '';
    }
}