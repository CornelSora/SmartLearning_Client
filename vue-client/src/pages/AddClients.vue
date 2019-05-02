<template>
    <div>
        <b-input
            type="email"
            v-model="email"
            v-on:keyup.enter="addClient"
        />
        <b-btn @click="addClient">Add</b-btn>
        <b-table show-empty
              stacked="md"
              bordered="bordered"
              hover
              :items="emails"
      >
        <template slot="row-details" slot-scope="row">
          <b-card>
            <ul>
              <li v-for="(value, key) in row.item" :key="key">{{ key }}: {{ value}}</li>
            </ul>
          </b-card>
        </template>
      </b-table>
    </div>
</template>

<script>
export default {
  data () {
    return {
      email: "",
      emails: []
    }
  },
  async mounted () {
    await this.getClients()
  },
  methods: {
    async addClient () {
      let loader = this.$loading.show()
      try {
        if(!this.email) return
        await this.$api.account.saveClient(this.$userID, this.email)
        this.emails.push({ email: this.email.toString() })
        this.email = ""
      } catch (e) {
        console.warn(e)
      } finally {
        loader.hide()
      }
    },
    async getClients () {
      let loader = this.$loading.show()
      try {
        const result = await this.$api.account.getClients(this.$userID)
        if (result.ok) {
          this.emails = result.result
          console.log(this.emails)
        } else {
          console.warn('something went wrong when I got the problems')
        }
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
