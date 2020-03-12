import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login'
import Home from "../components/Home";
import Welcome from "../components/Welcome";
import Users from "../components/user/Users";
import Right from "../components/power/Right";
import Roles from "../components/power/Roles";
import Cate from "../components/goods/Cate";
import Params from "../components/goods/Params";
import GoodList from "../components/goods/List";
import Add from "../components/goods/Add";

Vue.use(VueRouter)


const routes = [
    {path: '/', redirect: '/login/'},
    {path: '/login', component: Login},
    {
        // home定义子路由，自动跳转到子路由
        // home的component中要有路由的占位符
        path: '/home',
        component: Home,
        redirect: '/welcome',
        children: [
            // children中路由跳转的页面，全部是嵌套在Home组件中，因为Home组件
            // 中有<router-view>标签来做占位符，所以这里的所有子路由的渲染，
            // 都会替换这个<router-view>。
            {path: '/welcome', component: Welcome},
            {path: '/users', component: Users},
            {path: '/rights', component: Right},
            {path: '/roles', component: Roles},
            {path: '/categories', component: Cate},
            {path: '/params', component: Params},
            {path: '/goods', component: GoodList},
            {path: '/goods/add', component: Add},
        ]
    },
]

const router = new VueRouter({
    routes
})

// 在将路由export出去之前，先挂载一个路由导航守卫
// 路由导航守卫的功能是，判断用户是否有token，如果没有，强制跳转到登录页面。
// TODO: 后端如何、何时做token的真伪验证？
router.beforeEach((to, from, next) => {
// to: 将要访问的路径
// from: 从哪个路径跳转而来
// next: 函数，表示放行
//       next()放行       next('/login')强制跳转到登录页
    if (to.path === '/login') return next();
//  获取token
    const tokenStr = window.sessionStorage.getItem('token');
    if (!tokenStr) return next('/login');
    next();
});

export default router
