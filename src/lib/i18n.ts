import { DEFAULT_LANG, SUPPORTED_LANGS, type SupportedLang } from "./constants";

export const resources = {
  vn: {
    translation: {
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
        sending: "Dang gui...",
        success:
          "Chung toi da nhan duoc yeu cau. Doi ngu se lien he som.",
        error: "Khong the gui luc nay. Vui long thu lai.",
        servicesEmpty:
          "Danh sach dich vu dang cap nhat. Vui long lien he truc tiep.",
        optionLabel: "Lua chon",
        qtyLabel: "So luong",
        priceFrom: "Gia tu",
        total: "Tong",
        serviceDescriptionFallback:
          "Tu van va de xuat phu hop voi nhu cau cua ban.",
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
      settings: {
        title: "Cai dat He thong",
        save: "Luu",
        navbar: "NAVBAR",
        headerInfo: "Thong tin Header",
        menuLabel: "Ten menu",
        menuLink: "Duong dan",
        address: "Dia chi",
        hours: "Gio mo cua",
        phonePrimary: "So dien thoai chinh",
        phoneSecondary: "So dien thoai phu",
        addMenu: "Them menu",
        delete: "Xoa",
        common: "CHUNG",
        region: "CAI DAT KHU VUC",
        security: "BAO MAT",
        forceHttps: "Bat buoc HTTPS",
        twoFactor: "Xac thuc hai yeu to",
        enabled: "Da bat",
      },
      contactPage: {
        eyebrow: "Lien he",
        title: "Ket noi voi Panda Spa",
        description: "De lai thong tin de nhan tu van va dat lich nhanh.",
        detailsLabel: "Thong tin",
        detailsName: "Panda Spa Da Nang",
        reachLabel: "Huong dan",
        reachText:
          "Ngay trung tam thanh pho Da Nang, gan cau Rong va song Han.",
      },
      aboutPage: {
        eyebrow: "Gioi thieu",
        title: "Good Massage in Da Nang",
        description:
          "Panda Spa la noi ket hop giua tri lieu co the va cham soc tinh than. Moi lieu trinh duoc thiet ke boi ky thuat vien chuyen nghiep voi khong gian yen tinh, huong tinh dau, va cham soc an can.",
        therapistsTitle: "Ky thuat vien",
        therapistsText: "Dao tao bai ban, tap trung vao su an toan va hieu qua.",
        atmosphereTitle: "Khong gian",
        atmosphereText:
          "Thien nhien, am ap, ket hop huong tinh dau va am nhac.",
        highlight1: "Ky thuat massage chuan spa",
        highlight2: "Tinh dau va thao moc thien nhien",
        highlight3: "Cham soc ca nhan hoa",
        highlightText:
          "Truc tiep tu doi ngu Panda Spa, dieu chinh theo nhu cau cua ban.",
      },
      servicesPage: {
        eyebrow: "Dich vu",
        title: "Tat ca dich vu Panda Spa",
        description:
          "Lua chon tu nhung lieu trinh cham soc co the, da va hoi phuc nang luong.",
        serviceFallback: "Lieu trinh phu hop moi nhu cau.",
        emptyState:
          "Danh sach dich vu dang cap nhat. Vui long lien he truc tiep.",
      },
      pricePage: {
        eyebrow: "Bang gia",
        title: "Bang gia dich vu",
        description: "Gia niem yet co the thay doi theo tung chuong trinh.",
        serviceFallback: "Lieu trinh cao cap.",
        emptyState:
          "Bang gia dang cap nhat. Vui long lien he de biet them.",
      },
      newsPage: {
        eyebrow: "Tin tuc",
        title: "Cap nhat tu Panda Spa",
        description:
          "Chung toi se cap nhat chuong trinh uu dai va bai viet moi tai day.",
        emptyState: "Chua co bai viet moi. Vui long quay lai sau.",
      },
    },
  },
  en: {
    translation: {
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
        sending: "Sending...",
        success: "We received your request. Our team will reach out shortly.",
        error: "Unable to submit right now. Please try again.",
        servicesEmpty: "Services are being updated. Please contact us directly.",
        optionLabel: "Option",
        qtyLabel: "Qty",
        priceFrom: "Price from",
        total: "Total",
        serviceDescriptionFallback:
          "Tailored recommendation with our team.",
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
      settings: {
        title: "System Settings",
        save: "Save",
        navbar: "NAVBAR",
        headerInfo: "Header info",
        menuLabel: "Menu label",
        menuLink: "Link",
        address: "Address",
        hours: "Working time",
        phonePrimary: "Primary phone",
        phoneSecondary: "Secondary phone",
        addMenu: "Add menu",
        delete: "Delete",
        common: "GENERAL",
        region: "REGIONAL SETTINGS",
        security: "SECURITY",
        forceHttps: "Force HTTPS",
        twoFactor: "Two-factor authentication",
        enabled: "Enabled",
      },
      contactPage: {
        eyebrow: "Contact",
        title: "Reach Panda Spa",
        description: "Leave your details for quick consultation and booking.",
        detailsLabel: "Details",
        detailsName: "Panda Spa Da Nang",
        reachLabel: "How to reach",
        reachText:
          "Located in the heart of Da Nang, near the Han River and Dragon Bridge.",
      },
      aboutPage: {
        eyebrow: "About us",
        title: "Good Massage in Da Nang",
        description:
          "Panda Spa blends body therapy with mindful care. Each ritual is designed by experienced therapists in a serene space with aroma oils and attentive service.",
        therapistsTitle: "Therapists",
        therapistsText:
          "Trained with a focus on safety, pressure balance, and recovery.",
        atmosphereTitle: "Atmosphere",
        atmosphereText:
          "Warm, calm, and curated with essential oils and soft music.",
        highlight1: "Signature massage techniques",
        highlight2: "Natural oils & herbs",
        highlight3: "Personalized treatments",
        highlightText:
          "Crafted by Panda Spa specialists and tailored to your needs.",
      },
      servicesPage: {
        eyebrow: "Services",
        title: "Panda Spa services",
        description: "Choose from curated body, skin, and restoration rituals.",
        serviceFallback: "Tailored for your wellness goals.",
        emptyState: "Services are being updated. Please contact us directly.",
      },
      pricePage: {
        eyebrow: "Price list",
        title: "Service pricing",
        description: "Prices may vary depending on seasonal offers.",
        serviceFallback: "Premium therapy ritual.",
        emptyState: "Pricing is being updated. Please contact us for details.",
      },
      newsPage: {
        eyebrow: "News",
        title: "Updates from Panda Spa",
        description: "We will share offers and new articles here.",
        emptyState: "No updates yet. Please check back soon.",
      },
    },
  },
} as const;

export const getDefaultLang = () => DEFAULT_LANG;

export const isSupportedLang = (lang: string): lang is SupportedLang =>
  SUPPORTED_LANGS.includes(lang as SupportedLang);
