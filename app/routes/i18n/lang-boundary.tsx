import { Outlet, useParams, type LoaderFunctionArgs } from "react-router";
import i18n from "~/i18n/i18n";
import { useEffect } from "react";
import { usePreferencesStore } from "~/hooks/use-user-preference-store";
import appPathname, { getPreferencesFromLoaderFunctionArgs } from "~/lib/app-pathname";

export async function loader(args: LoaderFunctionArgs) {
  const preferences = getPreferencesFromLoaderFunctionArgs(args);

  if (i18n.language !== preferences.language) {
    await i18n.changeLanguage(preferences.language);
  }

  return null;
}

export default function LangBoundary() {
  const { lang } = useParams();
  const { setLanguage, preferences } = usePreferencesStore();

  useEffect(() => {
    if (lang) {
      if (i18n.language !== lang) {
        i18n.changeLanguage(lang);
      }

      if (preferences.language !== lang) {
        setLanguage(lang);
      }

      document.documentElement.lang = lang;
    }
  }, [lang, preferences.language]);

  return <Outlet />;
}