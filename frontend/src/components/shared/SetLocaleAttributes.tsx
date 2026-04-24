"use client";

import { useEffect } from "react";

type Props = {
  locale: string;
  isRTL: boolean;
};

export default function SetLocaleAttributes({ locale, isRTL }: Props) {
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("lang", locale);
    html.setAttribute("dir", isRTL ? "rtl" : "ltr");

    if (isRTL) {
      document.body.style.fontFamily = "var(--font-arabic)";
    } else {
      document.body.style.fontFamily = "var(--font-sans)";
    }
  }, [locale, isRTL]);

  return null;
}
