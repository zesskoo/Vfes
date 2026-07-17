import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './VFES_Talas_App.jsx'

createRoot(document.getElementById('root')).render(React.createElement(App))

const obs = new MutationObserver((m, ob) => {
  if (document.getElementById('root').childElementCount > 0) {
    setTimeout(() => {
      const s = document.getElementById('spl')
      if (s) { s.classList.add('out'); setTimeout(() => s.remove(), 700) }
    }, 300)
    ob.disconnect()
  }
})
obs.observe(document.getElementById('root'), { childList: true })
