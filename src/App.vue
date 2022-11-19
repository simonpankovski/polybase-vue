<template>
  <v-app id="main">
    <nav-bar></nav-bar>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import NavBar from "./components/nav/NavBar.vue";
export default {
  name: "App",
  components: {
    NavBar,
  },

  data: () => ({
    //
  }),
};
</script>
<style>
@import url("https://fonts.googleapis.com/css2?family=Quicksand:wght@400&display=swap");
body,
html {
  color-scheme: dark !important;
}

.v-application {
  font-family: "Quicksand", sans-serif !important;
}
.v-overlay__content {
  width: 100% !important;  
}
#main {
  background: rgb(49, 49, 49);
}
</style>
