import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

import App from './App.vue'
import router from './router'
import { createVuetify } from 'vuetify';
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css'

const app = createApp(App)


const vuetify = createVuetify({
    theme: {
        defaultTheme: 'light',
        themes: {
            dark: {
                colors: {
                    // "primary": colors.blue.darken3,
                    // "secondary": colors.cyan.accent1,
                    // "surface": colors.lightBlue.darken4
                }
            }
        }
    },
    icons: {
        defaultSet: 'mdi'
    },
    components,
    directives
});


app.use(vuetify);

app.use(createPinia())
app.use(router)

app.mount('#app')
