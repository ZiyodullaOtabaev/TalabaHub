import axios from "axios";

const BASE_URL = "http://127.0.0.1:8000";

const api = axios.create({
    baseURL: BASE_URL,
});

// Har bir so'rovga access tokenni qo'shish
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("access");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Tokenlarni tozalab, login sahifasiga qaytarish
function logout() {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    if (window.location.pathname !== "/login") {
        window.location.assign("/login");
    }
}

// Bir vaqtning o'zida faqat bitta refresh so'rovi ketishini ta'minlaymiz
// (bir nechta so'rov bir vaqtda 401 olsa, refresh faqat bir marta chaqiriladi)
let refreshPromise = null;

function refreshAccessToken() {
    const refresh = localStorage.getItem("refresh");
    if (!refresh) {
        return Promise.reject(new Error("Refresh token mavjud emas"));
    }

    if (!refreshPromise) {
        // Interceptorsiz toza axios bilan yuboramiz (cheksiz loop bo'lmasligi uchun)
        refreshPromise = axios
            .post(`${BASE_URL}/api/auth/refresh/`, { refresh })
            .then((res) => {
                const newAccess = res.data.access;
                localStorage.setItem("access", newAccess);
                return newAccess;
            })
            .finally(() => {
                refreshPromise = null;
            });
    }

    return refreshPromise;
}

// 401 bo'lsa: tokenni yangilab, asl so'rovni qayta yuboramiz
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;

        // Tarmoq xatosi yoki config bo'lmasa, oddiy reject
        if (!error.response || !original) {
            return Promise.reject(error);
        }

        // Login/refresh endpointlarining o'zida yangilashga urinmaymiz
        const isAuthEndpoint =
            original.url?.includes("/api/auth/login/") ||
            original.url?.includes("/api/auth/refresh/");

        if (error.response.status === 401 && !original._retry && !isAuthEndpoint) {
            original._retry = true;
            try {
                const newAccess = await refreshAccessToken();
                original.headers.Authorization = `Bearer ${newAccess}`;
                return api(original);
            } catch (refreshErr) {
                // Refresh ham muvaffaqiyatsiz -> logout
                logout();
                return Promise.reject(refreshErr);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
