/**
 * Internationalization (i18n) Configuration
 * 
 * This file configures i18next for multilingual support in the application.
 * Supported languages: English, Spanish, French, German, Italian
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations
import enTranslation from './locales/en.json';
import esTranslation from './locales/es.json';
import frTranslation from './locales/fr.json';
import deTranslation from './locales/de.json';
import itTranslation from './locales/it.json';

// Configure i18next
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation
      },
      es: {
        translation: esTranslation
      },
      fr: {
        translation: frTranslation
      },
      de: {
        translation: deTranslation
      },
      it: {
        translation: itTranslation
      }
    },
    lng: 'en', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes values
    },
    react: {
      useSuspense: false // Disable suspense for React
    }
  });

export default i18n;
