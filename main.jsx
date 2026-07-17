import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './VFES_Talas_App.jsx'

const root = createRoot(document.getElementById('root'))
root.render(React.createElement(App))

setTimeout(() => {
  const s = document.getElementById('spl')
  if (s) { s.classList.add('out'); setTimeout(() => s.remove(), 700) }
}, 3000)
