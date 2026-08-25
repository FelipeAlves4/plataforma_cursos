import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            colors: { ink: '#17201c', cream: '#f7f5ef', sand: '#eee9db', brand: { 100: '#eef3bf', 300: '#deea72', 400: '#d3df49', 500: '#c3d537', 700: '#66730f' } },
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
        },
    },

    plugins: [forms],
};
