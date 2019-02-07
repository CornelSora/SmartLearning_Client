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

Vue.use(BootstrapVue)
Vue.use(Loading)
Vue.config.productionTip = false
Vue.prototype.$firebase = firebase
Vue.prototype.$api = api

  // Initialize Firebase
 const config = {
  apiKey: "AIzaSyD4kytLYCKlLg97MdSyV43mbDEnB03a160",
  authDomain: "nodelearning-4b086.firebaseapp.com",
  databaseURL: "https://nodelearning-4b086.firebaseio.com",
  projectId: "nodelearning-4b086",
  messagingSenderId: "674076402937"
};
firebase.initializeApp(config);

let app;
firebase.auth().onAuthStateChanged((user) => {
  if (!app) {
    app = new Vue({
      el: '#app',
      router,
      components: { App },
      template: '<App/>'
    })
  }
})
