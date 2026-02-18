import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

// Custom Styles
import './styles/main.css'

const pinia = createPinia()

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#0056a6',
          secondary: '#64748B',
          accent: '#1E88E5',
          error: '#EF4444',
          info: '#1E88E5',
          success: '#10B981',
          warning: '#F59E0B',
          surface: '#F8FAFC',
          background: '#F1F5F9',
        },
      },
    },
  },
})

const app = createApp(App)
app.use(pinia)
app.use(router)
app.use(vuetify)
app.mount('#app')