<template>
  <b-container>
    <p>Let's create a new account!</p>
    <b-form-input type="text" placeholder="Email" v-model="user.email" /><br/>
    <b-form-input type="text" placeholder="Username" v-model="user.username" /><br/>
    <b-form-input type="password" placeholder="Password" v-model="user.password" /><br/>
    <b-btn variant="outline-success" @click="signUp">Sign Up</b-btn>
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
        }
      }
    },
    methods: {
      async signUp() {
        try {
          // const user = await this.$firebase.auth().createUserWithEmailAndPassword(this.email, this.password)
          const result = await this.$api.account.register(this.user)
          if (result.ok) {
            //  this.$tokenStorage.setUserToken(result.result)

            //  this.$router.go()
            var resultedUser = result.result
            await this.$firebase
              .auth()
              .signInWithEmailAndPassword(this.user.email,this.user.password)
            this.$router.replace('hello')
            console.log()
          } else {
            console.warn(result.message)
          }
        } catch (e) {
          console.warn(e)
        }
      }
    }
  }
</script>

<style>

</style>
