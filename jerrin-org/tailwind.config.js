/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                mc: ["MCFont", "system-ui", "sans-serif"],
            },
            keyframes: {
                panorama: {
                    "0%": { backgroundPosition: "0 0" },
                    "100%": { backgroundPosition: "-925925vw 0" },
                },
                splashZoom: {
                    "0%": { fontSize: "var(--text-width)" },
                    "50%": { fontSize: "calc(var(--text-width) + 0.1vw)" },
                    "100%": { fontSize: "var(--text-width)" },
                },
            },
            animation: {
                panorama: "panorama 400000s linear infinite",
                splashZoom: "splashZoom 0.5s infinite",
            },
        },
    },
    plugins: [],
};
