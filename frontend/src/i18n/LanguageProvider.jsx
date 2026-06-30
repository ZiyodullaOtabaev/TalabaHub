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

        // Planner
        plannerTitle: "Planner",
        plannerSub: "Task'larni yaratish, filtrlash va bajarilganini belgilash",
        newTask: "Yangi task",
        taskTitlePlaceholder: "Task nomi",
        addTask: "Qo'shish",
        tasks: "Tasklar",
        filterAll: "Hammasi",
        filterActive: "Bajarilmagan",
        filterDone: "Bajarilgan",
        countSuffix: "ta",
        loading: "Yuklanmoqda...",
        noTasks: "Hozircha task yo'q. Birinchi task'ni qo'shing ✅",
        deadline: "Muddat",
        priorityHigh: "Yuqori",
        priorityMedium: "O'rta",
        priorityLow: "Past",
        expired: "muddati tugadi",
        hoursLeft: "soat qoldi",
        daysLeft: "kun qoldi",

        // Profile
        profileTitle: "Profil",
        noEmail: "Email kiritilmagan",
        universityLabel: "Universitet",
        premiumStatus: "Premium holati",
        premiumUser: "Premium foydalanuvchi",
        freePlan: "Bepul reja",
        joined: "Ro'yxatdan o'tgan sana",
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

        // Planner
        plannerTitle: "Planner",
        plannerSub: "Create, filter and mark tasks as done",
        newTask: "New task",
        taskTitlePlaceholder: "Task title",
        addTask: "Add",
        tasks: "Tasks",
        filterAll: "All",
        filterActive: "Active",
        filterDone: "Done",
        countSuffix: "items",
        loading: "Loading...",
        noTasks: "No tasks yet. Add your first task ✅",
        deadline: "Deadline",
        priorityHigh: "High",
        priorityMedium: "Medium",
        priorityLow: "Low",
        expired: "expired",
        hoursLeft: "h left",
        daysLeft: "d left",

        // Profile
        profileTitle: "Profile",
        noEmail: "No email",
        universityLabel: "University",
        premiumStatus: "Premium status",
        premiumUser: "Premium user",
        freePlan: "Free plan",
        joined: "Joined",
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

        // Planner
        plannerTitle: "Планер",
        plannerSub: "Создавайте, фильтруйте и отмечайте задачи",
        newTask: "Новая задача",
        taskTitlePlaceholder: "Название задачи",
        addTask: "Добавить",
        tasks: "Задачи",
        filterAll: "Все",
        filterActive: "Активные",
        filterDone: "Выполненные",
        countSuffix: "шт.",
        loading: "Загрузка...",
        noTasks: "Пока нет задач. Добавьте первую ✅",
        deadline: "Срок",
        priorityHigh: "Высокий",
        priorityMedium: "Средний",
        priorityLow: "Низкий",
        expired: "просрочено",
        hoursLeft: "ч осталось",
        daysLeft: "д осталось",

        // Profile
        profileTitle: "Профиль",
        noEmail: "Нет email",
        universityLabel: "Университет",
        premiumStatus: "Премиум-статус",
        premiumUser: "Премиум",
        freePlan: "Бесплатный план",
        joined: "Дата регистрации",
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