<template>
  <b-container class="login-container">
    <h3>Sign in</h3>
    <b-form-input
      type="text"
      placeholder="Email"
      v-model="email"
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
        this.$router.replace('hello')
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
}
</style>
