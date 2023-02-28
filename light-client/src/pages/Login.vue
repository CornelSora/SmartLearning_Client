<template>
  <b-container class="login-container">
    <h3 style="margin-bottom: 20px">Sign in</h3>
    <b-form-input
      type="text"
      placeholder="Email"
      v-model="email"
      class="login-form"
    /><br/>
    <b-form-input
      type="password"
      placeholder="Password"
      v-model="password"
    /><br/>
    <b-alert
      :show="error != ''"
      variant="danger">
    {{ error }}
    </b-alert>
    <b-btn
      variant="outline-success"
      @click="login">Connection</b-btn>
    <p>You don't have an account ? You can <router-link to="/register">create one</router-link></p>
    <p>Did you forgot your password ? You can <router-link to="/forgot-password">reset it</router-link></p>
  </b-container>
</template>

<script>
export default {
  name: 'login',
  data () {
    return {
      email: '',
      password: '',
      error: ''
    }
  },
  methods: {
    async login () {
      this.error = ''
      let loader = this.$loading.show()
      try {
        let user = await this.$firebase
          .auth()
          .signInWithEmailAndPassword(this.email, this.password)
        //  this.$subject.next('LOGIN')
      } catch (e) {
        this.error = e.message
      } finally {
        loader.hide()
      }
    }
  }
}
</script>

<style>
.login-container {
  text-align: center;
  margin-top: 10%;
}
.login-form {
  width: 100%;
  border: 1px solid #dadadb;
  display: block;
}
</style>
