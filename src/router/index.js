import Vue from 'vue'
import VueRouter from 'vue-router'
// import Login from './../views/Login.vue'
// import Dashboard from '../components/Dashboard'
// import Welcome from '../components/Welcome'
const Login = () => import(/* webpackChunkName: "login_dashboard_welcome" */ './../views/Login.vue')
const Dashboard = () => import(/* webpackChunkName: "login_dashboard_welcome" */ '../components/Dashboard')
const Welcome = () => import(/* webpackChunkName: "login_dashboard_welcome" */ '../components/Welcome')

// import Users from '../components/user/Users'
// import Rights from '../components/power/Rights'
// import Roles from '../components/power/Roles'
const Users = () => import(/* webpackChunkName: "users_rights_roles" */ '../components/user/Users')
const Rights = () => import(/* webpackChunkName: "users_rights_roles" */ '../components/power/Rights')
const Roles = () => import(/* webpackChunkName: "users_rights_roles" */ '../components/power/Roles')

// import Cate from '../components/goods/Cate'
// import Params from '../components/goods/Params'
const Cate = () => import(/* webpackChunkName: "cate_params" */ '../components/goods/Cate')
const Params = () => import(/* webpackChunkName: "cate_params" */ '../components/goods/Params')

// import GoodsList from '../components/goods/GoodsList'
// import Add from '../components/goods/Add'
// import Order from '../components/order/Order'
// import Report from '../components/report/Report'
const GoodsList = () => import(/* webpackChunkName: "good" */ '../components/goods/GoodsList')
const Add = () => import(/* webpackChunkName: "good" */ '../components/goods/Add')
const Order = () => import(/* webpackChunkName: "good" */ '../components/order/Order')
const Report = () => import(/* webpackChunkName: "good" */ '../components/report/Report')

Vue.use(VueRouter)

// 定义路由
const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/dashboard',
    component: Dashboard,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: GoodsList },
      { path: '/goods/add', component: Add },
      { path: '/orders', component: Order },
      { path: '/reports', component: Report }
    ]
  }
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  // 获取token
  const token = window.sessionStorage.getItem('token')
  // 未登录
  if (!token) return next('/login')
  next()
})

export default router
