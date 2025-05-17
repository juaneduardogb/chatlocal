const { heroui } = require('@heroui/theme');
/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',
        './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
        './node_modules/@heroui/theme/dist/components/(button|checkbox|ripple|spinner|form).js'
    ],
    theme: {
        screens: {
            xs: {
                max: '639px'
            },
            sm: '640px',
            md: '768px',
            lg: '1024px',
            xl: '1280px',
            '2xl': '1536px',
            screens: {
                min: '1500px'
            },
            computeScreen: {
                max: '1499px'
            }
        },
        extend: {
            boxShadow: {
                'custom-light': '4px 4px 10px rgba(0, 0, 0, 0.1)',
                'custom-dark': '6px 6px 15px rgba(0, 0, 0, 0.3)'
                // Añade más sombras personalizadas si es necesario
            }
        }
    },
    plugins: [
        require('tailwindcss-animate'),
        heroui({
            prefix: 'app-ia',
            addCommonColors: false,
            layout: {
                disabledOpacity: '0.3', // opacity-[0.3]
                radius: {
                    small: '2px', // rounded-small
                    medium: '4px', // rounded-medium
                    large: '6px' // rounded-large
                },
                borderWidth: {
                    small: '1px', // border-small
                    medium: '1px', // border-medium
                    large: '2px' // border-large
                }
            },
            themes: {
                light: {
                    layout: {
                        fontSize: {
                            tiny: '0.75rem', // text-tiny
                            small: '0.875rem', // text-small
                            medium: '1rem', // text-medium
                            large: '1.125rem' // text-large
                        },
                        radius: {
                            small: '8px', // rounded-small
                            medium: '12px', // rounded-medium
                            large: '14px' // rounded-large
                        },
                        borderWidth: {
                            small: '1px', // border-small
                            medium: '2px', // border-medium (default)
                            large: '3px' // border-large
                        }
                    },
                    colors: {
                        warning: '#ffd175',
                        background: '#FFFFFF',
                        foreground: '#11181C',
                        primary: {
                            foreground: '#FFFFFF',
                            DEFAULT: '#d93954'
                        },
                        secondary: {
                            foreground: '#FFFFFF',
                            DEFAULT: '#E27588'
                        },
                        container_menu: '#F9F9FA',
                        menu_item_selected: '#F8DDE1',
                        user_message: '#F1F1F1F1',
                        container_prompt_area: '#f4f4f5',
                        border_prompt_area: '#000000',
                        bg_stop_button_prompt: '#000000',
                        text_globe: '#000000',
                        bg_assistant_message: '#FFFFFF',
                        bg_assistant_disclaimer: '#f4f5f5',
                        bg_popover: '#FFFFFF',
                        ai_response_link_color: '#4DACF1'
                    }
                },
                dark: {
                    colors: {
                        warning: '#ffd175',
                        background: '#292932',
                        foreground: '#FFFFFF',
                        primary: {
                            foreground: '#FFFFFF',
                            DEFAULT: '#d93954'
                        },
                        secondary: {
                            foreground: '#FFFFFF',
                            DEFAULT: '#E27588'
                        },
                        container_menu: '#31313a',
                        menu_item_selected: '#F8DDE1',
                        user_message: '#F1F1F1F1',
                        container_prompt_area: '#31313a',
                        border_prompt_area: '#000000',
                        bg_stop_button_prompt: '#000000',
                        text_globe: '#FFFFFF',
                        bg_assistant_message: '#31313a',
                        bg_assistant_disclaimer: '#292932',
                        bg_popover: '#454552',
                        ai_response_link_color: '#B3DCF9',
                        border: '#d93954'
                    },
                    layout: {
                        fontSize: {
                            tiny: '0.75rem', // text-tiny
                            small: '0.875rem', // text-small
                            medium: '1rem', // text-medium
                            large: '1.125rem' // text-large
                        },
                        radius: {
                            small: '8px', // rounded-small
                            medium: '12px', // rounded-medium
                            large: '14px' // rounded-large
                        },
                        borderWidth: {
                            small: '1px', // border-small
                            medium: '1px', // border-medium
                            large: '2px' // border-large
                        }
                    }
                }
            }
        })
    ]
};
