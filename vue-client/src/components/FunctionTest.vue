<template>
  <div>
    <b-form>
      <b-form-group
        id="functionTitleInputGroup"
        label="Function name"
        label-for="functionTitleInput"
        description="Add here the name of the function"
      >
        <b-form-input
          id="functionTitleInput"
          type="text"
          v-model="functionTest.name"
          required
          placeholder="Enter function's name" />
      </b-form-group>

      <b-form-group
        id="functionReturnTypeGroup" 
        label="Function return type:" 
        label-for="functionReturnTypeInput"
      >
        <b-form-textarea
          id="functionReturnTypeInput"
          type="text"
          v-model="functionTest.returnType"
          required
          placeholder="Enter function's return type" />
      </b-form-group>
      <b-button>Add</b-button>
    </b-form>
  </div>
</template>

<script>
import FunctionTest from '@/components/FunctionTest'
console.log(FunctionTest)


export default {
  data() {
    return {
      functionTest: {
        name: '',
        returnType: '',
        tests: []
      },
      show: true,
      items: [],
      currIndex: 0
    }
  },
  methods: {
  },
  components: {
  }
}
</script>

<style>

</style>
