import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './VFES_Talas_App.jsx'

try {
  createRoot(document.getElementById('root')).render(
    React.createElement(App)
  )
} catch(e) {
  document.getElementById('root').innerHTML = 
    '<div style="padding:20px;font-family:sans-serif">' +
    '<h2>Ошибка запуска</h2><pre style="color:red;font-size:12px">' + 
    e.message + '\n' + e.stack + '</pre></div>'
}

setTimeout(() => {
  const s = document.getElementById('spl')
  if (s) { s.classList.add('out'); setTimeout(() => s.remove(), 700) }
}, 3000)
