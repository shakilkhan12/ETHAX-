import React, { useEffect, useState } from "react";
import { fetchPoolsPublicDataAsync } from "../HomeCalculation/topPools";
import { getApy, getInterestBreakdown, getPrincipalForInterest, getRoi } from "./compoundApyHelpers";
import { getbalance } from "../../ContractActions/bep20Actions";
import config from '../../config/config';
import { getStakeUnstakeBalance } from "../../ContractActions/MasterChefAction";
import { useSelector } from "react-redux";

const RoiCalculatorModal = () => {
  const [editingValue, seteditingValue] = useState();
  const [principalAsToken, setprincipalAsToken] = useState(0);
  const [stakinggDuration, setstakinggDuration] = useState(3);
  const [Roiatcurrent, setRoiatcurrent] = useState(0);
  const [RoiTokens, setRoiTokens] = useState(0);
  const [roiPercentage, setroiPercentage] = useState(0);
  const [CompoundIndex, setCompoundIndex] = useState(1);
  const [stakingtnPrice, setstakingTokenPrice] = useState();
  const [earningTnPrice, setearningTokenPrice] = useState();
  const [reversevalue, setreverseValue] = useState('USD');
  const [isschecked, setischecked] = useState(true);
  const [aprpercent, setaprpercent] = useState(0);
  const [apypercent, setapypercent] = useState(0);
  const [principalMode, setprincipalMode] = useState("USD_PRINCIPAL")
  const web3Reducer = useSelector((state) => state.web3Reucer);

  const compoundingIndexToFrequency = {
    0: 1,
    1: 0.142857142,
    2: 0.071428571, // once every 7 days
    3: 0.033333333, // once every 30 days
  }

  useEffect(() => {
    getfetchPoolsPublicData()
    getdetails()
  }, [])

  const getdetails = async () => {
    let autoCompoundFrequency = 0;
    let apr = 29.20;
    let performanceFee = 0;
    setaprpercent(apr)
    const apy = (getApy(apr, autoCompoundFrequency > 0 ? autoCompoundFrequency : 1, 365, performanceFee) * 100).toFixed(2)
    setapypercent(apy)
  }

  const getfetchPoolsPublicData = async () => {
    const data = await fetchPoolsPublicDataAsync()
    let stakingTokenPrice = data[0] && data[0].stakingTokenPrice;
    let earningTokenPrice = data[0] && data[0].earningTokenPrice;
    setstakingTokenPrice(stakingTokenPrice)
    setearningTokenPrice(earningTokenPrice)
  }

  // const getfetchPoolsPublicData = async () => {
  //   if (props && props.from == 'POOLS') {
  //     const data = await fetchPoolsPublicDataAsync()
  //     let stakingTokenPrice = data[0] && data[0].stakingTokenPrice;
  //     let earningTokenPrice = data[0] && data[0].earningTokenPrice;
  //     console.log(stakingTokenPrice, earningTokenPrice, 'oooffffPrice')
  //     setstakingTokenPrice(stakingTokenPrice)
  //     setearningTokenPrice(earningTokenPrice)
  //   }
  //   else if (props && (props.from == 'FARMS') && props.Lpsymbol) {
  //     const datatwo = await getLpTokenPrice(props.Lpsymbol)
  //     const earning = await fetchPoolsPublicDataAsync()
  //     let earningTokenPrice = earning[0] && earning[0].earningTokenPrice;
  //     setearningTokenPrice(earningTokenPrice)
  //     setstakingTokenPrice(datatwo)
  //   }
  //   else {
  //     const data = await fetchPoolsPublicDataAsync()
  //     let stakingTokenPrice = data[0] && data[0].stakingTokenPrice;
  //     let earningTokenPrice = data[0] && data[0].earningTokenPrice;
  //     console.log(stakingTokenPrice, earningTokenPrice, 'oooooooearningTokenPrice')
  //     setstakingTokenPrice(stakingTokenPrice)
  //     setearningTokenPrice(earningTokenPrice)
  //   }
  // }


  const priceastokenFun = async (amount, stakingTokenPrice, earningTokenPrice) => {
    const principalAsTokenBN = (amount) / (stakingTokenPrice)
    const stakingDurtn = stakinggDuration;
    var compoundingFrequey;
    if (isschecked) {
      const compoundingFrequency = compoundingIndexToFrequency[CompoundIndex]
      compoundingFrequey = compoundingFrequency;
    }
    else {
      compoundingFrequey = 0
    }
    if (reversevalue == 'USD') {
      const principalAsToken = principalAsTokenBN > (0) ? principalAsTokenBN.toFixed(10) : '0.00'
      // console.log('1111111111111111111222222: ', principalAsToken);
      setprincipalAsToken(principalAsToken)
      await interestBeakdown(amount, earningTokenPrice, stakingDurtn, compoundingFrequey)///////////////
    }
    else {
      const principalAsUsdBN = amount * stakingtnPrice
      const principalAsUsdString = principalAsUsdBN > 0 ? principalAsUsdBN.toFixed(2) : '0.00'
      // console.log('2222222222222222221111111: ', principalAsUsdString);
      setprincipalAsToken(principalAsUsdString)
      await interestBeakdown(principalAsUsdString, earningTokenPrice, stakingDurtn, compoundingFrequey)
    }
  }

  const interestBeakdown = async (amount, earningTokenPrice, stakingDurtn, compoundingFrequey) => {
    const compoundFrequency = compoundingFrequey;
    const performanceFee = 0;
    const apr = 29.2;
    const principalInUSDAsNumber = parseFloat(amount)
    // console.log({
    //   principalInUSD: principalInUSDAsNumber,
    //   apr,
    //   earningTokenPrice,
    //   compoundFrequency,
    //   performanceFee,
    // }, 'ddddddddddddddddddddddwwwwwwwwwwwwwwwwww')
    const interestBreakdown = getInterestBreakdown({
      principalInUSD: principalInUSDAsNumber,
      apr,
      earningTokenPrice,
      compoundFrequency,
      performanceFee,
    })
    const hasInterest = !Number.isNaN(interestBreakdown[stakingDurtn])
    const roiTokens = hasInterest ? interestBreakdown[stakingDurtn] : 0
    setRoiTokens(roiTokens)
    const roiAsUSD = hasInterest ? roiTokens * earningTokenPrice : 0
    setRoiatcurrent(roiAsUSD.toFixed(2))
    const roiPercentage = hasInterest
      ? getRoi({
        amountEarned: roiAsUSD,
        amountInvested: principalInUSDAsNumber,
      })
      : 0
    setroiPercentage(roiPercentage)
  }

  const handlechange = async (e) => {
    var value = e.target.value;
    setprincipalMode('USD_PRINCIPAL')
    seteditingValue(value)
    await priceastokenFun(value, stakingtnPrice, earningTnPrice)
  }

  const setFromUSDValue = async (value) => {
    var compoundingFrequey;
    if (isschecked) {
      const compoundingFrequency = compoundingIndexToFrequency[CompoundIndex]
      compoundingFrequey = compoundingFrequency;
    }
    else {
      compoundingFrequey = 0
    }
    const principalAsTokenBN = (value) / (stakingtnPrice)
    const principalAsToken = principalAsTokenBN > (0) ? principalAsTokenBN.toFixed(10) : '0.00'
    if (reversevalue == 'USD') {
      seteditingValue(value)
      setprincipalAsToken(principalAsToken)
    }
    else {
      setprincipalAsToken(value)
      seteditingValue(principalAsToken)
    }
    await interestBeakdown(value, earningTnPrice, stakinggDuration, compoundingFrequey)
  }

  const checkfunction = async (e) => {
    let isechecked = e.target.checked;
    var compoundFrequency;
    setischecked(isechecked)
    const compoundingFrequency = compoundingIndexToFrequency[CompoundIndex]
    if (isechecked && (reversevalue == 'USD') && (principalMode == 'USD_PRINCIPAL')) {
      compoundFrequency = compoundingFrequency;
      await interestBeakdown(editingValue, earningTnPrice, stakinggDuration, compoundFrequency)
    }
    else if (isechecked && (reversevalue == 'ETHAX') && (principalMode == 'USD_PRINCIPAL')) {
      compoundFrequency = compoundingFrequency;
      await interestBeakdown(principalAsToken, earningTnPrice, stakinggDuration, compoundFrequency)
    }
    else if (!isechecked && (reversevalue == 'USD') && (principalMode == 'USD_PRINCIPAL')) {
      compoundFrequency = 0;
      await interestBeakdown(editingValue, earningTnPrice, stakinggDuration, compoundFrequency)
    }
    else if (!isechecked && (reversevalue == 'ETHAX') && (principalMode == 'USD_PRINCIPAL')) {
      compoundFrequency = 0;
      await interestBeakdown(principalAsToken, earningTnPrice, stakinggDuration, compoundFrequency)
    }
    else if (principalMode == 'ROI_PRINCIPAL') {
      var apr = 29.2;
      var compoundFrequency;
      const compoundingFrequency = compoundingIndexToFrequency[CompoundIndex]
      if (isechecked) {
        compoundFrequency = compoundingFrequency
      }
      else {
        compoundFrequency = 0
      }
      const performanceFee = 0;
      const principalForExpectedRoi = getPrincipalForInterest(
        Roiatcurrent,
        apr,
        isechecked ? compoundFrequency : 0,
        performanceFee,
      )
      const principalUSD = !Number.isNaN(principalForExpectedRoi[stakinggDuration])
        ? principalForExpectedRoi[stakinggDuration]
        : 0
      const principalToken = (principalUSD) / (stakingtnPrice)
      const roiPercentage = getRoi({
        amountEarned: Roiatcurrent,
        amountInvested: principalUSD,
      })
      const targetRoiAsTokens = (Roiatcurrent) / (earningTnPrice)
      setRoiTokens(targetRoiAsTokens)
      seteditingValue(principalUSD)
      setroiPercentage(roiPercentage)
      setprincipalAsToken(principalToken.toFixed(10))
    }
  }

  const setstakingdurions = async (value) => {
    let getvalue = parseInt(value);
    var compoundingFrequey;
    if (isschecked) {
      compoundingFrequey = compoundingIndexToFrequency[CompoundIndex]
    }
    else {
      compoundingFrequey = 0;
    }
    setstakinggDuration(getvalue)
    if (reversevalue == 'USD' && (principalMode == 'USD_PRINCIPAL')) {
      await interestBeakdown(editingValue, earningTnPrice, getvalue, compoundingFrequey)
    }
    else if (reversevalue == 'ETHAX' && (principalMode == 'USD_PRINCIPAL')) {
      await interestBeakdown(principalAsToken, earningTnPrice, getvalue, compoundingFrequey)
    }
    else if (principalMode == 'ROI_PRINCIPAL') {
      var apr = 29.2;
      var compoundFrequency = ''
      const compoundingFrequency = compoundingIndexToFrequency[CompoundIndex]
      if (isschecked) {
        compoundFrequency = compoundingFrequency
      }
      else {
        compoundFrequency = 0
      }
      const performanceFee = 0;
      const principalForExpectedRoi = getPrincipalForInterest(
        Roiatcurrent,
        apr,
        isschecked ? compoundFrequency : 0,
        performanceFee,
      )
      const principalUSD = !Number.isNaN(principalForExpectedRoi[getvalue])
        ? principalForExpectedRoi[getvalue]
        : 0
      const principalToken = (principalUSD) / (stakingtnPrice)
      const roiPercentage = getRoi({
        amountEarned: Roiatcurrent,
        amountInvested: principalUSD,
      })
      const targetRoiAsTokens = (Roiatcurrent) / (earningTnPrice)
      setRoiTokens(targetRoiAsTokens)
      seteditingValue(principalUSD)
      setroiPercentage(roiPercentage)
      setprincipalAsToken(principalToken.toFixed(10))
    }
    else { }
  }

  const compoundindexfun = async (value) => {
    let values = parseInt(value)
    var compoundingFrequencyy;
    if (isschecked) {
      compoundingFrequencyy = compoundingIndexToFrequency[value]
      setCompoundIndex(values)
    }
    else {
      compoundingFrequencyy = 0;
      setCompoundIndex('')
    }
    if (reversevalue == 'USD' && (principalMode == 'USD_PRINCIPAL')) {
      await interestBeakdown(editingValue, earningTnPrice, stakinggDuration, compoundingFrequencyy)
    }
    else if (reversevalue == 'ETHAX' && (principalMode == 'USD_PRINCIPAL')) {
      await interestBeakdown(principalAsToken, earningTnPrice, stakinggDuration, compoundingFrequencyy)
    }
    else if (principalMode == 'ROI_PRINCIPAL') {
      var apr = 29.2;
      var compoundFrequency;
      const compoundingFrequency = compoundingIndexToFrequency[values]
      if (isschecked) {
        compoundFrequency = compoundingFrequency
      }
      else {
        compoundFrequency = 0
      }
      const performanceFee = 0;
      const principalForExpectedRoi = getPrincipalForInterest(
        Roiatcurrent,
        apr,
        isschecked ? compoundFrequency : 0,
        performanceFee,
      )
      const principalUSD = !Number.isNaN(principalForExpectedRoi[stakinggDuration])
        ? principalForExpectedRoi[stakinggDuration]
        : 0
      const principalToken = (principalUSD) / (stakingtnPrice)
      const roiPercentage = getRoi({
        amountEarned: Roiatcurrent,
        amountInvested: principalUSD,
      })
      const targetRoiAsTokens = (Roiatcurrent) / (earningTnPrice)
      setRoiTokens(targetRoiAsTokens)
      seteditingValue(principalUSD)
      setroiPercentage(roiPercentage)
      setprincipalAsToken(principalToken.toFixed(10))
    }
    else { }
  }

  const reverseFunction = async () => {
    // const principalAsUsdBN = editingValue * stakingtnPrice
    // const principalAsUsdString = principalAsUsdBN > 0 ? principalAsUsdBN.toFixed(2) : '0.00'
    // var compoundFrequency = ''
    // const compoundingFrequency = compoundingIndexToFrequency[CompoundIndex]
    // if (isschecked) {
    //   compoundFrequency = compoundingFrequency
    // }
    // else {
    //   compoundFrequency = 0
    // }
    if (reversevalue == 'USD') {
      setreverseValue('ETHAX')
      seteditingValue(principalAsToken)
      setprincipalAsToken(editingValue)
    }
    else {
      setreverseValue('USD')
      seteditingValue(principalAsToken)
      setprincipalAsToken(editingValue)
    }
  }

  const Roihandlechange = async (e) => {
    var value = e.target.value;
    setprincipalMode('ROI_PRINCIPAL')
    setRoiatcurrent(value)
    var apr = 29.2;
    var compoundFrequency;
    const compoundingFrequency = compoundingIndexToFrequency[CompoundIndex]
    if (isschecked) {
      compoundFrequency = compoundingFrequency
    }
    else {
      compoundFrequency = 0
    }
    const performanceFee = 0;
    const principalForExpectedRoi = getPrincipalForInterest(
      value,
      apr,
      isschecked ? compoundFrequency : 0,
      performanceFee,
    )
    const principalUSD = !Number.isNaN(principalForExpectedRoi[stakinggDuration])
      ? principalForExpectedRoi[stakinggDuration]
      : 0
    const principalToken = (principalUSD) / (stakingtnPrice)
    const roiPercentage = getRoi({
      amountEarned: value,
      amountInvested: principalUSD,
    })
    const targetRoiAsTokens = (value) / (earningTnPrice)
    if (reversevalue == 'ETHAX') {
      seteditingValue(principalToken.toFixed(10))
      setprincipalAsToken(principalUSD)
    }
    else {
      seteditingValue(principalUSD)
      setprincipalAsToken(principalToken.toFixed(10))
    }
    setRoiTokens(targetRoiAsTokens)
    // seteditingValue(principalUSD)
    // setprincipalAsToken(principalToken.toFixed(10))
    setroiPercentage(roiPercentage)
  }

  const mybalanceFunction = async () => {
    const { stakeBal } = await getStakeUnstakeBalance(2, config.EthaxAddress)
    const { balance, balanceOf } = await getbalance(config.EthaxAddress, 'ETHAX')
    let finalbalance = parseFloat(stakeBal) + parseFloat(balance);
    let getfinalusdprice = parseFloat(finalbalance) * parseFloat(stakingtnPrice)
    var compoundingFrequey;
    if (isschecked) {
      const compoundingFrequency = compoundingIndexToFrequency[CompoundIndex]
      compoundingFrequey = compoundingFrequency;
    }
    else {
      compoundingFrequey = 0
    }
    if (reversevalue == 'USD') {
      seteditingValue(getfinalusdprice)
      setprincipalAsToken(finalbalance)
    }
    else {
      setprincipalAsToken(getfinalusdprice)
      seteditingValue(finalbalance)
    }
    await interestBeakdown(getfinalusdprice, earningTnPrice, stakinggDuration, compoundingFrequey)
  }

  const validPositive = (e) => {
    if (
      new RegExp(`^\\d*(\\.\\d{0,8})?$`).test(e.target.value) ||
      (e.target.value = "")
    ) {
      e.preventDefault();
    }
  };

  const closeModal = () => {
    // setischecked(true)
    setprincipalAsToken()
    seteditingValue(0)
    setRoiTokens()
    setroiPercentage()
    setreverseValue('USD')
    setprincipalMode("USD_PRINCIPAL")
    setRoiatcurrent(0)
  }

  return (
    <div
      className="modal fade primary_modal"
      id="CalcModal"
      data-backdrop="static"
      // tabIndex ="-1"
      role="dialog"
      aria-labelledby="CalcModal"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h3 className="modal-title">ROI CALCULATOR</h3>
            <button
              type="button"
              className="close"
              data-dismiss="modal"
              aria-label="Close"
              onClick={closeModal}
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body pool-calc p-0">
            <div className="popup-space">
              <div className="form-group mb-1">
                <label>Ethax Staked</label>
                <div className="group-input">
                  <div className="group-input-field">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="0.00"
                        value={editingValue}
                        onChange={handlechange}
                        onInput={validPositive}
                      />
                      <div className="input-group-append">
                        <span className="input-group-text" id="basic-addon2">
                          {reversevalue}
                        </span>
                      </div>
                    </div>
                    <div className="input-field-alternate">
                      {principalAsToken && parseFloat(principalAsToken) > 0 ? principalAsToken : 0} <span>{reversevalue == 'ETHAX' ? 'USD' : 'ETHAX'}</span>
                    </div>
                  </div>
                  <div className="field-change-icon">
                    <span className="rotate-icon">
                      <i className="fas fa-exchange-alt" onClick={reverseFunction}></i>
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex-button mb-3">
                <button className="btn btn-sm" onClick={() => setFromUSDValue('100')}>$100</button>
                <button className="btn btn-sm" onClick={() => setFromUSDValue('1000')}>$1000</button>
                <button className="btn btn-sm" onClick={mybalanceFunction} disabled={web3Reducer && web3Reducer.address == ''}>My Balance</button>
              </div>
              <div className="form-group">
                <label>Staked for</label>
                <div
                  className="btn-group mr-2"
                  role="group"
                  aria-label="First group"
                >
                  <button type="button" className={stakinggDuration == 0 ? "btn btn-secondary active" : "btn btn-secondary"} onClick={() => setstakingdurions('0')}>
                    1D
                  </button>
                  <button type="button" className={stakinggDuration == 1 ? "btn btn-secondary active" : "btn btn-secondary"} onClick={() => setstakingdurions('1')}>
                    7D
                  </button>
                  <button type="button" className={stakinggDuration == 2 ? "btn btn-secondary active" : "btn btn-secondary"} onClick={() => setstakingdurions('2')}>
                    30D
                  </button>
                  <button type="button" className={stakinggDuration == 3 ? "btn btn-secondary active" : "btn btn-secondary"} onClick={() => setstakingdurions('3')}>
                    1Y
                  </button>
                  <button type="button" className={stakinggDuration == 4 ? "btn btn-secondary active" : "btn btn-secondary"} onClick={() => setstakingdurions('4')}>
                    5Y
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Compounding Every</label>
                <div className="check-btngroup">
                  <input type="checkbox" className="mr-2" onChange={checkfunction} defaultChecked={isschecked} />
                  <div
                    className="btn-group mr-2"
                    role="group"
                    aria-label="First group"
                  >
                    <button type="button" className={CompoundIndex == 0 ? "btn btn-secondary active" : "btn btn-secondary"} onClick={() => compoundindexfun('0')} disabled={isschecked == false}>
                      1D
                    </button>
                    <button type="button" className={CompoundIndex == 1 ? "btn btn-secondary active" : "btn btn-secondary"} onClick={() => compoundindexfun('1')} disabled={isschecked == false}>
                      7D
                    </button>
                    <button type="button" className={CompoundIndex == 2 ? "btn btn-secondary active" : "btn btn-secondary"} onClick={() => compoundindexfun('2')} disabled={isschecked == false}>
                      14D
                    </button>
                    <button type="button" className={CompoundIndex == 3 ? "btn btn-secondary active" : "btn btn-secondary"} onClick={() => compoundindexfun('3')} disabled={isschecked == false}>
                      30D
                    </button>
                  </div>
                </div>
              </div>
              <div className="form-group text-center">
                <i className="fas fa-arrow-down"></i>
              </div>
              <div className="form-group">
                <div className="edit-input-group">
                  <div className="edit-input-group-content">
                    <div className="edit-input-group-inner-box">
                      <div className="edit-input-group-content-flex">
                        <h2>
                          <span className="d-block">
                            ROI at current rates
                          </span>
                          <input
                            style={{ color: '#fff' }}
                            type="text"
                            className="form-control edit-input"
                            placeholder="0.00"
                            value={Roiatcurrent}
                            onChange={Roihandlechange}
                            onInput={validPositive}
                          />
                          {/* ${Roiatcurrent && parseFloat(Roiatcurrent) > 0 ? parseFloat(Roiatcurrent).toFixed(2) : 0} */}

                          <small>~ {RoiTokens && parseFloat(RoiTokens) > 0 ? parseFloat(RoiTokens).toFixed(3) : 0} ETHAX ({roiPercentage && parseFloat(roiPercentage) > 0 ? parseFloat(roiPercentage) : 0}%)</small>
                        </h2>
                        <div className="editIcon">
                          <i className="fas fa-pencil-alt"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="popup-footer-collapse">
              <a
                className="collapse-link d-block text-center collapsed"
                data-toggle="collapse"
                href="#collapseExample"
                role="button"
                aria-expanded="false"
                aria-controls="collapseExample"
              >
                Details
              </a>
              <div className="collapse" id="collapseExample">
                <div className="card card-body my-0 p-0">
                  <ul className="flex-list">
                    <li>
                      <label>APR</label>
                      <span>{aprpercent.toFixed(2)}%</span>
                    </li>
                    <li>
                      <label>APY (1x daily compound)</label>
                      <span>{apypercent}%</span>
                    </li>
                  </ul>
                  <ul className="full-list">
                    <li>Calculated based on current rates.</li>
                    <li>
                      All figures are estimates provided for your convenience
                      only, and by no means represent guaranteed returns.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div >
  )
}

export default RoiCalculatorModal
