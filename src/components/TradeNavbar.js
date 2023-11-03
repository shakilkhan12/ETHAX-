/*eslint-disable*/
import React from "react";
// react components for routing our app without refresh
import { Link, NavLink } from "react-router-dom";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";

import styles from "assets/jss/material-kit-react/components/headerLinksStyle.js";

const useStyles = makeStyles(styles);

export default function TradeNavbar(props) {
  const classes = useStyles();
  return (
    <ul className="nav nav-pills nav-fill primary_tab_list" id="pills-tab" role="tablist">
      <li className="nav-item">
        <a className="nav-link" href="http://one80exchange.wealwin.com/#/exchange"><span>Swap</span></a>
      </li>
      <li className="nav-item">
        <a href="http://one80exchange.wealwin.com/#/pool" className="nav-link"><span>Liquidity</span></a>
      </li>
      <li className="nav-item">
        <a className="nav-link" href="#" target="_blank"><span>Bridge</span></a>
      </li>
    </ul>
  );
}
