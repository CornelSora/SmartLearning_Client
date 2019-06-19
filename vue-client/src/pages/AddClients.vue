<template>
    <div>
      <b-container fluid class="problem-container">
        <div style="display: block; padding: 10px; margin-bottom: 10px;">
          <b-input
            type="email"
            v-model="email"
            v-on:keyup.enter="addClient"
            style="width: 40%; float: left; margin-right: 10px; margin-left: 10%; margin-bottom: 10px;"
          />
          <b-btn @click="addClient" style="width: 10%; float: left;">Add</b-btn>
        </div>
        <b-table show-empty
          stacked="md"
          bordered="bordered"
          hover
          :items="emails"
          :fields="fields"
        >
          <template slot="actions" slot-scope="row">
            <b-button size="sm" @click.stop="send_email(row.item, row.index, $event.target)" class="mr-1" variant="primary">
              Send
            </b-button>
          </template>
          <template slot="row-details" slot-scope="row">
            <b-card>
              <ul>
                <li v-for="(value, key) in row.item" :key="key">{{ key }}: {{ value}}</li>
              </ul>
            </b-card>
          </template>
        </b-table>
      </b-container>
    </div>
</template>

<script>
export default {
  data () {
    return {
      email: "",
      emails: [],
      fields: [
        { key: 'email', label: 'Email', sortable: true },
        { key: 'actions' }
      ],
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
    },
    send_email (item, index, target) {
      this.$api.account.sendEmail(item.email, this.$userID)
    }
  }
}
</script>

<style>

</style>
