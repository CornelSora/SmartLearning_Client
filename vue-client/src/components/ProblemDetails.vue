<template>
    <b-tabs class="problem-details">
        <b-tab title="Problem content" active>
            <b-media v-if="problem">
                <br/>
                <b>
                    <h4 class="mt-0">{{ problem.name }}</h4>
                    <p>Difficulty: {{ problem.difficulty }}</p>
                </b>
                <pre class="problem-content">
                    <div>{{ problem.content }}</div>
                </pre>
            </b-media>
        </b-tab>
        <b-tab title="Editor" v-if="!this.isOnline || this.$api.problem.getUserSolution()">
            <EditorComponent />
        </b-tab>
    </b-tabs>
</template>

<script>
import EditorComponent from './Editor'
export default {
  name: 'problemDetails',
  data () {
    return {
      problem: {},
      solution: '',
      problemID: this.$route.params.id
    }
  },
  async mounted () {
    if (!this.isOnline) return
    let loader = this.$loading.show()
    try {
      const result = await this.$api.problem.getProblem(this.problemID, this.$userID)
      if (result.ok) {
        this.problem = result.result
      } else {
        console.warn('something went wrong when I got the problems')
      }
    } catch (e) {
      console.warn(e)
    } finally {
      loader.hide()
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
