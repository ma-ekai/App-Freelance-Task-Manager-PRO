/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                mint: {
                    50: '#F0FDF4',
                    100: '#DCFCE7',
                    200: '#BBF7D0',
                    300: '#86EFAC',
                    400: '#4ADE80',
                    DEFAULT: '#A7F3D0', // Primary Mint Green
                    600: '#059669',
                    700: '#047857',
                },
                anthracite: {
                    DEFAULT: '#1F2937', // Text Gray
                    light: '#374151',
                    dark: '#111827',
                },
            },
            fontFamily: {
                sans: ['Inter', 'Montserrat', 'ui-sans-serif', 'system-ui'],
                heading: ['Poppins', 'Montserrat', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
