import axios from "axios/dist/axios";
import config from "../config/config";

const baseUrl = config.baseUrl;


export const addliqutityValue = async (data) => {
    try {
        let respData = await axios({
            'method': 'post',
            'url': `${baseUrl}/add-liqutity`,
            'data': data,
        });
        return {
            loading: false,
            result: respData.data.message
        }
    }
    catch (err) {
        return {
            loading: false,
            error: returnErr(err)
        }
    }
}

export const liqutityDetails = async (data) => {
    try {
        let respData = await axios({
            'method': 'get',
            'url': `${baseUrl}/liqutity-history?` + data
        });
        return {
            loading: false,
            result: respData.data.list,
            totalrecords: respData.data.totalrecords
        }
    }
    catch (err) {
        return {
            loading: false,
            error: returnErr(err)
        }
    }
}

export const recentLiqutity = async (data) => {
    try {
        let respData = await axios({
            'method': 'get',
            'url': `${baseUrl}/recent-liqutity-history?` + data
        });
        return {
            loading: false,
            result: respData.data.list
        }
    }
    catch (err) {
        return {
            loading: false,
            error: returnErr(err)
        }
    }
}

export const removeliqutityValue = async (data) => {
    try {
        let respData = await axios({
            'method': 'post',
            'url': `${baseUrl}/remove-liqutity`,
            'data': data,
        });
        return {
            loading: false,
            result: respData.data.message
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


