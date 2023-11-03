import axios from "axios/dist/axios";
import config from "../config/config";

const baseUrl = config.baseUrl;

export const tokenDetails = async (data) => {
    var useraddress = (data && data.useraddress) ? data.useraddress : 0;
    try {
        let respData = await axios({
            'method': 'get',
            'url': `${baseUrl}/token-list?address=` + useraddress
        });
        return {
            loading: false,
            result: respData.data.list
        }
    }
    catch (err) {
        console.log(err, 'errerrerrerr')
        return {
            loading: false,
            error: returnErr(err)
        }
    }
}

export const getBaseToken = async (data) => {
    try {
        let respData = await axios({
            'method': 'get',
            'url': `${baseUrl}/base-token`
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

export const getTokenPrice = async (data) => {
    try {
        let respData = await axios({
            'method': 'get',
            'url': `${baseUrl}/base-token-price`
        });
        return {
            loading: false,
            price: respData.data.price,
            address: respData.data.address
        }
    }
    catch (err) {
        return {
            loading: false,
            price: 0,
            address: "",
            error: returnErr(err)
        }
    }
}

export const getTokenLogo = async (data) => {
    try {
        let respData = await axios({
            'method': 'post',
            'url': `${baseUrl}/get-token-logo`,
            'data': data
        });
        return {
            loading: false,
            logo: respData.data.logo
        }
    }
    catch (err) {
        return {
            loading: false,
            error: returnErr(err)
        }
    }
}

export const addNewToken = async (data) => {
    try {
        let respData = await axios({
            'method': 'post',
            'url': `${baseUrl}/add-token`,
            'headers': { 'nvgftyu': localStorage.getItem('khdbfty') },
            'data': data
        });
        return {
            loading: false,
            result: respData.data.result
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


