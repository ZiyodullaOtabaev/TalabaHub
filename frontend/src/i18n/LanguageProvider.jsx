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
        roomsTitle: "Xonalar",
        roomGeneral: "Umumiy",
        newRoom: "Yangi xona",
        // AI suhbat
        aiChatTab: "AI suhbat",
        aiPlanTab: "Reja tuzish",
        aiChatPlaceholder: "Savolingizni yozing...",
        aiThinking: "O'ylayapti...",
        aiWelcome: "Salom! Men o'quv yordamchingizman. Dars, GPA yoki rejalashtirish bo'yicha so'rang.",
        // Admin
        navAdmin: "Admin panel",
        adminTitle: "Admin panel",
        adminSub: "Foydalanuvchilarni boshqaring va adminlarni tayinlang",
        roleOwner: "Egasi",
        roleAdmin: "Admin",
        roleStudent: "Talaba",
        makeAdmin: "Admin qilish",
        removeAdmin: "Adminlikdan olish",
        colRole: "Rol",
        colUser: "Foydalanuvchi",
        chatEmpty: "Hali xabarlar yo'q. Birinchi bo'lib yozing!",
        chatLoading: "Yuklanmoqda...",

        // ===== Yangi bo'limlar: navigatsiya =====
        navTimetable: "Dars jadvali",
        navResources: "Materiallar",
        navGoals: "Maqsadlar",
        navFocus: "Fokus",
        navAssistant: "AI yordamchi",
        navBoard: "E'lonlar",
        navLeaderboard: "Reyting",
        navNotifications: "Bildirishnomalar",
        navGrowth: "Shaxsiy rivojlanish",
        navIelts: "IELTS darslar",
        moreMenu: "Yana",

        // Darslar (Growth / IELTS)
        growthSub: "Motivatsiya, o'z-o'zini rivojlantirish va muvaffaqiyat darslari",
        ieltsSub: "IELTS imtihoniga tayyorgarlik video darslari",
        lessonChooseLang: "Qaysi tilda o'rganmoqchisiz?",
        lessonChooseLangDesc: "Materiallar siz tanlagan tilda ko'rsatiladi.",
        lessonChangeLang: "Tilni o'zgartirish",
        lessonAdd: "Video qo'shish",
        lessonUrlField: "YouTube havolasi",
        lessonEmpty: "Hali dars qo'shilmagan.",
        lessonSaveError: "Saqlashda xatolik. Havolani tekshiring.",

        // Umumiy
        save: "Saqlash",
        cancel: "Bekor qilish",
        add: "Qo'shish",
        delete: "O'chirish",
        open: "Ochish",
        titleField: "Sarlavha",

        // Hafta kunlari
        wdMon: "Dushanba",
        wdTue: "Seshanba",
        wdWed: "Chorshanba",
        wdThu: "Payshanba",
        wdFri: "Juma",
        wdSat: "Shanba",
        wdSun: "Yakshanba",

        // Dars jadvali
        timetableTitle: "Dars jadvali",
        timetableSub: "Haftalik darslaringizni boshqaring",
        addClass: "Dars qo'shish",
        subjectField: "Fan nomi",
        roomField: "Xona",
        teacherField: "O'qituvchi",
        startField: "Boshlanishi",
        endField: "Tugashi",
        weekdayField: "Hafta kuni",
        noClasses: "Bu kunda dars yo'q",

        // Materiallar
        resourcesTitle: "Materiallar",
        resourcesSub: "Konspekt, havola va foydali resurslar",
        addResource: "Material qo'shish",
        resUrlField: "Havola (URL)",
        resDescField: "Izoh",
        noResources: "Hali material yo'q. Birinchisini qo'shing.",
        openLink: "Ochish",

        // Maqsadlar va odatlar
        goalsTitle: "Maqsadlar va odatlar",
        goalsSub: "Maqsad qo'ying va kunlik odatlarni kuzating",
        tabGoals: "Maqsadlar",
        tabHabits: "Odatlar",
        addGoal: "Maqsad qo'shish",
        goalTitleField: "Maqsad nomi",
        targetField: "Maqsad qiymati",
        currentField: "Hozirgi qiymat",
        deadlineField: "Muddat",
        addHabit: "Odat qo'shish",
        habitTitleField: "Odat nomi",
        streakLabel: "kun ketma-ket",
        doneTodayLabel: "Bugun bajarildi",
        markTodayBtn: "Belgilash",
        noGoals: "Hali maqsad yo'q.",
        noHabits: "Hali odat yo'q.",

        // Fokus
        focusTitle: "Fokus rejimi",
        focusSub: "Pomodoro bilan diqqatni jamlang va o'qish vaqtini kuzating",
        statToday: "Bugun",
        statWeek: "Hafta",
        statAllTime: "Jami",
        minutesUnit: "daqiqa",
        focusHint: "Sessiya tugagach vaqt avtomatik saqlanadi",

        // AI yordamchi
        assistantTitle: "AI o'quv yordamchisi",
        assistantSub: "Imtihonga tayyorgarlik rejasini avtomatik tuzing",
        examDateField: "Imtihon sanasi",
        topicsField: "Mavzular (har birini yangi qatordan)",
        dailyHoursField: "Kunlik soat",
        generateBtn: "Reja tuzish",
        dayLabel: "kun",
        planEmptyHint: "Imtihon sanasi va mavzularni kiriting.",

        // E'lonlar
        boardTitle: "E'lonlar taxtasi",
        boardSub: "Kitob, hamxona, repetitor va tadbir e'lonlari",
        postAdBtn: "E'lon berish",
        adTitleField: "Sarlavha",
        adBodyField: "Matn",
        adContactField: "Aloqa (telefon/Telegram)",
        categoryField: "Turkum",
        catBook: "Kitob",
        catRoommate: "Hamxona",
        catTutor: "Repetitor",
        catEvent: "Tadbir",
        catOther: "Boshqa",
        noAds: "Hali e'lon yo'q.",

        // Bildirishnomalar
        notifTitle: "Bildirishnomalar",
        notifSub: "Muddati yaqin va o'tib ketgan vazifalar",
        notifEmpty: "Yangi bildirishnoma yo'q 🎉",
        overdueLabel: "Muddati o'tgan",
        dueSoonLabel: "Tez orada",

        // Reyting
        leaderboardTitle: "Reyting",
        leaderboardSub: "GPA bo'yicha eng yaxshi talabalar",
        rankCol: "O'rin",
        studentCol: "Talaba",
        gpaCol: "GPA",
        creditsCol: "Kreditlar",
        myRankLabel: "Sizning o'rningiz",
        noRanking: "Hali reyting yo'q. Fan va baholaringizni kiriting.",
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
        roomsTitle: "Rooms",
        roomGeneral: "General",
        newRoom: "New room",
        // AI chat
        aiChatTab: "AI Chat",
        aiPlanTab: "Study plan",
        aiChatPlaceholder: "Type your question...",
        aiThinking: "Thinking...",
        aiWelcome: "Hi! I'm your study assistant. Ask about classes, GPA or planning.",
        // Admin
        navAdmin: "Admin panel",
        adminTitle: "Admin panel",
        adminSub: "Manage users and appoint admins",
        roleOwner: "Owner",
        roleAdmin: "Admin",
        roleStudent: "Student",
        makeAdmin: "Make admin",
        removeAdmin: "Remove admin",
        colRole: "Role",
        colUser: "User",
        chatEmpty: "No messages yet. Be the first to write!",
        chatLoading: "Loading...",

        // ===== New sections: navigation =====
        navTimetable: "Timetable",
        navResources: "Resources",
        navGoals: "Goals",
        navFocus: "Focus",
        navAssistant: "AI Assistant",
        navBoard: "Board",
        navLeaderboard: "Leaderboard",
        navNotifications: "Notifications",
        navGrowth: "Personal Growth",
        navIelts: "IELTS Lessons",
        moreMenu: "More",

        // Lessons (Growth / IELTS)
        growthSub: "Motivation, self-development and success lessons",
        ieltsSub: "Video lessons to prepare for the IELTS exam",
        lessonChooseLang: "Which language do you want to learn in?",
        lessonChooseLangDesc: "Materials will be shown in the language you choose.",
        lessonChangeLang: "Change language",
        lessonAdd: "Add video",
        lessonUrlField: "YouTube link",
        lessonEmpty: "No lessons added yet.",
        lessonSaveError: "Failed to save. Check the link.",

        // Common
        save: "Save",
        cancel: "Cancel",
        add: "Add",
        delete: "Delete",
        open: "Open",
        titleField: "Title",

        // Weekdays
        wdMon: "Monday",
        wdTue: "Tuesday",
        wdWed: "Wednesday",
        wdThu: "Thursday",
        wdFri: "Friday",
        wdSat: "Saturday",
        wdSun: "Sunday",

        // Timetable
        timetableTitle: "Timetable",
        timetableSub: "Manage your weekly classes",
        addClass: "Add class",
        subjectField: "Subject",
        roomField: "Room",
        teacherField: "Teacher",
        startField: "Start",
        endField: "End",
        weekdayField: "Weekday",
        noClasses: "No classes this day",

        // Resources
        resourcesTitle: "Resources",
        resourcesSub: "Notes, links and useful materials",
        addResource: "Add resource",
        resUrlField: "Link (URL)",
        resDescField: "Note",
        noResources: "No resources yet. Add the first one.",
        openLink: "Open",

        // Goals & Habits
        goalsTitle: "Goals & Habits",
        goalsSub: "Set goals and track daily habits",
        tabGoals: "Goals",
        tabHabits: "Habits",
        addGoal: "Add goal",
        goalTitleField: "Goal title",
        targetField: "Target value",
        currentField: "Current value",
        deadlineField: "Deadline",
        addHabit: "Add habit",
        habitTitleField: "Habit title",
        streakLabel: "day streak",
        doneTodayLabel: "Done today",
        markTodayBtn: "Mark",
        noGoals: "No goals yet.",
        noHabits: "No habits yet.",

        // Focus
        focusTitle: "Focus mode",
        focusSub: "Stay focused with Pomodoro and track study time",
        statToday: "Today",
        statWeek: "Week",
        statAllTime: "Total",
        minutesUnit: "min",
        focusHint: "Time is saved automatically when a session ends",

        // AI assistant
        assistantTitle: "AI Study Assistant",
        assistantSub: "Auto-generate an exam preparation plan",
        examDateField: "Exam date",
        topicsField: "Topics (one per line)",
        dailyHoursField: "Hours per day",
        generateBtn: "Generate plan",
        dayLabel: "day",
        planEmptyHint: "Enter the exam date and topics.",

        // Board
        boardTitle: "Announcements board",
        boardSub: "Books, roommates, tutors and events",
        postAdBtn: "Post ad",
        adTitleField: "Title",
        adBodyField: "Text",
        adContactField: "Contact (phone/Telegram)",
        categoryField: "Category",
        catBook: "Book",
        catRoommate: "Roommate",
        catTutor: "Tutor",
        catEvent: "Event",
        catOther: "Other",
        noAds: "No announcements yet.",

        // Notifications
        notifTitle: "Notifications",
        notifSub: "Upcoming and overdue tasks",
        notifEmpty: "No new notifications 🎉",
        overdueLabel: "Overdue",
        dueSoonLabel: "Due soon",

        // Leaderboard
        leaderboardTitle: "Leaderboard",
        leaderboardSub: "Top students by GPA",
        rankCol: "Rank",
        studentCol: "Student",
        gpaCol: "GPA",
        creditsCol: "Credits",
        myRankLabel: "Your rank",
        noRanking: "No ranking yet. Add subjects and grades.",
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
        roomsTitle: "Комнаты",
        roomGeneral: "Общий",
        newRoom: "Новая комната",
        // AI чат
        aiChatTab: "AI чат",
        aiPlanTab: "План учёбы",
        aiChatPlaceholder: "Введите вопрос...",
        aiThinking: "Думаю...",
        aiWelcome: "Привет! Я ваш помощник по учёбе. Спросите о занятиях, GPA или планировании.",
        // Админ
        navAdmin: "Админ-панель",
        adminTitle: "Админ-панель",
        adminSub: "Управляйте пользователями и назначайте админов",
        roleOwner: "Владелец",
        roleAdmin: "Админ",
        roleStudent: "Студент",
        makeAdmin: "Назначить админом",
        removeAdmin: "Снять админа",
        colRole: "Роль",
        colUser: "Пользователь",
        chatEmpty: "Сообщений пока нет. Будьте первым!",
        chatLoading: "Загрузка...",

        // ===== Новые разделы: навигация =====
        navTimetable: "Расписание",
        navResources: "Материалы",
        navGoals: "Цели",
        navFocus: "Фокус",
        navAssistant: "AI помощник",
        navBoard: "Объявления",
        navLeaderboard: "Рейтинг",
        navNotifications: "Уведомления",
        navGrowth: "Личностный рост",
        navIelts: "Уроки IELTS",
        moreMenu: "Ещё",

        // Уроки (Growth / IELTS)
        growthSub: "Мотивация, саморазвитие и успех",
        ieltsSub: "Видеоуроки для подготовки к IELTS",
        lessonChooseLang: "На каком языке хотите учиться?",
        lessonChooseLangDesc: "Материалы будут показаны на выбранном языке.",
        lessonChangeLang: "Сменить язык",
        lessonAdd: "Добавить видео",
        lessonUrlField: "Ссылка YouTube",
        lessonEmpty: "Уроки ещё не добавлены.",
        lessonSaveError: "Ошибка сохранения. Проверьте ссылку.",

        // Общее
        save: "Сохранить",
        cancel: "Отмена",
        add: "Добавить",
        delete: "Удалить",
        open: "Открыть",
        titleField: "Заголовок",

        // Дни недели
        wdMon: "Понедельник",
        wdTue: "Вторник",
        wdWed: "Среда",
        wdThu: "Четверг",
        wdFri: "Пятница",
        wdSat: "Суббота",
        wdSun: "Воскресенье",

        // Расписание
        timetableTitle: "Расписание",
        timetableSub: "Управляйте недельным расписанием",
        addClass: "Добавить занятие",
        subjectField: "Предмет",
        roomField: "Аудитория",
        teacherField: "Преподаватель",
        startField: "Начало",
        endField: "Конец",
        weekdayField: "День недели",
        noClasses: "В этот день занятий нет",

        // Материалы
        resourcesTitle: "Материалы",
        resourcesSub: "Конспекты, ссылки и полезные ресурсы",
        addResource: "Добавить материал",
        resUrlField: "Ссылка (URL)",
        resDescField: "Заметка",
        noResources: "Пока нет материалов. Добавьте первый.",
        openLink: "Открыть",

        // Цели и привычки
        goalsTitle: "Цели и привычки",
        goalsSub: "Ставьте цели и отслеживайте привычки",
        tabGoals: "Цели",
        tabHabits: "Привычки",
        addGoal: "Добавить цель",
        goalTitleField: "Название цели",
        targetField: "Целевое значение",
        currentField: "Текущее значение",
        deadlineField: "Срок",
        addHabit: "Добавить привычку",
        habitTitleField: "Название привычки",
        streakLabel: "дней подряд",
        doneTodayLabel: "Сегодня выполнено",
        markTodayBtn: "Отметить",
        noGoals: "Пока нет целей.",
        noHabits: "Пока нет привычек.",

        // Фокус
        focusTitle: "Режим фокуса",
        focusSub: "Сосредоточьтесь с Pomodoro и считайте время учёбы",
        statToday: "Сегодня",
        statWeek: "Неделя",
        statAllTime: "Всего",
        minutesUnit: "мин",
        focusHint: "Время сохраняется автоматически по окончании сессии",

        // AI помощник
        assistantTitle: "AI помощник по учёбе",
        assistantSub: "Автоматически составьте план подготовки к экзамену",
        examDateField: "Дата экзамена",
        topicsField: "Темы (по одной в строке)",
        dailyHoursField: "Часов в день",
        generateBtn: "Составить план",
        dayLabel: "день",
        planEmptyHint: "Введите дату экзамена и темы.",

        // Объявления
        boardTitle: "Доска объявлений",
        boardSub: "Книги, соседи, репетиторы и события",
        postAdBtn: "Подать объявление",
        adTitleField: "Заголовок",
        adBodyField: "Текст",
        adContactField: "Контакт (телефон/Telegram)",
        categoryField: "Категория",
        catBook: "Книга",
        catRoommate: "Сосед",
        catTutor: "Репетитор",
        catEvent: "Событие",
        catOther: "Другое",
        noAds: "Пока нет объявлений.",

        // Уведомления
        notifTitle: "Уведомления",
        notifSub: "Предстоящие и просроченные задачи",
        notifEmpty: "Нет новых уведомлений 🎉",
        overdueLabel: "Просрочено",
        dueSoonLabel: "Скоро срок",

        // Рейтинг
        leaderboardTitle: "Рейтинг",
        leaderboardSub: "Лучшие студенты по GPA",
        rankCol: "Место",
        studentCol: "Студент",
        gpaCol: "GPA",
        creditsCol: "Кредиты",
        myRankLabel: "Ваше место",
        noRanking: "Рейтинга пока нет. Добавьте предметы и оценки.",
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