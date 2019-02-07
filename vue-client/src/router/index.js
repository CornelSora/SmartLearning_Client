import Vue from 'vue'
import Router from 'vue-router'
import firebase from 'firebase/app'
import 'firebase/auth'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '*',
      redirect: '/'
    },
    {
      path: '/Hello',
      name: 'HelloWorld',
      component: () => import("@/components/HelloWorld"),
      meta: { requiresAuth: true }
    },
    {
      path: '/',
      name: 'Login',
      component: () => import("@/components/Login")
    },
    {
      path: '/register',
      name: 'SignUp',
      component: () => import("@/components/SignUp")
    }
  ]
})

router.beforeEach((to, from, next) => {
  // https://firebase.google.com/docs/auth/admin/verify-id-tokens
  const currentUser = firebase.auth().currentUser
  console.warn(currentUser)
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth && !currentUser) next('login')
  else if (!requiresAuth && currentUser) next('hello')
  else next()
})

export default router
