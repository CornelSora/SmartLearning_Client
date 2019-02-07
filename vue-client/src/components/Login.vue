<template>
  <b-container class="test">
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
      password: ''
    }
  },
  methods: {
    async login () {
      try {
        console.warn(this.email, this.password)
        let user = await this.$firebase
          .auth()
          .signInWithEmailAndPassword(this.email, this.password)
        this.$router.replace('hello')
      } catch (e) {
        console.warn(e)
      }
    }
  }
}
</script>

<style>

</style>
