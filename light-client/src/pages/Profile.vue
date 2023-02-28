<template>
    <div>
        <b-form inline>
            <label>Email: </label>
            <label>{{profile.email}}</label>
        </b-form>
        <b-form inline>
            <label>Username: </label>
            <label>{{profile.username}}</label>
        </b-form>
        <b-form inline>
            <label>Password: </label>
            <label><b-btn variant="outline-success" @click="forgotPassword" size="sm">reset it</b-btn></label>
        </b-form>
        <b-form inline>
            <label>Account type: </label>
            <label><b>{{profile.type}}</b></label>
            <label><b-btn variant="outline-success" @click="updateAccount" size="sm">update it</b-btn></label>
        </b-form>
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
        <Invitations
         v-if="profile.email"
         :email="profile.email"
         :fromProfile="true" />
    </div>
</template>

<script>
import Invitations from '../components/Invitations'

export default {
  data () {
    return {
      profile: {},
      info: '',
      error: ''
    }
  },
  async mounted () {
    let loader = this.$loading.show()
    try {
      let result = await this.$api.account.getProfile(this.$userID)
      if (result.ok) {
        this.profile = result.result
      } else {
        console.warn('something went wrong when I got the profile')
      }
    } catch (e) {
      console.warn(e)
    } finally {
      loader.hide()
    }
  },
  methods: {
    async forgotPassword () {
      let loader = this.$loading.show()
      try {
        await this.$firebase
        .auth()
        .sendPasswordResetEmail(this.profile.email)
        this.error = ''
        this.info = `A reset password email was sent at: ${this.profile.email}`
        this.email = ''
      } catch (e) {
        this.error = e.message
        this.info = ''
      } finally {
        loader.hide()
      }
    },
    async updateAccount () {
      this.$router.push('UpdateAccount')
    }
  },
  components: {
    Invitations
  }
}
</script>

<style>

</style>
