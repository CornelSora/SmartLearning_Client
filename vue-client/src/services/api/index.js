import axios from 'axios'
import Account from './Account'
import Problem from './Problem'
import Paypal from './Paypal'
import LocalStorage from 'local-storage'

class Api {
  constructor () {
    if (!this.instance) {
      this.instance = axios.create({
        baseURL: process.env.API_SERVER
      })

    this.instance.interceptors.request.use(config => {
      config.headers['Content-Type'] = 'application/json'
      const userToken = LocalStorage.get('headerToken')
      if (userToken) {
        config.headers['Authorization'] = `Bearer ${userToken}`
      }
      return config
      },
      error => Promise.reject(error))
    }
    this.account = new Account(this.instance)
    this.problem = new Problem(this.instance)
    this.paypal = new Paypal(this.instance)
  }
}

export default new Api()
