import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from './../views/Login.vue'
import Dashboard from '../components/Dashboard'
import Welcome from '../components/Welcome'
import Users from '../components/user/Users'

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
      { path: '/users', component: Users }
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
