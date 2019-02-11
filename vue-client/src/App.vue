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
.ace_breakpoint{ 
  border-radius: 20px 0px 0px 20px; 
  box-shadow: 0px 0px 1px 1px red inset; 
}
.myMarker {
  position:absolute;
  background:rgba(200,0,0,0.5);
  z-index:20;
}
</style>
