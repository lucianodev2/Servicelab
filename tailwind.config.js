/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cores da logo ServiceLab
        primary: {
          50: '#e3f2fd',
          100: '#bbdefb',
          200: '#90caf9',
          300: '#64b5f6',
          400: '#42a5f5',
          500: '#1e88e5', // Azul da logo
          600: '#1976d2',
          700: '#1565c0',
          800: '#0d47a1',
          900: '#0a3d91',
        },
        secondary: {
          50: '#f3e5f5',
          100: '#e1bee7',
          200: '#ce93d8',
          300: '#ba68c8',
          400: '#ab47bc',
          500: '#7b1fa2', // Roxo da logo
          600: '#6a1b9a',
          700: '#4a148c',
          800: '#38006b',
          900: '#28004d',
        },
        success: {
          50: '#e8f5e9',
          100: '#c8e6c9',
          200: '#a5d6a7',
          300: '#81c784',
          400: '#66bb6a',
          500: '#4caf50', // Verde da logo
          600: '#43a047',
          700: '#388e3c',
          800: '#2e7d32',
          900: '#1b5e20',
        },
        // Status das máquinas
        status: {
          maintenance: '#1e88e5',    // Em manutenção - Azul
          waiting: '#f59e0b',         // Aguardando peça - Amarelo
          testing: '#8b5cf6',         // Em teste - Roxo
          ready: '#4caf50',           // Pronta para entrega - Verde
          completed: '#10b981',       // Finalizada - Verde escuro
        },
        priority: {
          low: '#6b7280',
          medium: '#f59e0b',
          high: '#ef4444',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #1e88e5 0%, #7b1fa2 100%)',
        'gradient-hover': 'linear-gradient(135deg, #1976d2 0%, #6a1b9a 100%)',
      },
    },
  },
  plugins: [],
}
