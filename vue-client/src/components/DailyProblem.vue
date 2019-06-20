<template>
    
</template>

<script>
export default {
  data () {
    return {
      dailyProblemPath: ''
    }
  },
  async mounted() {
    let loader = this.$loading.show()    
    if (!this.dailyProblemPath) {
      try {
        problemUID = await this.$api.getDailyProblem()
        this.dailyProblemPath = `/problem/${problemUID}`
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
