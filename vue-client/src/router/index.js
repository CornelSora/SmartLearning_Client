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
  debugger
  let loader = Vue.$loading.show()
  // https://firebase.google.com/docs/auth/admin/verify-id-tokens
  const currentUser = firebase.auth().currentUser

  console.warn(to.query)

  this.$inviteToken = to.query.inviteToken
  let problemId = to.query.problem

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const authOrTest = to.matched.some(record => record.meta.requiresAuthOrAnonymousTest)
  console.warn(authOrTest)
  if (authOrTest) {
    next()
    loader.hide()
    return
  }
  if (this.$inviteToken) {
    next(`/problem/${problemId}`)
    return
  }

  if (requiresAuth && !currentUser && !this.$token) next('login')
  else if (!requiresAuth && (currentUser || this.$token)) next('problems')
  else next()
  
  loader.hide()
})

export default router
