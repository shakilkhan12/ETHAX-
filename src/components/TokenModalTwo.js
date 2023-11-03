import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import config from '../config/config'

const TokenModalNew = forwardRef((props, ref) => {

    useImperativeHandle(ref, () => ({
        handleModalOpen() {
            window.$('#token_modal2').modal('show');
        }
    }));

    function handleModalClose() {
        window.$('#token_modal2').modal('show');
    }
    const [originaltokenList, setoriginaltokenList] = useState([]);
    const web3Reducer = useSelector((state) => state.web3Reucer);
    const [tokenList, settokenList] = useState([]);
    const { t } = useTranslation();
    useEffect(() => {
        if (web3Reducer && web3Reducer.web3 && web3Reducer.address && web3Reducer.address !== "") {

        }
        setInitial();
        //eslint-disable-next-line
    }, [web3Reducer]);

    var fromValue = props.fromValue;
    var { onChildTokenClick, childImportClick } = props;
    var toValue = props.toValue;
    var current = props.swapcurrent;
    var importsection = props.importsection;

    async function setInitial() {
        let tokenarr = ['ETH', 'USDT', 'DAI', 'USDC']
        let userAddress = ""
        if (web3Reducer && web3Reducer.web3 && web3Reducer.address && web3Reducer.address !== "") userAddress = web3Reducer.address;
        settokenList(tokenarr);
        setoriginaltokenList(tokenarr);

    }

    async function setSwapToken(item) {
        // if (item.newtoken === "yes") {
        var newObj = item;
        var userAddress = ""
        if (web3Reducer && web3Reducer.web3 && web3Reducer.address && web3Reducer.address !== "") userAddress = web3Reducer.address;
        Object.assign(newObj, { useraddress: userAddress });
        window.$('#token_modal2').modal('hide');
        // }

        if (importsection) {
            childImportClick(item, current)
        } else {
            onChildTokenClick(item, current);
        }

    }
    const filterValue = async (event) => {
        var value = event.target.value;
        if (value && value !== "") {

            var filteredData = originaltokenList.filter(data => data.toLowerCase().includes(value.toLowerCase()));
            

            if (filteredData) {
                settokenList(filteredData);
            } else {
                settokenList([]);
            }
        }
        else {
            setTimeout(settokenList.bind(this, originaltokenList), 200);
        }



    }

    return (
        <div className="page_wrapper">
            <div className="modal fade primary_modal" id="token_modal2" tabIndex="-1" role="dialog" aria-labelledby="token_modal2" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="token_modal_title">{t('SELECT_A_TOKEN')}</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => handleModalClose()}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <input onChange={filterValue} className="search_inp" placeholder={t('SEARCH_NAME')} type="text"></input>
                            <h4>{t('TOKEN_NAME')}</h4>
                            <ul className="select_token_list">
                                {tokenList && tokenList.length > 0 && tokenList.map((item, i) => {
                                    // console.log(item, 'symbolllllllllllllllllllll')
                                    var show = (current === "from") ? toValue : fromValue;

                                    return (
                                        <>



                                            <li onClick={() => { setSwapToken(item) }}>

                                                <img src={require(`${'../assets/images/'}` + item + '.png')} alt="Icons" onError={(e) => { e.target.onerror = null; e.target.src = config.defaultLogo }} />
                                                <p>{item}</p>
                                            </li>


                                        </>
                                    )
                                })}

                            </ul>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
})

export default TokenModalNew;