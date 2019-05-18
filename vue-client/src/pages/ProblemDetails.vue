<template>
  <div>
    <!-- <b-btn @click="goToProblems" class="btnLogout" variant="primary">Problems</b-btn> -->
    <b-tabs class="problem-details">
        <b-tab title="Problem content" active>
          <b-media v-if="problem">
            <br/>
            <b>
              <h2 class="mt-0 info">{{ problem.name }}</h2>
              <p>Difficulty: {{ problem.difficulty }}</p>
            </b>
            <pre class="problem-content">
              <div>{{ problem.content }}</div>
            </pre>
            <div v-if="problem.functions && problem.functions.length > 0">
              <h4>Use the following function(s)</h4>
              <table class="table table-bordered">
                <thead class="thead-light">
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Return type</th>
                    <th scope="col">Parameters</th>
                    <!-- <th scope="col">Parameter types</th> -->
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="fct in problem.functions" :key="fct.name">
                    <td>{{fct.name}}</td>
                    <td>{{fct.returnType}}</td>
                    <td v-if="fct.parameters && fct.parameters.length > 0">
                      <!-- {{fct.parameters.map(x => x.parameterType).join(',')}} -->
                      <table class="table-bordered">
                        <thead class="thead-light">
                          <th>Type</th>
                          <th>Details</th>
                        </thead>
                        <tbody>
                          <tr v-for="param in fct.parameters" :key="fct.parameters.indexOf(param)">
                            <td>{{ param.parameterType }}</td>
                            <td>{{ param.parameterDesc }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-if="problem.tests && problem.tests.length > 0">
              <h4>It should pass the following tests:</h4>
              <table class="table table-bordered">
                <thead class="thead-light">
                  <th scope="col">Parameters</th>
                  <th scope="col">Expected result</th>
                </thead>
                <tbody>
                  <tr v-for="test in problem.tests" :key="problem.tests.indexOf(test)">
                    <td>
                      <div v-for="param in test.parameters" :key="param">
                        Param{{test.parameters.indexOf(param)}}: {{param}}
                      </div>
                    </td>
                    <td>{{test.expectedResult}}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </b-media>
        </b-tab>
        <b-tab title="Editor" @click="trigger">
            <EditorComponent />
        </b-tab>
    </b-tabs>
  </div>
</template>

<script>
import EditorComponent from '@/components/Editor'
export default {
  name: 'problemDetails',
  data () {
    return {
      problem: {},
      solution: null,
      problemID: this.$route.params.id
    }
  },
  async mounted () {
    if (!this.$isOnline) return
    let loader = this.$loading.show()
    try {
      const result = await this.$api.problem.getProblem(this.problemID, this.$userID)
      if (result.ok) {
        this.problem = result.result
        if (this.problem.functions) {
          this.problem.tests = this.problem.functions.map(x => x.tests)[0]
          this.problem.tests = this.problem.tests.slice(0, this.problem.tests.length / 2)
        }
        this.solution = this.$api.problem.getUserSolution()
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
    goToProblems() {
      this.$router.push({ path: '/problems' })
    },
    trigger() {
      document.dispatchEvent(new Event("trigger"))
    }
  },
  components: {
    EditorComponent
  }
}
</script>

<style>
.problem-details {
    text-align: left;
}
.problem-content {
    white-space: pre-wrap;       /* css-3 */
    white-space: -moz-pre-wrap;  /* Mozilla, since 1999 */
    white-space: -pre-wrap;      /* Opera 4-6 */
    white-space: -o-pre-wrap;    /* Opera 7 */
    word-wrap: break-word;       /* Internet Explorer 5.5+ */
}
</style>
