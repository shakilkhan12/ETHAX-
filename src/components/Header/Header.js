import React from "react";
// nodejs library that concatenates classes
import classNames from "classnames";
// nodejs library to set properties for components
import PropTypes from "prop-types";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
// @material-ui/icons
import Menu from "@material-ui/icons/Menu";
import { Link } from "react-router-dom";
// core components
import styles from "../../assets/jss/material-kit-react/components/headerStyle.js";
import { NavLink } from "react-router-dom";
import { AppBar, Toolbar, IconButton, Hidden, Drawer, List, ListItem, } from "@material-ui/core";
import { useTranslation } from 'react-i18next';

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
var itemdataarray = []
const useStyles = makeStyles(styles);

export default function Header(props) {

  const classes = useStyles();
  const { t, i18n } = useTranslation();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [lang, setLang] = React.useState('en');
  const [file, setfile] = React.useState(null)

  React.useEffect(() => {
    if (props.changeColorOnScroll) {
      window.addEventListener("scroll", headerColorChange);
    }
    return function cleanup() {
      if (props.changeColorOnScroll) {
        window.removeEventListener("scroll", headerColorChange);
      }
    };

  }, []);

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

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  async function selectlanguage(event) {
    let language = event.target.value;
    localStorage.setItem('code', language)
    i18n.changeLanguage(language)
  }


  const headerColorChange = () => {
    const { color, changeColorOnScroll } = props;
    const windowsScrollTop = window.pageYOffset;
    if (windowsScrollTop > changeColorOnScroll.height) {
      document.body
        .getElementsByTagName("header")[0]
        .classList.remove(classes[color]);
      document.body
        .getElementsByTagName("header")[0]
        .classList.add(classes[changeColorOnScroll.color]);
    } else {
      document.body
        .getElementsByTagName("header")[0]
        .classList.add(classes[color]);
      document.body
        .getElementsByTagName("header")[0]
        .classList.remove(classes[changeColorOnScroll.color]);
    }
  };
  const { color, rightLinks, leftLinks, brand, fixed, absolute } = props;
  const appBarClasses = classNames({
    [classes.appBar]: true,
    [classes[color]]: color,
    [classes.absolute]: absolute,
    [classes.fixed]: fixed
  });
  const brandComponent = <Link to="/home" className="logo_div">{brand}</Link>;



  return (
    <AppBar className={appBarClasses}>
      <Toolbar className="container-fluid menue_chiled_flex">
        {leftLinks !== undefined ? brandComponent : null}
        <div className={classes.flex}>
          {leftLinks !== undefined ? (
            <Hidden mdDown implementation="css">
              {leftLinks}
            </Hidden>
          ) : (
            brandComponent
          )}
          <Hidden mdDown>
            <List className={classes.list + " main_navbar flex_bar"}>
              <ListItem className={classes.listItem}>
                <NavLink to="/exchange" color="transparent" className={classes.navLink} rel="noopener noreferrer">{t("EXCHANGE")}</NavLink>
              </ListItem>
              <ListItem className={classes.listItem}>
                <NavLink to="/liquidity" color="transparent" className={classes.navLink} rel="noopener noreferrer">{t("LIQUIDITY")}</NavLink>
              </ListItem>
              <ListItem className={classes.listItem}>
                <NavLink to="/farms" color="transparent" className={classes.navLink} rel="noopener noreferrer">{t("FARMS")}</NavLink>
              </ListItem>
              <ListItem className={classes.listItem}>
                <NavLink to="/pools" color="transparent" className={classes.navLink} rel="noopener noreferrer">{t("POOLS")}</NavLink>
              </ListItem>
              
            </List>
            {/* <select className="lang_select" onChange={selectlanguage}>
              {
                arr && arr.length > 0 && arr.map((item, index) => {
                  return (
                    <option value={item.value} key={index} selected={lang === item.value ? true : false}>{item.label}</option>
                  )
                })
              }
            </select> */}


          </Hidden>
        </div>
        <Hidden mdDown implementation="css">
          {rightLinks}
        </Hidden>
        <Hidden lgUp>
          <IconButton
            className="hamburger_icon"
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
          >
            <Menu />
          </IconButton>
        </Hidden>
      </Toolbar>
      <Hidden lgUp implementation="js">
        <Drawer
          variant="temporary"
          anchor={"right"}
          open={mobileOpen}
          classes={{
            paper: classes.drawerPaper + " mobile_nav"
          }}
          onClose={handleDrawerToggle}
        >
          <div className={classes.appResponsive}>
            {leftLinks}
            {rightLinks}
          </div>
        </Drawer>
      </Hidden>
    </AppBar>
  );
}

Header.defaultProp = {
  color: "white"
};

Header.propTypes = {
  color: PropTypes.oneOf([
    "primary",
    "info",
    "success",
    "warning",
    "danger",
    "transparent",
    "white",
    "rose",
    "dark"
  ]),
  rightLinks: PropTypes.node,
  leftLinks: PropTypes.node,
  brand: PropTypes.string,
  fixed: PropTypes.bool,
  absolute: PropTypes.bool,
  // this will cause the sidebar to change the color from
  // props.color (see above) to changeColorOnScroll.color
  // when the window.pageYOffset is heigher or equal to
  // changeColorOnScroll.height and then when it is smaller than
  // changeColorOnScroll.height change it back to
  // props.color (see above)
  changeColorOnScroll: PropTypes.shape({
    height: PropTypes.number.isRequired,
    color: PropTypes.oneOf([
      "primary",
      "info",
      "success",
      "warning",
      "danger",
      "transparent",
      "white",
      "rose",
      "dark"
    ]).isRequired
  })
};
