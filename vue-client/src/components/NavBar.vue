<template>
    <div>
        <b-navbar toggleable="lg" type="dark" variant="info" class="navbar-fixed-top">
            <b-navbar-brand href="#">Smart Learning</b-navbar-brand>

            <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

            <b-collapse id="nav-collapse" is-nav>
            <b-navbar-nav>                    
                <b-nav-item to="/problems" v-if="isAuthenticated" class="link">Problems</b-nav-item>
                <b-nav-item :to="getDailyProblemPath()" class="link"  v-if="isAuthenticated && getDailyProblemPath()" replace>Daily problem</b-nav-item>
                <b-nav-item to="/Editor" class="link" @click="editTest_Clicked()">Editor (Test)</b-nav-item>
                <b-nav-item to="/AddClient" class="link" v-if="isAuthenticated">Clients</b-nav-item>
            </b-navbar-nav>

            <!-- Right aligned nav items -->
            <b-navbar-nav class="ml-auto link">
                <b-nav-form>
                <b-form-input size="sm" class="mr-sm-2" placeholder="Search"></b-form-input>
                <b-button size="sm" class="my-2 my-sm-0" type="submit">Search</b-button>
                </b-nav-form>

                <b-nav-item-dropdown text="Lang" right>
                  <b-dropdown-item href="#">EN</b-dropdown-item>
                  <b-dropdown-item href="#">ES</b-dropdown-item>
                  <b-dropdown-item href="#">RU</b-dropdown-item>
                  <b-dropdown-item href="#">FA</b-dropdown-item>
                </b-nav-item-dropdown>

                <b-nav-item-dropdown right>
                  <!-- Using 'button-content' slot -->
                  <template slot="button-content"><em>User</em></template>
                  <b-dropdown-item href="#" v-if="isAuthenticated">Profile</b-dropdown-item>
                  <b-dropdown-item to="/Login"  v-if="!isAuthenticated">Login</b-dropdown-item>
                  <b-dropdown-item to="/Register"  v-if="!isAuthenticated">Register</b-dropdown-item>
                  <b-dropdown-item @click="logout" v-if="isAuthenticated">Sign Out</b-dropdown-item>
                </b-nav-item-dropdown>
            </b-navbar-nav>
            </b-collapse>
        </b-navbar>
        </div>
</template>

<script>
export default {
  data () {
    return {
      isAuthenticated: false,
      dailyProblemPath: ''
    }
  },
  async mounted () {
    this.isAuthenticated = this.$firebase.auth().currentUser != null
    this.$subject.subscribe({
      next: (sender) => {
        switch(sender.type) {
          case 'LOGIN': {
            this.isAuthenticated = true
          }
          case 'REDIRECT_PROBLEMS': {
            this.isAuthenticated = true
            this.$router.push('/problems')
          }
          case 'DAILY': {
            this.dailyProblemPath = sender.daily ? `/problem/${sender.daily}?daily=1!==!` : ''
          }
        }
      }
    })
    // if (this.isAuthenticated) {
    //   let loader = this.$loading.show()    
    //   if (!this.dailyProblemPath) {
    //     try {
    //       problemUID = await this.$api.problem.getDailyProblem()
    //       this.dailyProblemPath = `/problem/${problemUID}`
    //     } catch (e) {
    //       console.warn(e)
    //     } finally {
    //       loader.hide()
    //     }
    //   }
    // }
  },
  methods: {
    async logout () {
      let loader = this.$loading.show()
      try {
        await this.$firebase.auth().signOut()
        this.$localStorage.set('headerToken', '')
        this.isAuthenticated = false
        this.$router.replace('/')
      } catch (e) {
        console.warn(e)
      } finally {
        loader.hide()
      }
    },
    getDailyProblemPath () {
      return this.dailyProblemPath
    },
    editTest_Clicked() {
      this.$subject.next({
        type: 'EDITOR_TEST'
      })
    }
  }
}
</script>

<style>
.link {
  cursor: pointer !important;
}
.navbar-fixed-top {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
}
</style>
