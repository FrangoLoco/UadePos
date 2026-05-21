/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'uadeo-blue': '#1e293b', // El azul de tu Sidebar [cite: 11]
                'uadeo-green': '#10b981', // El verde de tus botones [cite: 54]
            },
        },
    },
    plugins: [],
}