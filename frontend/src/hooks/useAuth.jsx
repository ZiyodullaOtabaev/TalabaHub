import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("access"));
    const [loading, setLoading] = useState(true);

    const fetchUser = useCallback(async () => {
        const token = localStorage.getItem("access");
        if (!token) {
            setUser(null);
            setIsLoggedIn(false);
            setLoading(false);
            return;
        }
        try {
            const res = await api.get("/api/users/me/");
            setUser(res.data);
            setIsLoggedIn(true);
        } catch {
            setUser(null);
            setIsLoggedIn(false);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    // Login muvaffaqiyatli bo'lgandan keyin chaqiriladi
    const onLogin = useCallback(() => {
        setIsLoggedIn(true);
        fetchUser();
    }, [fetchUser]);

    // Logout bo'lganda chaqiriladi
    const onLogout = useCallback(() => {
        setUser(null);
        setIsLoggedIn(false);
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoggedIn, loading, onLogin, onLogout, fetchUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
