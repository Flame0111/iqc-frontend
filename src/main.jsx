import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// นำเข้าไฟล์ CSS หลักที่เราเขียน (สำคัญมาก! ถ้าลืมบรรทัดนี้ สไตล์และระบบปริ้นท์จะไม่ทำงาน)
import './index.css' 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)