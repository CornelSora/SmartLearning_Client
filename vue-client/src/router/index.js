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

  this.$token = to.query.token

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth && !currentUser && !this.$token) next('login')
  else if (!requiresAuth && (currentUser || this.$token)) next('problems')
  else next()
  loader.hide()
})

export default router
