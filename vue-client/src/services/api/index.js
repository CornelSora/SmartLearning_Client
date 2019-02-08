import axios from 'axios'
import Account from './Account'
import Problem from './Problem';

class Api {
  constructor () {
    if (!this.instance) {
      this.instance = axios.create({
        baseURL: 'http://localhost:3000/api'
      })

      // this.instance.interceptors.request.use(config => {
      //   config.headers['Content-Type'] = 'application/json'
      //   const tokenStorage = new TokenStorage()
      //   const userToken = tokenStorage.getUserToken()
      //   if (userToken) {
      //     config.headers['UserToken'] = userToken
      //   }

      //   return config
      // },
      // error => Promise.reject(error))
    }
    this.account = new Account(this.instance)
    this.problem = new Problem(this.instance)
  }
}

export default new Api()
