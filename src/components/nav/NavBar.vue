<template>
  <v-app-bar
    app
    color="grey darken-4"
    absolute
    elevate-on-scroll
    scroll-target="#scrolling-techniques-7"
  >
    <div class="d-flex align-center">
      <v-img
        alt="Vuetify Logo"
        class="shrink mr-2"
        contain
        src="../../assets/logo.svg"
        transition="scale-transition"
        width="40"
      />
      <span class="white--text">Polybase</span>
    </div>
    <v-spacer></v-spacer>
    <template v-if="this.user == ''">
      <router-link to="/login" class="pr-2">Login</router-link>
      <router-link to="/register">Register</router-link>
    </template>
    <template v-else>
      <router-link to="/browse" class="pr-2"
        ><v-icon dark> mdi-toy-brick-search </v-icon></router-link
      >
      <router-link to="/sell" class="pr-2"
        ><v-icon dark> mdi-cloud-upload </v-icon></router-link
      >
      <router-link to="/cart" class="pr-2"
        ><v-icon dark> mdi-cart </v-icon></router-link
      >
      <span class="pr-2 link">{{ this.user }}</span>
      <span class="link" @click="logout">Logout</span>
    </template>
  </v-app-bar>
</template>

<script>
import { mapGetters } from "vuex";
import { mapMutations } from "vuex";
export default {
  name: "NavBar",

  data: () => ({
    user: "",
  }),
  methods: {
    ...mapGetters(["getToken"]),
    ...mapMutations(["removeToken"]),
    parseJwt(token) {
      var base64Payload = token.split(".")[1];
      var payload = Buffer.from(base64Payload, "base64");
      return JSON.parse(payload.toString());
    },
    logout() {
      this.$store.commit("removeToken");
      window.location.reload();
    },
  },
  created: function () {
    if (!(this.getToken() === ""))
      this.user = this.parseJwt(this.getToken())["username"];
  },
};
</script>

<style scoped lang="scss">
.v-application a {
  color: white;
  text-decoration: none;
}
.link {
  color: white;
  &:hover {
    cursor: pointer;
  }
}
</style>