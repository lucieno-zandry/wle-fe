import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enCommon from "~/translation/locales/en.json";
import frCommon from "~/translation/locales/fr.json";

import enAddresses from "~/routes/frontoffice/addresses/translation/locales/en.json";
import frAddresses from "~/routes/frontoffice/addresses/translation/locales/fr.json";

import enCheckout from "~/routes/frontoffice/checkout/translation/locales/en.json";
import frCheckout from "~/routes/frontoffice/checkout/translation/locales/fr.json";

import enLanding from "~/routes/frontoffice/landing/translation/locales/en.json";
import frLanding from "~/routes/frontoffice/landing/translation/locales/fr.json";


import enProduct from "./locales/en/product.json";
import frProduct from "./locales/fr/product.json";

import enSearchResults from "~/routes/frontoffice/search/translation/locales/en.json";
import frSearchResults from "~/routes/frontoffice/search/translation/locales/fr.json";

import enProducts from "./locales/en/products.json";
import frProducts from "./locales/fr/products.json";

import enSettings from "./locales/en/settings.json";
import frSettings from "./locales/fr/settings.json";

import enProductDetail from "~/routes/frontoffice/product-detail/translation/locales/en.json";
import frProductDetail from "~/routes/frontoffice/product-detail/translation/locales/fr.json";

import enOrders from "~/routes/frontoffice/orders/translation/locales/en.json";
import frOrders from "~/routes/frontoffice/orders/translation/locales/fr.json";

import enOrderDetails from "~/routes/frontoffice/order-details/translation/locales/en.json";
import frOrderDetails from "~/routes/frontoffice/order-details/translation/locales/fr.json";

i18n
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    supportedLngs: ["en", "fr"],
    debug: import.meta.env.DEV,

    ns: ["common", "home", "addresses", "checkout", "product", "search_results", "products", "settings", "product-detail", "landing", "orders", "order-details"],
    defaultNS: "common",

    resources: {
      en: {
        common: enCommon,
        addresses: enAddresses,
        checkout: enCheckout,
        product: enProduct,
        search_results: enSearchResults,
        products: enProducts,
        settings: enSettings,
        "product-detail": enProductDetail,
        landing: enLanding,
        orders: enOrders,
        "order-details": enOrderDetails,
      },
      fr: {
        common: frCommon,
        addresses: frAddresses,
        checkout: frCheckout,
        product: frProduct,
        search_results: frSearchResults,
        products: frProducts,
        settings: frSettings,
        "product-detail": frProductDetail,
        landing: frLanding,
        orders: frOrders,
        "order-details": frOrderDetails
      },
    },

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;