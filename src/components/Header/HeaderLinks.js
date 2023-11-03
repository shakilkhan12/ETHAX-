/*eslint-disable*/
import React from "react";
// react components for routing our app without refresh
import { NavLink } from "react-router-dom";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import { useTranslation } from 'react-i18next';
import styles from "../../assets/jss/material-kit-react/components/headerLinksStyle.js";

import { Link } from 'react-scroll'
import { AppBar, Toolbar, IconButton, Hidden, Drawer, Button, } from "@material-ui/core";

const useStyles = makeStyles(styles);

let arr = [
  { value: 'en', label: 'English' },
  { value: 'sv', label: 'svenska' },
  { value: 'sw', label: 'Kiswahili' },
  { value: 'tr', label: 'Türkçe' },
  { value: 'uk', label: 'Український' },
  { value: 'vi', label: 'Tiếng Việt' },
  { value: 'zhCNT', label: '简体中文' },
  { value: 'zhTWT', label: '繁体中文' },
  { value: 'es', label: 'Español' },
  { value: 'fi', label: 'suomi' },
  { value: 'fr', label: 'français' },
  { value: 'iw', label: 'עִברִית' },
  { value: 'hu', label: 'Magyar' },
  { value: 'ms', label: 'bahasa Indonesia' },
  { value: 'it', label: 'Italiano' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' },
  { value: 'nl', label: 'Nederlands' },
  { value: 'no', label: 'norsk' },
  { value: 'pl', label: 'Polskie' },
  { value: 'pt', label: 'português' },
  { value: 'ro', label: 'Română' },
  { value: 'ru', label: 'русский' },
  { value: 'sr', label: 'Српски' },
  { value: 'af', label: 'Afrikaans' },
  { value: 'ar', label: 'العربية' },
  { value: 'ca', label: 'Català' },
  { value: 'cs', label: 'čeština' },
  { value: 'da', label: 'dansk' },
  { value: 'de', label: 'Deutsch' },
  { value: 'el', label: 'ελληνικά' },

]
export default function HeaderLinks(props) {
  const classes = useStyles();
  const [lang, setLang] = React.useState('en');
  const { t, i18n } = useTranslation();
  React.useEffect(() => {
    changeLanguageFunction();
  }, []);


  const changeLanguageFunction = () => {
    let getLang = localStorage.getItem('code')
    if (!getLang) {
      localStorage.setItem('code', 'en')
      setLang(localStorage.getItem('code'))
      i18n.changeLanguage(lang)
    } else {
      setLang(getLang)
      i18n.changeLanguage(getLang)
    }
  }
  async function selectlanguage(event) {
    let language = event.target.value;
    localStorage.setItem('code', language)
    i18n.changeLanguage(language)
  }
  return (
    <div className="home_page_menu">
      <Hidden lgUp>
        <List className={classes.list + " main_navbar"}>
          <ListItem className={classes.listItem}>
            <a href="/exchange" color="transparent" className={classes.navLink}>{t("EXCHANGE")}</a>
          </ListItem>
          {/* <ListItem className={classes.listItem}>
            <a href="/liquidity" color="transparent" className={classes.navLink}>{t("LIQUIDITY")}</a>
          </ListItem> */}
          <ListItem className={classes.listItem}>
            <a href="/farms" color="transparent" className={classes.navLink}>{t("FARMS")}</a>
          </ListItem>
          <ListItem className={classes.listItem}>
            <a href="/pools" color="transparent" className={classes.navLink}>{t("POOLS")}</a>
          </ListItem>
          
          {/* <ListItem className={classes.listItem}>
            <Link to="why" spy={true} smooth={true} offset={-100} duration={250} color="transparent" className={classes.navLink}>Features</Link>
          </ListItem>

          <ListItem className={classes.listItem}>
            <Link to="product" spy={true} smooth={true} offset={-100} duration={250} color="transparent" className={classes.navLink}>Product & Services</Link>
          </ListItem>

          <ListItem className={classes.listItem}>
            <Link to="token" spy={true} smooth={true} offset={-100} duration={250} color="transparent" className={classes.navLink}>Token Details</Link>
          </ListItem>

          <ListItem className={classes.listItem}>
            <Link to="roadmap" spy={true} smooth={true} offset={-100} duration={250} color="transparent" className={classes.navLink}>Road Map</Link>
          </ListItem> */}

          {/* <ListItem className={classes.listItem + " menu_dropdown"}>
            <CustomDropdown
              noLiPadding
              buttonText="Contract"
              dropdownList={[
                <a href="https://github.com/" target="_blank" className={classes.dropdownLink}>
                  GitHub
                </a>,        
                <a href="https://bscscan.com/" target="_blank" className={classes.dropdownLink}>
                  BscScan
                </a>,
                <a href="https://etherscan.io/tokens" target="_blank" className={classes.dropdownLink}>
                  Token Tracker
                </a>,
              ]}
            />
          </ListItem> */}

          {/* <ListItem className={classes.listItem}>
            <Link to="contact" spy={true} smooth={true} offset={-100} duration={250} color="transparent" className={classes.navLink}>Contact Us</Link>
          </ListItem> */}

          {/* <ListItem className={classes.listItem}>
            <Button className="primary_btn"><Link to="/buy" color="transparent" className="nav-link p-0">Launch App</Link></Button>
          </ListItem> */}
        </List>
      </Hidden>
      <List>
        <ListItem className={classes.listItem}>
          <Button className="home_primary_btn"><a href="https://www.ethax.io/#/exchange" target="_blank">{t("LAUNCH_APP")}</a></Button>
        </ListItem>


        {/*Multi Language */}

        <select className="lang_select" onChange={selectlanguage}>
          {
            arr && arr.length > 0 && arr.map((item, index) => {
              return (
                <option value={item.value} key={index} selected={lang === item.value ? true : false}>{item.label}</option>
              )
            })
          }
        </select>

      </List>

    </div>
  );
}
