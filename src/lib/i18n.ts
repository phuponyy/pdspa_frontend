import { DEFAULT_LANG, SUPPORTED_LANGS, type SupportedLang } from "./constants";

export const dictionaries = {
  vn: {
    nav: {
      home: "Trang chu",
      about: "Gioi thieu",
      services: "Dich vu",
      price: "Bang gia",
      news: "Tin tuc",
      contact: "Lien he",
      admin: "Quan tri",
    },
    hero: {
      badge: "Wellness studio",
      title: "Panda Spa & Massage",
      subtitle:
        "Khong gian thu gian, ky thuat vien chuyen nghiep, trung tam cham soc co the va tinh than.",
      ctaPrimary: "Dat lich",
      ctaSecondary: "Tu van nhanh",
    },
    sections: {
      services: "Dich vu noi bat",
      features: "Ly do chon Panda Spa",
      contact: "Nhan tu van & uu dai",
    },
    form: {
      fullName: "Ho ten",
      phone: "So dien thoai",
      email: "Email",
      note: "Ghi chu",
      submit: "Gui yeu cau",
      pickServices: "Chon dich vu",
    },
    admin: {
      loginTitle: "Dang nhap quan tri",
      email: "Email",
      password: "Mat khau",
      signIn: "Dang nhap",
      leads: "Lead",
      dashboard: "Tong quan",
      pageEditor: "Trang chu",
      logout: "Dang xuat",
    },
  },
  en: {
    nav: {
      home: "Home",
      about: "About",
      services: "Services",
      price: "Price list",
      news: "News",
      contact: "Contact",
      admin: "Admin",
    },
    hero: {
      badge: "Wellness studio",
      title: "Panda Spa & Massage",
      subtitle:
        "A calm, curated sanctuary with expert therapists and tailored rituals.",
      ctaPrimary: "Book now",
      ctaSecondary: "Quick consult",
    },
    sections: {
      services: "Signature services",
      features: "Why Panda Spa",
      contact: "Reserve & consult",
    },
    form: {
      fullName: "Full name",
      phone: "Phone number",
      email: "Email",
      note: "Note",
      submit: "Send request",
      pickServices: "Select services",
    },
    admin: {
      loginTitle: "Admin login",
      email: "Email",
      password: "Password",
      signIn: "Sign in",
      leads: "Leads",
      dashboard: "Overview",
      pageEditor: "Homepage",
      logout: "Sign out",
    },
  },
} as const;

export const getDefaultLang = () => DEFAULT_LANG;

export const isSupportedLang = (lang: string): lang is SupportedLang =>
  SUPPORTED_LANGS.includes(lang as SupportedLang);

export const getDictionary = (lang: string) => {
  if (isSupportedLang(lang)) {
    return dictionaries[lang];
  }
  return dictionaries[DEFAULT_LANG];
};
