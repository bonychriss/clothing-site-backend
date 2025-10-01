import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// The translations
// (tip: move them in a JSON file and import them,
// or even better, manage them via a UI: https://react.i18next.com/guides/multiple-translation-files)
const resources = {
  en: {
    translation: {
  "documentTitle": "Sabor Español",
      "metaDescription": "Shop the latest arrivals for men, women & kids. Fast delivery, free returns, and secure payments. Discover Sabor Best Picks and new season essentials.",
  "heroTitle": "𝓈𝒶𝒷ℴ𝓇 ℰ𝓈𝓅𝒶ñℴ𝓁",
  "heroSubtitle": "𝒸𝓁ℴ𝓉𝒽𝒾𝓃ℊ 𝓌𝒾𝓉𝒽 𝒶𝓉𝓉𝒾𝓉𝓊𝒹ℯ",
      "shopNewArrivals": "Shop New Arrivals",
      "viewBestPicks": "View Best Picks",
      "shopByCategory": "Shop by Category",
      "bestPicks": "Sabor Best Picks",
      "selectSize": "Select Size",
      "newSeasonNewYou": "New Season. New You.",
      "shopNow": "Shop Now",
      "customerTestimonials": "What Our Customers Say",
      "companyInfo": "Company Info",
      "companyInfoText": "We believe fashion should be fun, affordable, and accessible to everyone. Our mission is to deliver the latest styles with great quality and service.",
      "exclusiveOffers": "Get Exclusive Offers",
      "yourEmail": "Your email",
      "subscribe": "Subscribe",
      "followUs": "Follow Us",
      "copyright": "Sabor Clothing. All rights reserved."
    }
  },
  fr: {
    translation: {
  "documentTitle": "Sabor Español",
      "metaDescription": "Achetez les derniers arrivages pour hommes, femmes et enfants. Livraison rapide, retours gratuits et paiements sécurisés. Découvrez les meilleurs choix Sabor et les essentiels de la nouvelle saison.",
  "heroTitle": "𝓈𝒶𝒷ℴ𝓇 ℰ𝓈𝓅𝒶ñℴ𝓁",
  "heroSubtitle": "𝒸𝓁ℴ𝓉𝒽𝒾𝓃ℊ 𝓌𝒾𝓉𝒽 𝒶𝓉𝓉𝒾𝓉𝓊𝒹ℯ",
      "shopNewArrivals": "Nouveaux Arrivages",
      "viewBestPicks": "Voir les meilleurs choix",
      "shopByCategory": "Acheter par catégorie",
      "bestPicks": "Meilleurs Choix Sabor",
      "selectSize": "Choisir la taille",
      "newSeasonNewYou": "Nouvelle Saison. Nouveau Vous.",
      "shopNow": "Achetez maintenant",
      "customerTestimonials": "Ce que disent nos clients",
      "companyInfo": "Infos sur l'entreprise",
      "companyInfoText": "Nous croyons que la mode doit être amusante, abordable et accessible à tous. Notre mission est de fournir les derniers styles avec une grande qualité et un excellent service.",
      "exclusiveOffers": "Recevez des offres exclusives",
      "yourEmail": "Votre e-mail",
      "subscribe": "S'abonner",
      "followUs": "Suivez-nous",
      "copyright": "Sabor Vêtements. Tous droits réservés."
    }
  },
  sw: {
    translation: {
  "documentTitle": "Sabor Español",
      "metaDescription": "Nunua bidhaa mpya kwa wanaume, wanawake na watoto. Uwasilishaji wa haraka, urejeshaji bila malipo, na malipo salama. Gundua Chaguo Bora za Sabor na mambo muhimu ya msimu mpya.",
  "heroTitle": "𝓈𝒶𝒷ℴ𝓇 ℰ𝓈𝓅𝒶ñℴ𝓁",
  "heroSubtitle": "𝒸𝓁ℴ𝓉𝒽𝒾𝓃ℊ 𝓌𝒾𝓉𝒽 𝒶𝓉𝓉𝒾𝓉𝓊𝒹ℯ",
      "shopNewArrivals": "Nunua Bidhaa Mpya",
      "viewBestPicks": "Tazama Chaguo Bora",
      "shopByCategory": "Nunua kwa Kategoria",
      "bestPicks": "Chaguo Bora za Sabor",
      "selectSize": "Chagua Ukubwa",
      "newSeasonNewYou": "Msimu Mpya. Wewe Mpya.",
      "shopNow": "Nunua Sasa",
      "customerTestimonials": "Wateja Wetu Wanasema Nini",
      "companyInfo": "Kuhusu Kampuni",
      "companyInfoText": "Tunaamini mitindo inapaswa kufurahisha, kuwa na bei nafuu, na kupatikana kwa kila mtu. Dhamira yetu ni kutoa mitindo ya hivi karibuni yenye ubora na huduma bora.",
      "exclusiveOffers": "Pata Ofa za Kipekee",
      "yourEmail": "Barua pepe yako",
      "subscribe": "Jiandikishe",
      "followUs": "Tufuate",
      "copyright": "Sabor Nguo. Haki zote zimehifadhiwa."
    }
  }
};

i18n
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    resources,
    fallbackLng: 'en', // Use English if detected language is not available
    interpolation: {
      escapeValue: false // React already safes from xss
    }
  });

export default i18n;