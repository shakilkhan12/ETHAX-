import axios from "axios/dist/axios";
import config from "../config/config";

const baseUrl = config.baseUrl;


export const getPoolData = async (data) => {
    try {
        let respData = await axios({
            method: 'get',
            url: `${baseUrl}/get-pools?skip=` +
                data.skip +
                `&limit=` +
                data.limit +
                `&status=` +
                data.status,
        });
        return {
            loading: false,
            result: respData.data.result,
            totalrecords: respData.data.totalrecords,
            apy: respData.data.apy,

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


