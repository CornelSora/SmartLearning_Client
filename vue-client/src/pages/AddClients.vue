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
          <template slot="problem" slot-scope="row">
            <div>
              <b-form-select v-model="selected[row.index]" :options="problems"></b-form-select>
            </div>
          </template>
        </b-table>
      </b-container>
      <b-alert
        :show="successEmail"
        variant="success">
      {{ successMessage }}
      </b-alert>
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
        { key: 'problem', label: 'Problem', sortable: false },
        { key: 'actions' }
      ],
      successEmail: false,
      successMessage: 'Email sent successfully',
      problems: [],
      selected: []
    }
  },
  async mounted () {
    await this.getProblems()
    await this.getClients()
  },
  methods: {
    async addClient () {
      let loader = this.$loading.show()
      try {
        if(!this.email) return
        await this.$api.account.saveClient(this.$userID, this.email)
        this.emails.push({
          email: this.email.toString()
        })
        this.selected.push(this.problems[0].value)
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
          for (var i = 0; i < this.emails.length; i++) {
            this.selected.push(this.problems[0].value)            
          }
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
    async getProblems () {
      let loader = this.$loading.show()
      try {
        const result = await this.$api.problem.getAllProblems()
        if (result.ok) {
          var tempProblems = result.result.problems
          for (var i = 0; i < tempProblems.length; i++) {
            var option = {
              value: tempProblems[i].UID,
              text: tempProblems[i].name
            }
            this.problems.push(option)
            this.selected.push(this.problems[0].value)
          }
          console.log(this.problems)          
        } else {
          console.warn('something went wrong when I got the problems')
        }
      } catch (e) {
        console.warn(e)
      } finally {
        loader.hide()
      }
    },
    async send_email (item, index, target) {
      this.successEmail = false
      let loader = this.$loading.show()
      try {
        await this.$api.account.sendEmail(item.email, this.$userID, this.selected[index])
        this.successEmail = true
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
