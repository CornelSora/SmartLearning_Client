<template>
    <div>
        <b-form>
            <b-form-input
                type="email"
                v-model="email"
            />
            <b-btn @click="AddClient">Add</b-btn>
        </b-form>
    </div>
</template>

<script>
export default {
  data () {
    return {
      email: ""
    }
  },
  methods: {
    async AddClient () {
      let loader = this.$loading.show()
      try {
        await this.$api.account.saveClient(this.$userID, this.email)
      } catch (e) {
        console.warn(e)
      } finally {
        loader.hide()
      }
    }
  }
}
</script>

<style>

</style>
