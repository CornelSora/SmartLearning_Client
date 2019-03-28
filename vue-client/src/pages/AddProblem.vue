<template>
  <div>
    <b-form @submit="onSubmit" @reset="onReset" v-if="show">
      <b-form-group
        id="problemTitleInputGroup"
        label="Problem title"
        label-for="problemTitleInput"
        description="Add here the name of the problemTitle"
      >
        <b-form-input
          id="problemTitleInput"
          type="text"
          v-model="problem.name"
          required
          placeholder="Enter problem's title" />
      </b-form-group>

      <b-form-group
        id="problemDescriptionGroup" 
        label="Problem description:" 
        label-for="problemDescriptionInput"
      >
        <b-form-textarea
          id="problemDescriptionInput"
          type="text"
          v-model="problem.content"
          required
          placeholder="Enter problem's description" />
      </b-form-group>

      <b-form-group 
        id="problemRatingGroup" 
        label="Problem difficulty:" 
        label-for="problemRatingInput"
      >
        <b-form-input 
          id="problemRatingInput"
          required
          min="1"
          max="12"
          step="1"
          type="number" 
          v-model="problem.difficulty" />
      </b-form-group>
      <b-form-group>
        <div v-for="item in items">
          <FunctionTest />
        </div>
        <b-button @click="addFunction">Add</b-button>
      </b-form-group>
      <b-button type="submit" variant="primary">Submit</b-button>
      <b-button type="reset" variant="danger">Reset</b-button>
    </b-form>
  </div>
</template>

<script>
import FunctionTest from '@/components/FunctionTest'
console.log(FunctionTest)


export default {
  data() {
    return {
      problem: {
        name: '',
        content: '',
        difficulty: null,
        addedBy: 1,
        tests: []
      },
      functionDetails: {
        name: '',
        returnType: '',
        results: []
      },
      show: true,
      items: [],
      currIndex: 0
    }
  },
  methods: {
    async onSubmit(evt) {
      let loader = this.$loading.show()
      try {
        evt.preventDefault()
        await this.$api.problem.addProblem(this.problem)
      } catch (e) {
      } finally {
        loader.hide()
        this.onReset(evt)
      }
    },
    onReset(evt) {
      evt.preventDefault()
      /* Reset our form values */
      this.problem.name = ''
      this.problem.content = ''
      this.problem.difficulty = null
      /* Trick to reset/clear native browser form validation state */
      this.show = false
      this.$nextTick(() => {
        this.show = true
      })
    },
    addFunction() {
      this.items.push(this.currIndex++)
    }
  },
  components: {
    FunctionTest
  }
}
</script>

<style>

</style>
