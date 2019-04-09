<template>
  <div>
    <b-form-input
      v-model="email"
      placeholder="Enter the email">
    </b-form-input>
    <span>Or go back to <router-link to="/">login</router-link>.</span>
    <b-alert
      :show="error != ''"
      variant="danger">
    {{ error }}
    </b-alert>
    <b-alert
      :show="info != ''"
      variant="info">
    {{ info }}
    </b-alert>
    <b-btn
      variant="outline-success"
      @click="forgotPassword">Send email</b-btn>
  </div>
</template>

<script>
export default {
  data () {
    return {
      email: '',
      error: '',
      info: ''
    }
  },
  methods: {
    async forgotPassword () {
      let loader = this.$loading.show()
      try {
        await this.$firebase
        .auth()
        .sendPasswordResetEmail(this.email)
        this.error = ''
        this.info = `A reset password email was sent at: ${this.email}`
        this.email = ''
      } catch (e) {
        this.error = e.message
        this.info = ''
      } finally {
        loader.hide()
      }
    }
  }
}
</script>

<style>

</style>
