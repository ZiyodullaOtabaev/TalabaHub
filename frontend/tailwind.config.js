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
                primary: "#4f46e5"
            },

            boxShadow: {
                card: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
            }

        }

    },

    plugins: []

}