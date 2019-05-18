// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import firebase from 'firebase/app'
import 'firebase/auth'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import api from './services/api'
import Loading from 'vue-loading-overlay'
// Import stylesheet
import 'vue-loading-overlay/dist/vue-loading.css'
import * as LocalStorage from 'local-storage'
import { Subject } from 'rxjs'

Vue.use(BootstrapVue)
Vue.use(Loading)
Vue.config.productionTip = false
Vue.prototype.$firebase = firebase
Vue.prototype.$api = api

  // Initialize Firebase
const config = process.env.FIREBASE_CONFIG;
firebase.initializeApp(config);

const isOnline = process.env.IS_ONLINE;
Vue.prototype.$isOnline = isOnline;
Vue.prototype.$subject = new Subject()

Vue.prototype.$token = null;
Vue.prototype.$localStorage = LocalStorage;
Vue.prototype.$userID = ''
let app;
firebase.auth().onAuthStateChanged((user) => {
  Vue.prototype.$userID = user ? user.uid: ''
  if (!app) {
    app = new Vue({
      el: '#app',
      router,
      components: { App },
      template: '<App/>'
    })
  }
  if (user) {
    user.getIdToken(true).then((idToken) => {
      var isLoginMethod = !LocalStorage.get('headerToken')
      LocalStorage.set('headerToken', idToken)
      if (idToken && isLoginMethod) {
        Vue.prototype.$subject.next({ type: 'REDIRECT_PROBLEMS'})
      }
    })
  }
})
