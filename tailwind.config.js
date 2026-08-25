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
            colors: {
                ink: '#19052f',
                cream: '#faf9fc',
                sand: '#f2ecf8',
                brand: {
                    100: '#eee4fb',
                    300: '#cba8ef',
                    400: '#9347dd',
                    500: '#8138c5',
                    700: '#6429aa',
                    900: '#2b0870',
                },
                asex: {
                    purple: {
                        950: '#19052f',
                        900: '#2b0870',
                        700: '#6429aa',
                        600: '#8138c5',
                        500: '#9347dd',
                    },
                    background: '#faf9fc',
                    surface: '#ffffff',
                    border: '#e4d8ef',
                    text: '#19052f',
                    muted: '#665a73',
                    success: '#237a56',
                },
                indigo: {
                    50: '#faf6ff',
                    100: '#f1e7fb',
                    200: '#dec9f2',
                    400: '#a967db',
                    500: '#9347dd',
                    600: '#8138c5',
                    700: '#6429aa',
                    800: '#4b1b8c',
                    900: '#2b0870',
                },
            },
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
        },
    },

    plugins: [forms],
};
