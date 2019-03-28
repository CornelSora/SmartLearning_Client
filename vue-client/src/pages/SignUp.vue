<template>
  <b-container class="register-container">
    <p>Let's create a new account!</p>
    <b-form-input
      type="text"
      placeholder="Email"
      v-model="user.email"
    /><br/>
    <b-form-input
      type="text"
      placeholder="Username"
      v-model="user.username"
    /><br/>
    <b-form-input
      type="password"
      placeholder="Password"
      v-model="user.password"
    /><br/>
    <b-alert
      :show="error.show"
      variant="danger">
    {{ error.text }}
    </b-alert>
    <b-btn
      variant="outline-success"
      @click="signUp"
    >Sign Up</b-btn>
    <span>Or go back to <router-link to="/">login</router-link>.</span>
  </b-container>
</template>

<script>
  export default {
    name: 'signUp',
    data() {
      return {
        user: {
          email: '',
          username: '',
          password: '',
          type: 'student'
        },
        error: {
          text: '',
          show: false
        }
      }
    },
    methods: {
      async signUp() {
        this.error.show = false
        if (!this.isValid(this.user)) return
        let loader = this.$loading.show()
        try {
          const result = await this.$api.account.register(this.user)
          if (result.ok) {
            var resultedUser = result.result
            await this.$firebase
              .auth()
              .signInWithEmailAndPassword(this.user.email,this.user.password)
            this.$router.replace('hello')
          } else {
            this.error.text = result.message
            this.error.show = true
          }
        } catch (e) {
          this.error.text = "Something went wrong"
          this.error.show = true
        } finally {
          loader.hide()          
        }
      },
      isValid(user) {
        if (!user.email || !user.password) {
          this.error.text = "You must enter email and password"
          this.error.show = true
          return false
        }
        if (user.password.length < 6) {
          this.error.text = "The password must be at least 6 characters length"
          this.error.show = true
        }
        return true;
      }
    }
  }
</script>

<style>
.register-container {
  text-align: center;
}
</style>
