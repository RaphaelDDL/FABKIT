import {createApp} from 'vue'
import './style.css'
import {createRouter, createWebHashHistory} from "vue-router";
import Home from "./components/Home.vue";
import App from "./App.vue";
import MyCards from "./components/MyCards.vue";
import Settings from "./components/Settings.vue";
import VueKonva from 'vue-konva';

const routes = [
    {path: '/', name:'home', component: Home},
    {path: '/my-cards', name: 'my-cards', component: MyCards},
    {path: '/settings', name: 'settings', component: Settings},
]

const router = createRouter({
    // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
    history: createWebHashHistory(),
    routes, // short for `routes: routes`
})

const app = createApp(App)

app.use(router)
app.use(VueKonva);
app.mount('#app')
