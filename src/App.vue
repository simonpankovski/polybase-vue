<template>
  <v-app>
    <nav-bar></nav-bar>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import NavBar from './components/nav/NavBar.vue'
export default {
  name: "App",
  components: {
    NavBar
  },

  data: () => ({
    //
  }),
};
</script>
<style>
@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400&display=swap');
.v-application {
   font-family: 'Quicksand', sans-serif !important;
 }
</style>
