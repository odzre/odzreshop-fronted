"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "@/locales/en/translation.json";
import id from "@/locales/id/translation.json";

if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      debug: false, // ⬅️ matikan logger i18next

      resources: {
        en: { translation: en },
        id: { translation: id }
      },

      lng: "id",
      fallbackLng: "id",
      supportedLngs: ["id", "en"],

      interpolation: {
        escapeValue: false
      },

      react: {
        useSuspense: false
      }
    });
}

export default i18n;