/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // 👈 บรรทัดนี้คือตัวบอกให้ Tailwind เข้าไปอ่านไฟล์ในโฟลเดอร์ src
  ],
  theme: {
    extend: {
      colors: {
        industry: {
          dark: "#0f172a",
          primary: "#2563eb",
          success: "#10b981",
          danger: "#ef4444",
          warning: "#f59e0b",
          bg: "#f8fafc",
        },
      },
    },
  },
  plugins: [],
};