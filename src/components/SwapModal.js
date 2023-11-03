import React, { useEffect, useState } from 'react'
import ReactLoading from "react-loading";
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toastAlert } from "../helper/toastAlert";
import {
  swapping,
} from "../ContractActions/routerActions";
import config from "../config/config";

// import {
//   addSwap
// } from "../Api/SwapActions";


import { division } from "../helper/custommath";

import unknownToken from "../assets/images/question.svg"
import { isEmpty } from 'lodash';
import { transactionFunction } from '../ContractActions/MasterChefAction';
function brokenImage(e) {
  e.onerror = null; // prevents looping
  e.target.src = unknownToken;
}


const SwapModal = (props) => {


  var fromValue = props.fromValue;
  var toValue = props.toValue;
  var swapcurrent = props.swapcurrent;
  var deadline = props.deadline;
  var priceDetail = props.priceDetail;
  var authValue = props.authValue;
  var lpAddress = props.lpAddress;
  var fromlogo = props.fromValue.logoURI;
  var tologo = props.toValue.logoURI;


  var swapdata = props.swapdata;
  Object.assign(swapdata, { deadline: deadline });

  var { onchildSwapModal, onchildconfirmSupply } = props;

  const web3Reducer = useSelector((state) => state.web3Reucer);

  const [txid, settxid] = useState("");
  const [swapbtn, setswapbtn] = useState(false);
  const [isConfirm, setisConfirm] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    // setstorage()
  }, [])

  const setstorage = () => {
    var newObjss = {
      useraddress: web3Reducer.address,
      // fromaddress: 'fromadd1',
      // toaddress: 'toadd2',
      txhash: 'txhash145'
    }

    let newarrobj = [newObjss]
    var checktransHash = localStorage.getItem((web3Reducer.address))

    if (isEmpty(checktransHash)) {
      var d1 = JSON.stringify(newarrobj)
      localStorage.setItem((web3Reducer.address), d1)
    }
    else {

      let parseArr = JSON.parse(checktransHash)
      const found = parseArr.find((element) => element.useraddress == newObjss.useraddress);
      if (!isEmpty(found)) {
        parseArr = [...parseArr, ...[newObjss]]
        parseArr = JSON.stringify(parseArr)
        localStorage.setItem((web3Reducer.address), parseArr)
      }
      else {
        var d2 = JSON.stringify(newarrobj)
        localStorage.setItem((web3Reducer.address), d2)
      }
    }
  }

  async function proceedSwap() {

    setisConfirm(true);

    try {

      await onchildconfirmSupply();//check to current price update
      setTimeout(async function () {

        setisConfirm(false);

        setswapbtn(false)
        try {

          window.$('#swap_modal').modal('hide');
          window.$('#pending_swap_modal').modal('show');
          try {
            var result = await swapping(swapdata);
            if (result && result.status === true) {

              var tx = (result.value && result.value.transactionHash) ?
                result.value.transactionHash : "";
              var gasFeevalue = (result.value && result.value.gasUsed) ?
                result.value.gasUsed : 0;
              var gasFee = await division(gasFeevalue, 1e18);

              var swapDetail = {
                txid: tx,
                router: result.Router,
                address: web3Reducer.address,
                fromaddress: fromValue.address,
                fromamount: fromValue.showamount,
                toaddress: toValue.address,
                toamount: toValue.showamount,
                gasfee: gasFee,
                priceDetail: priceDetail,
                fromSymbol: fromValue.symbol,
                toSymbol: toValue.symbol,
                fromName: fromValue.name,
                toName: toValue.name,
                lpAddress: lpAddress
              }
              // localStorage.setItem(web3Reducer.address,result)


              let newarrobj = [result.value]
              var checktransHash = localStorage.getItem((web3Reducer.address))

              if (isEmpty(checktransHash)) {
                var data1 = JSON.stringify(newarrobj)
                localStorage.setItem((web3Reducer.address), data1)
                transactionFunction()
              }
              else {

                let parseArr = JSON.parse(checktransHash)
                // const found = parseArr.find((element) => element.from == result.from);
                // if (!isEmpty(found)) {
                // console.log('parrrrrrrddrrrrsssssseArr: ', found);
                parseArr = [...parseArr, ...[result.value]]
                parseArr = JSON.stringify(parseArr)
                localStorage.setItem((web3Reducer.address), parseArr)
                transactionFunction()

                // }
                // else {
                //   var data2 = JSON.stringify(newarrobj)
                //   console.log('dsdwewewfffata2: ', data2);
                //   localStorage.setItem((web3Reducer.address), data2)
                // await transactionFunction()

                // }
              }



              // await addSwap(swapDetail, authValue);
              toastAlert('success', "Your transaction is completed", 'swap');
              onchildSwapModal();
              settxid(tx);
              window.$('#pending_swap_modal').modal('hide');
              window.$('#success_swap_modal').modal('show');
              setTimeout(function () {
                // window.location.reload(false)
              }, 1500)
            } else {
              window.$('#pending_swap_modal').modal('hide');
              window.$('#error_swap_modal').modal('show');
            }
          } catch (err) {
            setisConfirm(false);
          }
        } catch (err) {

        }

      }, 1000);
    } catch (err) {
      setisConfirm(false);
    }

  }

  const closemodal = () => {
    window.location.reload(false)
  }



  return (
    <div>
      <div className="modal fade primary_modal" id="swap_modal" data-backdrop="static" tabIndex="-1" role="dialog" aria-labelledby="swap_modal" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content custom-swap-modal modalchg">
            <div className="modal-header p-0 m-0">
              <h5 className="modal-title m-0" id="confirm_swap_modal">{t('CONFIRM_SUPPLY')}</h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body px-0 pb-0">
              <div className="custome-swap-1">
                <div className="swap_coin_info">
                  <div>
                    <span style={{ color: "#fff" }}><img src={fromlogo} onError={(e) => { brokenImage(e) }} alt="thumb" className="mr-2" />{fromValue.showamount}</span>
                    <span>{fromValue.symbol}</span>
                  </div>
                  <i className="bi bi-arrow-down mt-2 arrow"></i>
                  <div>
                    <span style={{ color: "#fff" }}><img src={tologo} onError={(e) => { brokenImage(e) }} alt="thumb" className="mr-2" />{toValue.showamount}</span>
                    <span>{toValue.symbol}</span>
                  </div>
                </div>
              </div>
              <div className="text-center px-30 pt-2">
                {swapcurrent === "from" &&
                  <p className="fs-14">{t('OUTPUT_RECEIVE_ATLEAST')} <span>{swapdata.minimumReceived} {toValue.symbol}</span> {t('TRANSACTION_REVERT')}</p>
                }
                {swapcurrent === "to" &&
                  <p className="fs-14">{t('INPUT_ESTIMATED_SELL_MOST')}  <span>{swapdata.minimumReceived} {fromValue.symbol}</span> {t('TRANSACTION_REVERT')}</p>
                }
              </div>
              <div className="text-center px-30">
                <div className="">
                  <div className="d-flex align-items-center justify-content-between custome-swap-data">
                    <span>{t('PRICEE')}</span>
                    <span className="bnb-data">{(swapdata && swapdata.priceper && parseFloat(swapdata.priceper) > 0) ? swapdata.priceper : 0}  {fromValue.symbol} / {toValue.symbol} </span>
                  </div>
                  <div className="d-flex align-items-center justify-content-between custome-swap-data">
                    <span>{(swapcurrent === "from") ? "Minimum Received" : "Maximum sold"}:</span>
                    <span className="bnb-data">{swapdata && swapdata.minimumReceived ? swapdata.minimumReceived > 10000 ? swapdata.minimumReceived.toFixed(2) : swapdata.minimumReceived.toFixed(4 - Math.floor(Math.log(swapdata.minimumReceived) / Math.log(10))) : ''}</span>
                  </div>
                  <div className="d-flex align-items-center justify-content-between custome-swap-data">
                    <span>{t('PRICE_IMPACTS')}</span>
                    <span className="bnb-data">{swapdata.priceimpact} %</span>
                  </div>
                  <div className="d-flex align-items-center justify-content-between custome-swap-data">
                    <span>{t('LIQUIDITY_PROV_FEE')}</span>
                    <span className="bnb-data">{(swapdata && swapdata.liquidityFee) ? swapdata.liquidityFee : swapdata.liquidityFee}</span>
                  </div>
                </div>
              </div>

            </div>

            <div className="card-footer text-center mb-4 border-0">
              {(swapbtn || isConfirm) ?
                <ReactLoading type={"bars"} color="#1c5c90" className="loading mx-auto" />
                :
                <button onClick={() => { proceedSwap() }} className="home_primary_btn mt-3 text-center">{t('CONFIRM_SWAP')}</button>
              }
            </div>
          </div>
        </div>
      </div>


      <div className="modal fade primary_modal" id="pending_swap_modal" data-backdrop="static" tabIndex="-1" role="dialog" aria-labelledby="confirm_swap_modal" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="pending_swap_modal">{t('WAITING_CONFIRMATION')}</h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button></div>
            <div className="modal-body text-center">
              <div className="swap_info_mid">
                <p>{t('SWAPPING')} {fromValue.showamount} {fromValue.symbol} {t('FOR')} {toValue.symbol} {toValue.showamount}</p>
              </div>
              <div className="swap_info_mid">
                <p>{t('CONFIRM_TRANSACTION_WALLET')}</p>
              </div>
              <div className="d-flex justify-content-center">
                <ReactLoading type={"bars"} color={config.reactLoadr} className="loading" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="modal fade primary_modal" id="success_swap_modal" data-backdrop="static" tabIndex="-1" role="dialog" aria-labelledby="success_swap_modal" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title m-0" id="success_swap_modal">{t('TRANSACTION_SUBMITTED')}</h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={closemodal}>
                <span aria-hidden="true">&times;</span>
              </button>

            </div>
            <div className="modal-body">

              <div className="swap_info_mid text-center">
                <a href={config.txUrl + txid} target="blank">{t('VIEW_ON_BSCSCAN')}</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="modal fade primary_modal" id="error_swap_modal" data-backdrop="static" tabIndex="-1" role="dialog" aria-labelledby="error_swap_modal" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title m-0" id="error_swap_modal">{t('ERROR')}</h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="text-center">
                <img src={require("../assets/images/warning.png")} alt="Warning" className="img-fluid mb-2" />
                <p className="">{t('TRANSACTION_REJECTED')}</p>
              </div>
              <div className="text-center">
                <button className="btn btn-primary btn-rounded w-50" data-dismiss="modal">{t('DISMISS')}</button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}

export default SwapModal;