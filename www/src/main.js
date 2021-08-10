import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import './assets/tailwind.css'
import input from './components/Input.vue';
import table from './components/Table.vue';
import axios from 'axios'

const app = createApp(App)
app.use(store);
app.use(router)
app.component('my-input', input);
app.component('my-table', table);

axios.defaults.headers.common['Authorization'] = `Bearer ${JSON.parse(localStorage.getItem('access_token') || '{}').access_token || ''}`;

app.mount('#app')
