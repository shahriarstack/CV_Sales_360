
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: { sans: ['Inter', 'sans-serif'] },
                    colors: {
                        aci: {
                            blue: '#0F2942',
                            gold: '#F4A915',
                            dark: '#0a0f1c',
                            light: '#f8fafc'
                        },
                        foton: {
                            DEFAULT: '#041A54',
                            light: '#eaf0f8'
                        },
                        mahindra: {
                            DEFAULT: '#E5223E',
                            light: '#fde9ec'
                        }
                    },
                    animation: {
                        'ring-shake': 'ringShake 1.5s cubic-bezier(.36,.07,.19,.97) infinite',
                    },
                    keyframes: {
                        ringShake: {
                            '0%, 100%': { transform: 'rotate(0deg)' },
                            '10%': { transform: 'rotate(20deg)' },
                            '20%': { transform: 'rotate(-15deg)' },
                            '30%': { transform: 'rotate(10deg)' },
                            '40%': { transform: 'rotate(-10deg)' },
                            '50%, 100%': { transform: 'rotate(0deg)' }
                        }
                    }
                }
            }
        }
    