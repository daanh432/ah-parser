import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import './assets/tailwind.css'
import input from './components/Input.vue';
import table from './components/Table.vue';

const app = createApp(App)
app.use(store);
app.use(router)
app.component('my-input', input);
app.component('my-table', table);

app.mount('#app')
