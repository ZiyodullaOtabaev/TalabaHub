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

        // Navigation / Layout
        brandSub: "Talabalar paneli",
        navDashboard: "Dashboard",
        navGpa: "GPA",
        navPlanner: "Planner",
        navProfile: "Profil",
        logout: "Chiqish",
        themeLight: "Yorug'",
        themeDark: "Qorong'i",
        langUz: "O'zbek",
        langEn: "Ingliz",
        langRu: "Rus",
        close: "Yopish",

        // Dashboard
        subjectPlaceholder: "Fan nomi",
        creditPlaceholder: "Kredit",
        addSubject: "Fan qo'shish",
        statistics: "Statistika",
        total: "Jami",
        completed: "Bajarilgan",
        pending: "Kutilmoqda",
        upcoming: "Yaqinlashayotgan",
        freeTimeToday: "Bugun bo'sh vaqtingiz bor!",

        // GPA page
        gpaCalculator: "GPA Kalkulyator",
        gpaCalcSub: "Fanlarni qo'shib GPA hisoblang",
        subjectNamePlaceholder: "Fan nomi",
        yourGpa: "Sizning GPA",
        overallGpa: "Umumiy GPA",
        subjectsTitle: "Fanlar",
        noSubjects: "Hozircha fan yo'q. Birinchisini qo'shing ✅",
        creditLabel: "Kredit",
        gradeLabel: "Baho",
        scaleLabel: "Shkala",
        examCountdown: "Imtihongacha",
        examStarted: "Imtihon boshlandi",

        // Navigation
        navChat: "Chat",

        // Calendar
        plannerCalendar: "Planner kalendari",
        taskCalendar: "Vazifalar kalendari",
        calToday: "Bugun",
        calBack: "Orqaga",
        calNext: "Keyingi",
        calMonth: "Oy",
        calWeek: "Hafta",
        calDay: "Kun",
        calAgenda: "Reja",

        // Chat
        chatTitle: "Umumiy chat",
        chatSub: "Barcha talabalar bilan ta'lim haqida suhbatlashing",
        chatPlaceholder: "Xabar yozing...",
        chatSend: "Yuborish",
        chatEmpty: "Hali xabarlar yo'q. Birinchi bo'lib yozing!",
        chatLoading: "Yuklanmoqda...",
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

        // Navigation / Layout
        brandSub: "Student dashboard",
        navDashboard: "Dashboard",
        navGpa: "GPA",
        navPlanner: "Planner",
        navProfile: "Profile",
        logout: "Logout",
        themeLight: "Light",
        themeDark: "Dark",
        langUz: "Uzbek",
        langEn: "English",
        langRu: "Russian",
        close: "Close",

        // Dashboard
        subjectPlaceholder: "Subject name",
        creditPlaceholder: "Credit",
        addSubject: "Add subject",
        statistics: "Statistics",
        total: "Total",
        completed: "Completed",
        pending: "Pending",
        upcoming: "Upcoming",
        freeTimeToday: "You have free time today!",

        // GPA page
        gpaCalculator: "GPA Calculator",
        gpaCalcSub: "Add subjects to calculate your GPA",
        subjectNamePlaceholder: "Subject name",
        yourGpa: "Your GPA",
        overallGpa: "Overall GPA",
        subjectsTitle: "Subjects",
        noSubjects: "No subjects yet. Add your first one ✅",
        creditLabel: "Credit",
        gradeLabel: "Grade",
        scaleLabel: "Scale",
        examCountdown: "Exam Countdown",
        examStarted: "Exam started",

        // Navigation
        navChat: "Chat",

        // Calendar
        plannerCalendar: "Planner Calendar",
        taskCalendar: "Task Calendar",
        calToday: "Today",
        calBack: "Back",
        calNext: "Next",
        calMonth: "Month",
        calWeek: "Week",
        calDay: "Day",
        calAgenda: "Agenda",

        // Chat
        chatTitle: "Community Chat",
        chatSub: "Chat with all students about your studies",
        chatPlaceholder: "Type a message...",
        chatSend: "Send",
        chatEmpty: "No messages yet. Be the first to write!",
        chatLoading: "Loading...",
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

        // Navigation / Layout
        brandSub: "Панель студента",
        navDashboard: "Панель",
        navGpa: "GPA",
        navPlanner: "Планер",
        navProfile: "Профиль",
        logout: "Выйти",
        themeLight: "Светлая",
        themeDark: "Тёмная",
        langUz: "Узбекский",
        langEn: "Английский",
        langRu: "Русский",
        close: "Закрыть",

        // Dashboard
        subjectPlaceholder: "Название предмета",
        creditPlaceholder: "Кредит",
        addSubject: "Добавить предмет",
        statistics: "Статистика",
        total: "Всего",
        completed: "Выполнено",
        pending: "В ожидании",
        upcoming: "Предстоящие",
        freeTimeToday: "Сегодня у вас есть свободное время!",

        // GPA page
        gpaCalculator: "Калькулятор GPA",
        gpaCalcSub: "Добавьте предметы для расчёта GPA",
        subjectNamePlaceholder: "Название предмета",
        yourGpa: "Ваш GPA",
        overallGpa: "Общий GPA",
        subjectsTitle: "Предметы",
        noSubjects: "Пока нет предметов. Добавьте первый ✅",
        creditLabel: "Кредит",
        gradeLabel: "Оценка",
        scaleLabel: "Шкала",
        examCountdown: "До экзамена",
        examStarted: "Экзамен начался",

        // Navigation
        navChat: "Чат",

        // Calendar
        plannerCalendar: "Календарь планера",
        taskCalendar: "Календарь задач",
        calToday: "Сегодня",
        calBack: "Назад",
        calNext: "Вперёд",
        calMonth: "Месяц",
        calWeek: "Неделя",
        calDay: "День",
        calAgenda: "Список",

        // Chat
        chatTitle: "Общий чат",
        chatSub: "Общайтесь со всеми студентами об учёбе",
        chatPlaceholder: "Напишите сообщение...",
        chatSend: "Отправить",
        chatEmpty: "Сообщений пока нет. Будьте первым!",
        chatLoading: "Загрузка...",
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