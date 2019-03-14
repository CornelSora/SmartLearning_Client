<template>
  <div>
    <b-btn @click="logout" class="btnLogout" variant="primary">Logout</b-btn>
    <center>
      <h2>List of problems</h2>
    </center>
    <b-container fluid class="problem-container">
      <!-- User Interface controls -->
      <b-row>
        <b-col md="6" class="my-1">
          <b-form-group horizontal label="Filter" class="mb-0">
            <b-input-group>
              <b-form-input v-model="filter" placeholder="Type to Search" />
              <b-input-group-append>
                <b-btn :disabled="!filter" @click="filter = ''" variant="primary">Clear</b-btn>
              </b-input-group-append>
            </b-input-group>
          </b-form-group>
        </b-col>
        <b-col md="6" class="my-1">
          <b-form-group horizontal label="Sort" class="mb-0">
            <b-input-group>
              <b-form-select v-model="sortBy" :options="sortOptions">
                <option slot="first" :value="null">-- none --</option>
              </b-form-select>
              <b-form-select :disabled="!sortBy" v-model="sortDesc" slot="append">
                <option :value="false">Asc</option>
                <option :value="true">Desc</option>
              </b-form-select>
            </b-input-group>
          </b-form-group>
        </b-col>
        <b-col md="6" class="my-1">
          <b-form-group horizontal label="Sort direction" class="mb-0">
            <b-input-group>
              <b-form-select v-model="sortDirection" slot="append">
                <option value="asc">Asc</option>
                <option value="desc">Desc</option>
                <option value="last">Last</option>
              </b-form-select>
            </b-input-group>
          </b-form-group>
        </b-col>
        <b-col md="6" class="my-1">
          <b-form-group horizontal label="Per page" class="mb-0">
            <b-form-select :options="pageOptions" v-model="perPage" />
          </b-form-group>
        </b-col>
      </b-row>

      <!-- Main table element -->
      <b-table show-empty
              stacked="md"
              striped="striped"
              hover
              :items="problems"
              :fields="fields"
              :current-page="currentPage"
              :per-page="perPage"
              :filter="filter"
              :sort-by.sync="sortBy"
              :sort-desc.sync="sortDesc"
              :sort-direction="sortDirection"
              @filtered="onFiltered"
      >
        <template slot="actions" slot-scope="row">
          <!-- We use @click.stop here to prevent a 'row-clicked' event from also happening -->
          <b-button size="sm" @click.stop="info(row.item, row.index, $event.target)" class="mr-1" variant="primary">
            Details
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

      <b-row>
        <b-col md="6" class="my-1">
          <b-pagination :total-rows="totalRows" :per-page="perPage" v-model="currentPage" class="my-0" />
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
export default {
  name: 'Problems',
  data () {
    return {
      msg: 'Welcome',
      problems: [],
      fields: [
        { key: 'name', label: 'Problem name', sortable: true },
        { key: 'difficulty', label: 'Difficulty', sortable: true },
        { key: 'content', label: 'Content', sortable: false },
        { key: 'actions' }
      ],
      currentPage: 1,
      perPage: 5,
      totalRows: 0,
      pageOptions: [ 5, 10, 15 ],
      sortBy: null,
      sortDesc: false,
      sortDirection: 'asc',
      filter: null,
      modalInfo: { title: '', content: '' }
    }
  },
  computed: {
    sortOptions () {
      // Create an options list from our fields
      return this.fields
        .filter(f => f.sortable)
        .map(f => { return { text: f.label, value: f.key } })
    }
  },
  async mounted () {
    if (!this.$isOnline) return
    let loader = this.$loading.show()
    try {
      const result = await this.$api.problem.getAllProblems()
      if (result.ok) {
        this.problems = result.result
        this.totalRows = this.problems.length
        this.problems.map(x => {
          if (x.content.length > 150) {
            x.content = x.content.substring(0,150) + "..."
          }
        })
      } else {
        console.warn('something went wrong when I got the problems')
      }
    } catch (e) {
      console.warn(e)
    } finally {
      loader.hide()
    }
  },
  methods: {
    async logout () {
      let loader = this.$loading.show()
      try {
        await this.$firebase.auth().signOut()
        this.$router.replace('/')
      } catch (e) {
        console.warn(e)
      } finally {
        loader.hide()
      }
    },
    onFiltered (filteredItems) {
      // Trigger pagination to update the number of buttons/pages due to filtering
      this.totalRows = filteredItems.length
      this.currentPage = 1
    },
    info(item, index, target) {
      this.$router.push(`problem/${item.UID}`)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.problem-container {
  text-align: left;
  margin-top: 45px;
}
.btnLogout {
  float: left;
  margin-left: 10px;
}
</style>
