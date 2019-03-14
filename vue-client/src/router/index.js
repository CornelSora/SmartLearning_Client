import Vue from 'vue'
import Router from 'vue-router'
import firebase from 'firebase/app'
import routes from './routes'
import 'firebase/auth'

Vue.use(Router)

const router = new Router({
  routes: routes
})

router.beforeEach((to, from, next) => {
  let loader = Vue.$loading.show()

  // https://firebase.google.com/docs/auth/admin/verify-id-tokens
  const currentUser = firebase.auth().currentUser
  console.log(currentUser)

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth && !currentUser) next('login')
  else if (!requiresAuth && currentUser) next('problems')
  else next()
  loader.hide()
})

export default router
