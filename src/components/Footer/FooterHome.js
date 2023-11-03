/*eslint-disable*/
import React from "react";
import { useSelector } from "react-redux";
// nodejs library to set properties for components
import PropTypes from "prop-types";
// nodejs library that concatenates classes
import classNames from "classnames";

import { makeStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";
import GridContainer from "../Grid/GridContainer.js";
import GridItem from "../Grid/GridItem.js";
import styles from "../../assets/jss/material-kit-react/components/footerStyle.js";
import { Button } from "@material-ui/core";
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles(styles);

export default function Footer(props) {
  const classes = useStyles();
  const { t, i18n } = useTranslation();
  const { whiteFont } = props;
  const footerClasses = classNames({
    [classes.footer]: true,
    [classes.footerWhiteFont]: whiteFont
  });
  const aClasses = classNames({
    [classes.a]: true,
    [classes.footerWhiteFont]: whiteFont
  });
  const theme = useSelector((state) => state.theme);

  return (
    <footer className={footerClasses + " section"}>

      <div className="footer_home">
        <div className={classes.container}>
          <div className="subscribe_section">
            <div className="container">
              <GridContainer>
                <GridItem sm={6} md={6}>
                  <div className="footer_content">
                    {/* <img src={require("../../assets/images/v_bit/logo.png")} alt="Logo" className="img-fluid footer_logo" /> */}
                    {(theme && theme.value === "dark") ? <img src={require("../../assets/images/logo.png")} alt="logo" className="img-fluid footer_logo" /> : <img src={require("../../assets/images/logo.png")} alt="logo" className="img-fluid footer_logo" />}
        
                    <div className="footer_social_links_v_bit">
                      <ul>
                        <li>
                          <a href="https://twitter.com/EthaxCrypto" target="_blank">
                            <i className="fab fa-twitter"></i>
                          </a>
                        </li>
                        <li>
                          <a href="https://t.me/ETHAXCRYPTOPUBLIC" target="_blank">
                            <i className="fab fa-telegram-plane"></i>
                          </a>
                        </li>
                        <li>
                          <a href="https://www.instagram.com/ethaxcrypto/" target="_blank">
                            <i className="fab fa-instagram"></i>
                          </a>
                        </li>
                        <li>
                          <a href="https://www.facebook.com/ethaxcrypto/" target="_blank">
                            <i className="fab fa-facebook-f"></i>
                          </a>
                        </li>
                        {/* <li>
                          <a href="https://www.tiktok.com/@ethaxcrypto" target="_blank">
                           <i className="fab fa-tiktok"></i>
                          </a>
                        </li> */}
                        <li>
                          <a href="https://www.youtube.com/channel/UCDTxZjA0x7PS1LxXC4S7XgA" target="_blank">
                            <i className="fab fa-youtube"></i>
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </GridItem>
                
              </GridContainer>
              <div className="footer-bottom-links">
                <a className="buy_btn" href="/audit" target="_blank" scale="sm">Audits</a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}

Footer.propTypes = {
  whiteFont: PropTypes.bool
};



