import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// import locales
import svTranslation from './sv';//Swedish
import swTranslation from './sw';//Swahili
import trTranslation from "./tr";//Turkish
import ukTranslation from "./uk";//Ukrainian
import viTranslation from "./vi"//Vietnamese
import zhCNTranslation from "./zh-CN"//Simplified-Chinesh
import zhTWTranslation from "./zh-TW"//Traditional-Chinish
import esTranslation from "./es"//Spanish
import fiTranslation from "./fi"//finnish
import frTranslation from "./fr"//french
import iwTranslation from "./iw"//hebrew
import huTranslation from "./hu"//hungarian
import msTranslation from "./ms"//malay(Indonesian)
import itTranslation from "./it"//Italian
import jaTranslation from "./ja"//Japanesh
import koTranslation from "./ko"//Korean
import nlTranslation from "./nl"//Netherland(dutch)
import noTranslation from "./no"//Norsk(norwegian)
import plTranslation from "./pl"//polskie(Polish)
import ptTranslation from "./pt"//Portugues
import roTranslation from "./ro"//Romanian
import ruTranslation from "./ru"//pyccknn(russian)
import srTranslation from "./sr"//cpncknc(serbian)
import enTranslation from './en'//english
import afTranslation from './af';//afrikaans/
import arTranslation from './ar';//Arabic
import caTranslation from './ca';//Catalan
import csTranslation from "./cs";//Czech(Cestina)
import daTranslation from "./da";//Danish
import deTranslation from "./de";//German(Deutsch)
import elTranslation from "./el";//Greek



// the translations
// (tip move them in a JSON file and import them)
const resources = {
    sv: {
        'translation': svTranslation
    },
    sw: {
        'translation': swTranslation
    },
    tr: {
        'translation': trTranslation
    },
    uk: {
        'translation': ukTranslation
    },
    vi: {
        'translation': viTranslation
    },
    zhCNT: {
        'translation': zhCNTranslation
    },
    zhTWT: {
        'translation': zhTWTranslation
    },
    es: {
        'translation': esTranslation
    },
    fi: {
        'translation': fiTranslation
    },
    fr: {
        'translation': frTranslation
    },
    iw: {
        'translation': iwTranslation
    },
    hu: {
        'translation': huTranslation
    },
    ms: {
        'translation': msTranslation
    },
    it: {
        'translation': itTranslation
    },
    ja: {
        'translation': jaTranslation
    },
    ko: {
        'translation': koTranslation
    },
    nl: {
        'translation': nlTranslation
    },
    no: {
        'translation': noTranslation
    },
    pl: {
        'translation': plTranslation
    },
    pt: {
        'translation': ptTranslation
    },
    ro: {
        'translation': roTranslation
    },
    ru: {
        'translation': ruTranslation
    },
    sr: {
        'translation': srTranslation
    },
    en: {
        'translation': enTranslation
    },
    af: {
        'translation': afTranslation
    },
    ar: {
        'translation': arTranslation
    },
    ca: {
        'translation': caTranslation
    },
    cs: {
        'translation': csTranslation
    },
    da: {
        'translation': daTranslation
    },
    de: {
        'translation': deTranslation
    },
    el: {
        'translation': elTranslation
    }
};

i18n
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
        resources,
        lng: "en",

        keySeparator: false, // we do not use keys in form messages.welcome

        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

export default i18n;