<template>
  <div id="app">
    <b-container fluid class="text-center">
      <div class="router">
        <router-view/>
      </div>
    </b-container>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* text-align: center; */
  color: #2c3e50;
  margin-top: 60px;
}
.router {
  margin-left: 10%;
  margin-right: 10%;
}
</style>
