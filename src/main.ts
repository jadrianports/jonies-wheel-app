import { createApp } from 'vue'
import { Quasar } from 'quasar'
import Toast from 'vue-toastification'
import './style.css'
import App from './App.vue'

// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/fontawesome-v6/fontawesome-v6.css'

// Import Quasar css
import 'quasar/src/css/index.sass'
// Import Toast css
import 'vue-toastification/dist/index.css'

// Toast options
const toastOptions = {
    position: "bottom-left",
    timeout: 2000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: false,
    closeButton: "button",
    icon: true,
    rtl: false
}

const app = createApp(App)
app.use(Quasar, {
  plugins: {},
})
app.use(Toast, toastOptions)
app.mount('#app').$nextTick(() => {
  // Use contextBridge
  window.ipcRenderer.on('main-process-message', (_event, message) => {
    console.log(message)
  })
})
