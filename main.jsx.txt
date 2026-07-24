import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './VFES_Talas_App.jsx'

window.onerror = function(msg, src, line, col, err) {
  document.getElementById('root').innerHTML = 
    '<div style="padding:16px;font-family:sans-serif;background:#fff;min-height:100vh">' +
    '<h3 style="color:red">JS Error:</h3>' +
    '<pre style="font-size:11px;color:red;white-space:pre-wrap">' + msg + '\nLine: ' + line + '\n' + (err ? err.stack : '') + '</pre>' +
    '</div>';
};

window.onunhandledrejection = function(e) {
  document.getElementById('root').innerHTML = 
    '<div style="padding:16px;font-family:sans-serif;background:#fff">' +
    '<h3 style="color:orange">Promise Error:</h3>' +
    '<pre style="font-size:11px;color:orange;white-space:pre-wrap">' + e.reason + '</pre>' +
    '</div>';
};

createRoot(document.getElementById('root')).render(React.createElement(App))

setTimeout(() => {
  const s = document.getElementById('spl')
  if (s) { s.classList.add('out'); setTimeout(() => s.remove(), 700) }
}, 3000)
