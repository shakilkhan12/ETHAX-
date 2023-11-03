import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Launch } from "@material-ui/icons";

const RoiModal = (props) => {

    const { roiDetails, lpTokens } = props;

    const [oneday, setoneday] = useState({ percenatge: 0, usdValue: 0 });
    const [oneweek, setoneweek] = useState({ percenatge: 0, usdValue: 0 });
    const [onemonth, setonemonth] = useState({ percenatge: 0, usdValue: 0 });
    const [oneyear, setoneyear] = useState({ percenatge: 0, usdValue: 0 });

    useEffect(() => {
        if (roiDetails) {
            setRoiDetails();
        }
    }, [roiDetails]);

    function setRoiDetails() {
        if (roiDetails && roiDetails.oneday) {
            setoneday(roiDetails.oneday);
            setoneweek(roiDetails.oneweek);
            setonemonth(roiDetails.onemonth);
            setoneyear(roiDetails.oneyear);
        }
    }

    return (
        <div
            className="modal fade primary_modal"
            data-backdrop="static"
            id="roi_modal"
            tabIndex="-1"
            role="dialog"
            aria-labelledby="roi_modal"
            aria-hidden="true"
        >
            <div className="modal-dialog modal-dialog-centered" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="roi_modal">ROI</h5>
                        <button
                            type="button"
                            className="close"
                            data-dismiss="modal"
                            aria-label="Close"
                        >
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        <div className="table-responsive">
                            <table className="table roi_table">
                                <thead>
                                    <tr>
                                        <th>Timeframe</th>
                                        <th>ROI</th>
                                        <th>Ethax per $1000</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>1d</td>
                                        <td>{oneday.percentage}%</td>
                                        <td>{oneday.usdvalue}</td>
                                    </tr>
                                    <tr>
                                        <td>7d</td>
                                        <td>{oneweek.percentage}%</td>
                                        <td>{oneweek.usdvalue}</td>
                                    </tr>
                                    <tr>
                                        <td>30d</td>
                                        <td>{onemonth.percentage}%</td>
                                        <td>{onemonth.usdvalue}</td>
                                    </tr>
                                    <tr>
                                        <td>365d(APY)</td>
                                        <td>{oneyear.percentage}%</td>
                                        <td>{oneyear.usdvalue}</td>
                                    </tr>

                                </tbody>
                            </table>
                        </div>
                        <p className="roi_notes">
                            Calculated based on current rates. Compounding once daily. Rates
                            are estimates provided for your convenience only, and by no
                            means represent guaranteed returns.
                        </p>
                        <div className="wallet_modal_footer">
                            <Link to="/exchange">
                                <span>Get {lpTokens.from}-{lpTokens.to} LP</span> <Launch />
                            </Link>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RoiModal;
