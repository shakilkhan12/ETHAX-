import React, { useState } from 'react'
import ReactLoading from "react-loading";
import { useSelector } from 'react-redux';
import { toastAlert } from "../helper/toastAlert";
import {
	addliqutity,
	addliqutityETH
} from "../ContractActions/routerActions";
import { useTranslation } from 'react-i18next';
import {
	percentage
} from "../helper/custommath";
import { division } from "../helper/custommath";

import {
	addliqutityValue
} from "../Api/LiqutityActions";


import config from "../config/config"

import unknownToken from "../assets/images/question.svg"
import { isEmpty } from 'lodash';
import { transactionFunction } from '../ContractActions/MasterChefAction';
function brokenImage(e) {
	e.onerror = null; // prevents looping
	e.target.src = unknownToken;
}


const LiqutityModal = (props) => {

	var fromValue = props.fromValue;
	var toValue = props.toValue;
	var fromrate = props.fromrate;
	var torate = props.torate;
	var shareofPool = props.shareofPool;
	var receivedPool = props.receivedPool;
	var firstliqutity = props.firstliqutity;
	var swapcurrent = props.swapcurrent;
	var slippageValue = props.slippageValue;
	var fromlogo = props.fromValue.logoURI;
	var tologo = props.toValue.logoURI;

	var { onChildClickLiqutity } = props;

	const walletConnection = useSelector((state) => state.walletConnection);
	const web3Reducer = useSelector((state) => state.web3Reucer);

	const [txid, settxid] = useState("");
	const { t } = useTranslation();
	async function proceedLiqutity() {

		try {

			window.$('#liqutity_modal').modal('hide');
			window.$('#confirm_liqutity_modal').modal('show');
			var tx;
			var result;

			if (fromValue.symbol === config.ETHSYMBOL || toValue.symbol === config.ETHSYMBOL) {
				var token = "";
				var amount = 0;
				if (fromValue.symbol !== config.ETHSYMBOL) {
					token = fromValue.address;
					amount = fromValue.amount;
				} else {
					token = toValue.address;
					amount = toValue.amount;
				}
				var amountETHMin = 0;
				if (fromValue.symbol === config.ETHSYMBOL) {
					amountETHMin = fromValue.amount;
				}
				if (toValue.symbol === config.ETHSYMBOL) {
					amountETHMin = toValue.amount;
				}

				var amountTokenDesired = parseFloat(amount);

				var tokenAamt = await percentage(parseFloat(amount), 2, 'minus');
				var amountAMin = tokenAamt;

				var tokenBamt = parseFloat(amountETHMin);
				var amountBMin = tokenBamt;

				result = await addliqutityETH(
					token,
					amountTokenDesired.toString(),
					amountAMin.toString(),
					amountBMin.toString()
				);
				tx = (result.value && result.value.transactionHash) ?
					result.value.transactionHash : "";
			} else {

				var amountADesired = fromValue.amount;
				var amountBDesired = toValue.amount;

				var tokenAamt1 = await percentage(fromValue.amount, 2, 'minus');
				var amountAMin1 = tokenAamt1;

				var tokenBamt1 = await percentage(toValue.amount, 2, 'minus');
				var amountBMin1 = tokenBamt1;

				result = await addliqutity(
					fromValue.address,
					toValue.address,
					amountADesired,
					amountBDesired,
					amountAMin1,
					amountBMin1
				);
				tx = (result.value && result.value.transactionHash) ?
					result.value.transactionHash : "";
			}

			if (result.status) {
				settxid(tx);

				var gasFeevalue = (result.value && result.value.gasUsed) ?
					result.value.gasUsed : 0;
				var lpAmount = (result.lpAmount && result.lpAmount) ?
					result.lpAmount / 1e18 : 0;

				var gasFee = await division(gasFeevalue, 10 ** 18);
				var amt = parseFloat(fromValue.amount) / 1e18;
				var amt1 = parseFloat(toValue.amount) / 1e18;

				var newTokenData = "";
				if (fromValue && fromValue.newtoken === "yes") {
					newTokenData = fromValue;
				} else if (toValue && toValue.newtoken === "yes") {
					newTokenData = toValue;
				}
				onChildClickLiqutity(newTokenData);
				var LiqData = {
					txid: tx,
					address: walletConnection.address,
					fromaddress: fromValue.address,
					fromamount: amt,
					toaddress: toValue.address,
					toamount: amt1,
					gasfee: gasFee,
					new_token: newTokenData,
					lpamount: lpAmount
				}
				// await addliqutityValue(LiqData);


				let newarrobj = [result.value]
				var checktransHash = localStorage.getItem((web3Reducer.address))
				if (isEmpty(checktransHash)) {
					
					var data1 = JSON.stringify(newarrobj)
					localStorage.setItem((web3Reducer.address), data1)
					 transactionFunction()

				}
				else {


					let parseArr = JSON.parse(checktransHash)
					
					parseArr = [...parseArr, ...[result.value]]
					
					parseArr = JSON.stringify(parseArr)
					
					localStorage.setItem((web3Reducer.address), parseArr)
					transactionFunction()
					//   let parseArr = JSON.parse(checktransHash)
					//   const found = parseArr.find((element) => element.from == result.from);
					//   if (!isEmpty(found)) {
					// 	console.log('parrrrrsssseArr: ', found);
					// 	parseArr = [...parseArr, ...[result.value]]
					// 	parseArr = JSON.stringify(parseArr)
					// 	localStorage.setItem((web3Reducer.address), parseArr)
					// 	await transactionFunction()

					//   }
					//   else {
					// 	var data2 = JSON.stringify(newarrobj)
					// 	localStorage.setItem((web3Reducer.address), data2)
					// 	await transactionFunction()

					//   }


				}



				toastAlert('success', "Your transaction is completed", 'liqutity');
				window.$('#confirm_liqutity_modal').modal('hide');
				window.$('#success_liqutity_modal').modal('show');


			} else {
				window.$('#confirm_liqutity_modal').modal('hide');
				window.$('#success_liqutity_modal').modal('hide');
				window.$('#error_liqutity_modal').modal('show');
			}
		} catch (err) {

		}

	}
	const closemodal = () => {
		window.location.reload(false)
	  }
	return (
		<div>

			<div className="modal fade primary_modal" id="liqutity_modal" data-backdrop="static" tabIndex="-1" role="dialog" aria-labelledby="liqutity_modal" aria-hidden="true">
				<div className="modal-dialog modal-dialog-centered" role="document">
					<div className="modal-content custom-swap-modal modalchg">
						<div className="modal-header p-0 m-0">
							<h5 className="modal-title m-0" id="confirm_swap_modal">{t('CONFIRM_SUPPLY')}</h5>
							<button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={closemodal}>
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
							<div className="text-center pt-2">
								<p className="fs-14">{t('OUTPUT_ESTIMATED_PRICE_CHANGES')} <span>{slippageValue}%</span> {t('YOUR_TRANSACTION_REVERT')}</p>
							</div>


							<div className="text-center px-3">
								<div className="row pt-3 modalbelow">
									{swapcurrent === "from" ?
										<div className="d-flex align-items-center justify-content-between custome-swap-data">
											<span>1 {fromValue.symbol}={torate} {toValue.symbol}</span>
											<span className="bnb-data">1 {toValue.symbol}={fromrate} {fromValue.symbol}</span>
										</div>
										:
										<div className="d-flex align-items-center justify-content-between custome-swap-data">
											<span>1 {fromValue.symbol}={fromrate} {toValue.symbol}</span>
											<span className="bnb-data">1 {toValue.symbol}={torate} {fromValue.symbol}</span>
										</div>
									}
									{!firstliqutity &&
										<div className="d-flex align-items-center justify-content-between custome-swap-data">
											<span>{t('YOU_WILL_RECEIVE')}</span>
											<span className="bnb-data">{receivedPool} {fromValue.symbol} / {toValue.symbol}</span>
										</div>
									}
									<div className="d-flex align-items-center justify-content-between custome-swap-data">
										<span>{fromValue.symbol} {t('DEPOSITED')}</span>
										<span className="bnb-data">{fromValue.showamount}</span>
									</div>
									<div className="d-flex align-items-center justify-content-between custome-swap-data">
										<span>{toValue.symbol} {t('DEPOSITED')}</span>
										<span className="bnb-data">{toValue.showamount}</span>
									</div>
									{/* {swapcurrent == "from" ?
										<div className="d-flex align-items-center justify-content-between custome-swap-data">
											<span>1 {fromValue.symbol}={torate} {toValue.symbol}</span>
											<span className="bnb-data">1 {toValue.symbol}={fromrate} {fromValue.symbol}</span>
										</div>
										:
										<div className="d-flex align-items-center justify-content-between custome-swap-data">
											<span>1 {fromValue.symbol}={fromrate} {toValue.symbol}</span>
											<span className="bnb-data">1 {toValue.symbol}={torate} {fromValue.symbol}</span>
										</div>
									} */}
									<div className="d-flex align-items-center justify-content-between custome-swap-data">
										<span>{t('SHARE_OF_POOL')}</span>
										<span className="bnb-data">{(firstliqutity) ? 100 : shareofPool}%</span>
									</div>
								</div>
							</div>

						</div>
						<div className="card-footer text-center mb-4 border-0 p-0">
							<button onClick={() => { proceedLiqutity() }} className="mt-3 text-center primary_btn blue_btn">{t('CONFIRM_SUPPLY')}</button>
						</div>
					</div>
				</div>
			</div>





			{/* Right */}

			<div className="modal fade primary_modal" id="confirm_liqutity_modal" data-backdrop="static" tabIndex="-1" role="dialog" aria-labelledby="confirm_liqutity_modal" aria-hidden="true">
				<div className="modal-dialog modal-dialog-centered" role="document">
					<div className="modal-content">
						<div className="modal-header">
							<h5 className="modal-title" id="confirm_liqutity_modal">{t('WAITING_CONFIRMATION')}</h5>
							<button type="button" className="close" data-dismiss="modal" aria-label="Close">
								<span aria-hidden="true">&times;</span>
							</button>
						</div>
						<div className="modal-body text-center">

							<div className="swap_info_mid">
								<p>{t('SUPPLYING')} {fromValue.showamount} {fromValue.symbol} {t('AND')} {toValue.showamount} {toValue.symbol}</p>
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


			<div className="modal fade primary_modal" id="error_liqutity_modal" data-backdrop="static" tabIndex="-1" role="dialog" aria-labelledby="error_liqutity_modal" aria-hidden="true">
				<div className="modal-dialog modal-dialog-centered" role="document">
					<div className="modal-content">
						<div className="modal-header">
							<h5 className="modal-title" id="error_liqutity_modal">{t('ERROR')}</h5>
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

			<div className="modal fade primary_modal" id="success_liqutity_modal" data-backdrop="static" tabIndex="-1" role="dialog" aria-labelledby="success_liqutity_modal" aria-hidden="true">
				<div className="modal-dialog modal-dialog-centered" role="document">
					<div className="modal-content">
						<div className="modal-header">
							<h5 className="modal-title" id="success_liqutity_modal">{t('TRANSACTION_SUBMITTED')}</h5>
							<button type="button" className="close" data-dismiss="modal" aria-label="Close">
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
		</div>
	)
}
export default LiqutityModal;