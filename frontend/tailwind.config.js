export default {

    darkMode: "class",

    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}",
    ],

    theme: {

        extend: {

            fontFamily: {
                sans: ["Plus Jakarta Sans", "Inter", "sans-serif"]
            },

            colors: {
                primary: {
                    50: "#eef2ff",
                    100: "#e0e7ff",
                    200: "#c7d2fe",
                    300: "#a5b4fc",
                    400: "#818cf8",
                    500: "#6366f1",
                    600: "#4f46e5",
                    700: "#4338ca",
                    800: "#3730a3",
                    900: "#312e81",
                },
                accent: {
                    50: "#ecfdf5",
                    100: "#d1fae5",
                    200: "#a7f3d0",
                    300: "#6ee7b7",
                    400: "#34d399",
                    500: "#10b981",
                    600: "#059669",
                },
                surface: {
                    light: "#ffffff",
                    dark: "#1e1b4b",
                }
            },

            boxShadow: {
                card: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                glow: "0 0 20px -5px rgba(99, 102, 241, 0.3)",
                "glow-lg": "0 0 40px -10px rgba(99, 102, 241, 0.4)",
                "dark-card": "0 4px 20px -4px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(99, 102, 241, 0.1)",
            },

            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "mesh-light": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                "mesh-dark": "linear-gradient(135deg, #1e1b4b 0%, #0f172a 50%, #1e1b4b 100%)",
            },

            animation: {
                "float": "float 6s ease-in-out infinite",
                "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                "gradient": "gradient 8s ease infinite",
            },

            keyframes: {
                float: {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-10px)" },
                },
                gradient: {
                    "0%, 100%": { backgroundPosition: "0% 50%" },
                    "50%": { backgroundPosition: "100% 50%" },
                },
            }

        }

    },

    plugins: []

}
