<template>
  <div class="problem-page">
    <center>
      <h2 class="info">{{ problem.name }}</h2>
    </center>
    <b-tabs class="problem-details">
        <b-tab title="Problem content" active>
          <b-media v-if="problem">
            <br/>
            <b>
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
        <b-tab title="Editor" @click="editorSelected"> <!--  @click="trigger" -->
            <EditorComponent
              :isReadonly="isAdmin"
              @test="saveInvitationCode" />
        </b-tab>
    </b-tabs>
  </div>
</template>

<script>
import EditorComponent from '@/components/Editor'
import InvitationStorage from '../services/InvitationStorage'

export default {
  name: 'problemDetails',
  data () {
    return {
      problem: {},
      solution: null,
      problemID: this.$route.params.id,
      isFirstTime: true,
      originalInvitations: [],
      invitedBy: null,
      hash: null,
      email: '',
      invStorage: new InvitationStorage(),
      isAdmin: false
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
        this.invitedBy = this.$route.query.invitedBy
        this.hash = this.$route.query.hash
        if (this.invitedBy && this.hash) {
          if (this.invitedBy == this.$userID) {
            this.problem.solution = this.invStorage.getCode()
            this.isAdmin = true
          } else {
            debugger
            this.isAdmin = false
            await this.getInvitations()
            var invitation = this.originalInvitations.find(x => x.invitedBy == this.invitedBy && x.emailHash.toString() == this.hash && x.problem == this.problemID)
            if (invitation.solution) {
              this.problem.solution = invitation.solution
            } else {
              this.problem.solution = ''
            }
          }
        }
        //  this.solution = this.$api.problem.getUserSolution()
      } else {
        console.warn('something went wrong when I got the problems')
      }
    } catch (e) {
      console.warn(e)
    } finally {
      loader.hide()
    }

    var subscription = this.$subject.subscribe({
      next: async (sender) => {
          if (sender.type == 'SAVE_SOLUTION') {
            this.saveInvitationCode(sender.solution)
          }
      }
    })
  },
  methods: {
    async getInvitations () {
      this.invitations = []
      try {
          let result = await this.$api.account.getProfile(this.$userID)
          var profile = {}
          if (result.ok) {
            profile = result.result
            this.email = profile.email
          } else {
            console.warn('something went wrong when I got the profile')
          }
          result = await this.$api.account.getInvitations(profile.email)
          if (result.ok) {
            let invits = result.result.invitations
            if (!result.result) return
            this.originalInvitations = result.result.invitations
          }
      } catch (e) {
          throw e
      }
  },
    goToProblems() {
      this.$router.push({ path: '/problems' })
    },
    editorSelected () {
      if (!this.isFirstTime) return
      this.isFirstTime = false
      this.$subject.next({
        type: this.invitedBy ? 'INVITATION' : 'EDITOR',
        userSolution: this.problem.solution,
        testFunctions: this.problem.functions
      })
    },
    async saveInvitationCode (solution) {
      var invitation = this.originalInvitations.find(x => x.invitedBy == this.invitedBy && x.emailHash.toString() == this.hash && x.problem == this.problemID)
      invitation.solution = solution
      var request = {
        invitations: this.originalInvitations,
        email: this.email
      }
      let loader = this.$loading.show()
      try {
          await this.$api.account.updateInvitation(request)
      } catch (e) {
          console.warn(e)
      } finally {
          loader.hide()
      }
    }
    // trigger() {
    //   document.dispatchEvent(new Event("trigger"))
    // }
  },
  components: {
    EditorComponent
  }
}
</script>

<style>
.problem-page {
  padding: 10px;
}
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
