import React, { useEffect, useState, Fragment } from 'react';
import { Link } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { useSelector } from 'react-redux';
import ReactLoading from "react-loading";
import {
    tokenDetails
} from "../Api/TokenActions";
import config from "../config/config"
import {
    getallPairsLength,
    getLiqutityAllList
} from "../ContractActions/factoryActions";

import RemoveLiqutityModal from "./RemoveLiqutityModal";
import btnImage from '../assets/images/btn.png';
import pancakeTokenlists from '../views/Tokenlists/pancakeTokenlists.json'


const Liqutityhistory = (props) => {

    var { importTokenClick } = props;

    const [tokenList, settokenList] = useState([]);
    const [userLiqutity, setuserLiqutity] = useState([]);
    const [showLiqutity, setshowLiqutity] = useState(false);
    const [fromToken, setfromToken] = useState("");
    const [toToken, settoToken] = useState("");

    //redux
    const walletConnection = useSelector((state) => state.walletConnection);
    const web3Reducer = useSelector((state) => state.web3Reucer);

    const columnsData = [
        {
            name: 'Liquidity',
            //selector: 'fromsymbol',
            selector: record => {

                var fromsymbol = "";
                var fromimage = btnImage;
                var fromamount = "0";
                var tosymbol = "";
                var toimage = btnImage;
                var toamount = 0;

                var tokensData = JSON.parse(tokenList);

                var fromIndex = tokensData.findIndex(val => val.address.toLowerCase() === record.tokenA.toLowerCase());
                if (fromIndex !== -1) {
                    fromsymbol = tokensData[fromIndex].symbol;
                    fromimage = tokensData[fromIndex].address.toLowerCase() + '.png';
                    var tokenAAmt = parseFloat(record.tokenAAmt);
                    fromamount = tokenAAmt;
                }

                var toIndex = tokensData.findIndex(val => val.address.toLowerCase() === record.tokenB.toLowerCase());
                if (toIndex !== -1) {
                    tosymbol = tokensData[toIndex].symbol;
                    toimage = tokensData[toIndex].address.toLowerCase() + '.png';
                    var tokenBAmt = parseFloat(record.tokenBAmt);
                    toamount = tokenBAmt;
                }

                return (
                    <Fragment>
                        <div className="d-flex align-items-center tablechg">
                            <div>
                                <img src={config.imageUrl + fromimage} className="table_crypto_icon" alt="Icon" onError={(e) => { e.target.onerror = null; e.target.src = config.defaultLogo }} />
                                <span><b>{fromamount}</b> {fromsymbol}</span>
                            </div>

                            <div>
                                <i className="fas fa-arrow-right mx-3"></i>
                                <img src={config.imageUrl + toimage} className="table_crypto_icon" alt="Icon" onError={(e) => { e.target.onerror = null; e.target.src = config.defaultLogo }} />
                                <span><b>{toamount}</b> {tosymbol}</span></div>
                        </div>

                    </Fragment>
                );

            },
            width: '500px'
        },
        {
            name: 'LP Token',
            selector: 'displayamt',
            width: '150px'
        },
        {
            name: 'Your pool share',
            //selector: 'shareOfPool',
            selector: record => {
                var shareOfPool = parseFloat(record.shareOfPool);
                return shareOfPool;
            },
            width: '200px'
        },
        {
            name: 'Remove',
            //selector: 'delete',
            selector: record => {
                return (
                    <Fragment>
                        <a href="#/" onClick={() => { showremoveLiqutityModal(record) }} className="remove_liq_icon text-danger closeicon"><i className="bi bi-x"></i></a>
                    </Fragment>
                );
            },
            width: '100px'
        }
    ];

    useEffect(() => {
        setInitial();
        getLiqutityList();
        //eslint-disable-next-line
    }, [walletConnection, web3Reducer]);

    async function setInitial() {
        let userAddress = ""
        if (walletConnection && walletConnection.connect === "yes" && web3Reducer && web3Reducer.web3 && web3Reducer.address && web3Reducer.address !== "") userAddress = web3Reducer.address;
        var allToken = pancakeTokenlists && pancakeTokenlists.tokens ? pancakeTokenlists.tokens : []

        // var getToken = await tokenDetails({ useraddress: userAddress });
        // var allToken = getToken.result;

        settokenList(allToken);
    }
    async function importLiqutity(item) {
        importTokenClick();
    }

    async function getLiqutityList() {

        setuserLiqutity([]);
        setshowLiqutity(false)

        var getlength = await getallPairsLength('allPairsLength');
        var length = parseInt(getlength.value);

        var AllToken = []
        if (tokenList.length > 0) {
            AllToken = JSON.parse(tokenList);
        } else {
            let userAddress = ""
            if (walletConnection && walletConnection.connect === "yes" && walletConnection.web3 && walletConnection.address && walletConnection.address !== "") userAddress = walletConnection.address;
            var AllToken = pancakeTokenlists && pancakeTokenlists.tokens ? pancakeTokenlists.tokens : []

            // var getToken = await tokenDetails({ useraddress: userAddress });
            // AllToken = JSON.parse(getToken.result);
        }

        var list = await getLiqutityAllList(length, AllToken);

        setuserLiqutity(list);
        setshowLiqutity(true)

    }

    async function showremoveLiqutityModal(items) {
        setfromToken(items.tokenA);
        settoToken(items.tokenB);
        setTimeout(function () {
            window.$('#remove_liqutity_modal').modal('show');
        }, 500)

    }

    return (
        <div className="row h-100">
            <div className="col-xl-12">
                <div className="card liquidity" data-aos="fade-up" data-aos-duration="2000">
                    <div className="card-header border-0">
                        <h4 className="card-title">My Liquidity Positions</h4>
                    </div>
                    <div className="card-body text-center py-0 liquidity-table">
                        {showLiqutity &&
                            <div className="table-responsive">
                                <table className="table basic-table mb-0 trade-table style-2">
                                    <DataTable
                                        columns={columnsData}
                                        data={userLiqutity}
                                        highlightOnHover
                                        noHeader
                                        pagination
                                        paginationServer
                                        paginationTotalRows={(userLiqutity) ? userLiqutity.length : 0}
                                        paginationPerPage={(userLiqutity) ? userLiqutity.length : 0}
                                    />
                                </table>
                            </div>

                        }
                        {!showLiqutity &&
                            <div className="d-flex justify-content-center align-items-center mt-2">
                                <ReactLoading type={"bars"} color="#1c5c90" className="loading" />
                            </div>
                        }
                        {fromToken && fromToken !== "" && toToken && toToken !== "" &&
                            <RemoveLiqutityModal
                                tokena={fromToken}
                                tokenb={toToken}
                            />
                        }
                    </div>
                </div>
            </div>
            <div className="col-xl-12 mt-3">
                <div className="card liquidity">
                    <div className="card-body">
                        <div className="row">
                            <div className="col-xl-8 col-lg-7">
                                <div className="liquidity-content">
                                    <p>Don't see a pool you joined? <Link to={"#"} onClick={importLiqutity}>Import it.</Link> Or, if you staked your LP tokens in a farm, unstake them to see them here.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default Liqutityhistory;