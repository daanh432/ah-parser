import { createRouter, createWebHistory } from "vue-router";
import home from "../views/Home.vue";
import login from "../views/Login.vue";
import view from "../views/View.vue";

const routes = [
    {
        path: "/",
        name: "home",
        component: home
    },
    {
        path: "/login",
        name: "login",
        component: login
    },
    {
        path: "/open/:id",
        name: "view",
        component: view
    }
    // {
    //   path: '/about',
    //   name: 'About',
    //   // route level code-splitting
    //   // this generates a separate chunk (about.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
    // }
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
});

export default router;
