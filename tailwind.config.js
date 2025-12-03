/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#54C5F8',
        'secondary': '#00ABBD',
        'accent': '#24BB8C',
        'text-primary': '#101828',
        'text-secondary': '#667085',
        'text-muted': '#656565',
        'background': '#F5F5F4',
        'purple': '#BC5CDE',
        'purple-dark': '#A241C5',
        'blue': '#1E07DE',
        'orange': '#FC9F38',
        'green': '#3FC89E',
        'yellow': '#DCF247',
      },
      fontSize: {
        'course-deatails-heading-small': ['26px', '36px'],
        'course-deatails-heading-large': ['36px', '44px'],
        'home-heading-small': ['28px', '34px'],
        'home-heading-large': ['48px', '56px'],
        'default': ['15px', '21px'],
      },
      gridTemplateColumns: {
        'auto' : 'repeat(auto-fit, minmax(250px, 1fr))',
      },
      spacing:{
        'section-height': '500px',
      },
      fontFamily: {
        'outfit': ['Outfit', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
        'poppins': ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
