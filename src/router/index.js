import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import Login from "../components/auth/Login.vue";
import Register from "../components/auth/Register.vue";
Vue.use(VueRouter);

const routes = [
    {
        path: "/",
        name: "Home",
        component: Home,
    },
    {
        path: "/browse/:type/:category",
        component: () =>
            import(/* webpackChunkName: "about" */ "../views/Browse.vue"),
    },
    {
        path: "/login",
        name: "Login",
        component: Login,
    },
    {
        path: "/register",
        name: "Register",
        component: Register,
    },
    {
        path: "/browse/:type",
        name: "Browse",
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
            import(/* webpackChunkName: "about" */ "../views/Browse.vue"),
    },
    {
        path: "/cart",
        name: "Cart",
        component: () => import("../views/Cart.vue"),
    },
    // {
    //     path: "/profile",
    //     name: "Profile",
    //     component: () => import("../views/Profile.vue"),
    // },
    {
        path: "/purchases",
        name: "Purchase",
        component: () => import("../views/Purchase.vue"),
    },
    {
        path: "/success",
        name: "Success",
        component: () => import("../views/checkout/Success.vue"),
    },
    {
        path: "/cancel",
        name: "cancel",
        component: () => import("../views/checkout/CancelOrder.vue"),
    },
];

const router = new VueRouter({
    mode: "history",
    base: process.env.BASE_URL,
    routes,
});

export default router;
