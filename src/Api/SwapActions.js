import axios from "axios/dist/axios";
import config from "../config/config";

const baseUrl = config.baseUrl;


export const addSwap = async (data, authValue) => {
    try {
        let respData = await axios({
            'method': 'post',
            'url': `${baseUrl}/add-swap`,
            'data': data,
            'headers': { 'nvgftyu': localStorage.getItem('khdbfty'), 'vfdrtey': authValue }
        });
        return {
            loading: false,
            result: respData.data.refaddress
        }
    }
    catch (err) {
        return {
            loading: false,
            error: returnErr(err)
        }
    }
}

export const swapDetails = async (data) => {
    try {
        let respData = await axios({
            'method': 'get',
            'url': `${baseUrl}/swap-history?` + data
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

export const recentSwapping = async (data) => {
    try {
        let respData = await axios({
            'method': 'get',
            'url': `${baseUrl}/recent-swap-history?` + data
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

export const swapHistoryChart = async (data) => {
    try {
        let respData = await axios({
            'method': 'get',
            'url': `${baseUrl}/swap-history-chart?` + data
        });
        return {
            loading: false,
            result: respData.data.list,
            LastPrice: respData.data.LastPrice
        }
    }
    catch (err) {
        return {
            loading: false,
            error: returnErr(err)
        }
    }
}

export const addSwapFee = async (data) => {
    try {
        let respData = await axios({
            'method': 'post',
            'url': `${baseUrl}/add-swap-fee`,
            'data': data,
        });
        return {
            loading: false,
            result: respData.data,
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


