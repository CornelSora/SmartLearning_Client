<template>
  <div>
    <nav-bar />
    <div id="app">
        <b-container fluid class="text-center">
          <div class="router">
            <router-view/>
          </div>
        </b-container>
    </div>
  </div>
</template>

<script>
import NavBar from './components/NavBar'
export default {
  name: 'App',
  components: {
    NavBar
  }
}
</script>

<style>
body {
  background-color: #f8f9fa;
  font-family: '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'
}
a {
    color: #17a2b8;
    text-decoration: none;
    background-color: transparent;
}
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

.page-link {
    position: relative;
    display: block;
    padding: 0.5rem 0.75rem;
    margin-left: -1px;
    line-height: 1.25;
    color: #17a2b8 !important;
    background-color: #fff;
    border: 1px solid #dee2e6;
}

.page-item.active .page-link {
    z-index: 1;
    color: #fff !important;
    background-color: #17a2b8;
    border-color: #17a2b8;
}
/* .page-link {
  color: #17a2b8 !important;
}
.page-item.active .page-link {
    z-index: 1;
    color: #fff;
    background-color: #17a2b8 !important;
    border-color: #17a2b8 !important;
} */
</style>
