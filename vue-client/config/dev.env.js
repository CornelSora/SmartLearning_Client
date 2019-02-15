'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  SOCKET_SERVER: '"http://localhost:8081"',
  API_SERVER: '"http://localhost:8083/api"',
  FIREBASE_CONFIG: `{
    apiKey: "AIzaSyD4kytLYCKlLg97MdSyV43mbDEnB03a160",
    authDomain: "nodelearning-4b086.firebaseapp.com",
    databaseURL: "https://nodelearning-4b086.firebaseio.com",
    projectId: "nodelearning-4b086",
    messagingSenderId: "674076402937"
  }`
})
