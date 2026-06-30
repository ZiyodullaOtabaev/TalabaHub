import { createContext, useContext, useEffect, useMemo, useState } from "react";

const LanguageContext = createContext(null);

const DICT = {
    uz: {
        langName: "O‘zbek",
        chooseLanguage: "Tilni tanlang",
        chooseLanguageDesc: "Sayt tilini istalgan paytda o‘zgartirishingiz mumkin.",
        save: "Saqlash",
        cancel: "Bekor qilish",

        loginTitle: "Xush kelibsiz",
        loginSub: "TalabaHub hisobingizga kiring",
        username: "Username",
        email: "Email",
        password: "Parol",
        signIn: "Kirish",
        noAccount: "Akkountingiz yo‘qmi?",
        register: "Ro‘yxatdan o‘tish",

        registerTitle: "Hisob yaratish",
        registerSub: "TalabaHub’da ro‘yxatdan o‘ting",
        passwordRepeat: "Parolni qayta kiriting",
        createAccount: "Hisob yaratish",
        haveAccount: "Akkountingiz bormi?",
        login: "Kirish",

        dashboardTitle: "Dashboard",
        dashboardSub: "GPA va tasklaringizni bir joyda boshqaring",
        refresh: "Yangilash",
    },
    en: {
        langName: "English",
        chooseLanguage: "Choose language",
        chooseLanguageDesc: "You can change it anytime later.",
        save: "Save",
        cancel: "Cancel",

        loginTitle: "Welcome back",
        loginSub: "Sign in to your TalabaHub account",
        username: "Username",
        email: "Email",
        password: "Password",
        signIn: "Sign in",
        noAccount: "No account?",
        register: "Register",

        registerTitle: "Create account",
        registerSub: "Register on TalabaHub",
        passwordRepeat: "Repeat password",
        createAccount: "Create account",
        haveAccount: "Already have an account?",
        login: "Login",

        dashboardTitle: "Dashboard",
        dashboardSub: "Manage GPA and tasks in one place",
        refresh: "Refresh",
    },
    ru: {
        langName: "Русский",
        chooseLanguage: "Выберите язык",
        chooseLanguageDesc: "Вы сможете изменить язык позже в любое время.",
        save: "Сохранить",
        cancel: "Отмена",

        loginTitle: "С возвращением",
        loginSub: "Войдите в аккаунт TalabaHub",
        username: "Имя пользователя",
        email: "Email",
        password: "Пароль",
        signIn: "Войти",
        noAccount: "Нет аккаунта?",
        register: "Регистрация",

        registerTitle: "Создать аккаунт",
        registerSub: "Зарегистрируйтесь в TalabaHub",
        passwordRepeat: "Повторите пароль",
        createAccount: "Создать",
        haveAccount: "Уже есть аккаунт?",
        login: "Вход",

        dashboardTitle: "Dashboard",
        dashboardSub: "Управляйте GPA и задачами в одном месте",
        refresh: "Обновить",
    },
};

export function LanguageProvider({ children }) {
    const [lang, setLang] = useState(() => localStorage.getItem("lang") || "uz");
    const [hasChosenLang, setHasChosenLang] = useState(() => localStorage.getItem("hasChosenLang") === "1");

    useEffect(() => {
        localStorage.setItem("lang", lang);
    }, [lang]);

    const t = useMemo(() => DICT[lang] || DICT.uz, [lang]);

    function markChosen() {
        localStorage.setItem("hasChosenLang", "1");
        setHasChosenLang(true);
    }

    const value = useMemo(() => ({ lang, setLang, t, hasChosenLang, markChosen }), [lang, t, hasChosenLang]);

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang() {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error("useLang must be used inside LanguageProvider");
    return ctx;
}