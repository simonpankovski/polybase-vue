<template>
  <v-app-bar app color="grey darken-4" fixed class="px-7">
    <div class="d-flex align-center">
      <router-link to="/" class="d-flex align-center white--text"
        ><v-img
          class="mr-2"
          alt="Vuetify Logo"
          contain
          src="../../assets/polybase.png"
          transition="scale-transition"
          width="40"
        />Polybase</router-link
      >
    </div>
    <v-spacer></v-spacer>
    <template v-if="this.user == ''">
      <router-link to="/login" class="mr-8 py-2 px-10" id="login"
        >Login</router-link
      >
      <router-link to="/register" class="py-2 px-10" id="register"
        >Register</router-link
      >
    </template>
    <template v-else>
      <router-link to="/browse/models/all" class="pr-2">
        <v-btn color="transparent" dark>
          <v-icon dark> mdi-toy-brick-search </v-icon>
        </v-btn>
      </router-link>
      <router-link to="/sell" class="pr-2">
        <v-btn color="transparent" dark>
          <v-icon dark> mdi-cloud-upload </v-icon></v-btn
        ></router-link
      >
      <router-link to="/cart" class="pr-2"
        ><v-btn color="transparent" dark
          ><v-icon dark> mdi-cart </v-icon
          ><span id="cartCount" v-if="cartCount > 0">{{
            this.cartCount
          }}</span></v-btn
        ></router-link
      >
      <span class="pr-2 link">
        <div class="text-center">
          <v-menu offset-y>
            <template v-slot:activator="{ on }">
              <v-btn color="transparent" dark v-on="on">
                <v-icon dark> mdi-account </v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item v-for="(item, index) in items" :key="index">
                <router-link
                  class="black--text"
                  :to="'/' + item.title.toLowerCase()"
                >
                  <v-list-item-title>
                    {{ item.title }}
                  </v-list-item-title>
                </router-link>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </span>
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
    cartCount: 0,
    items: [{ title: "Profile" }, { title: "Purchases" }],
  }),
  methods: {
    ...mapGetters(["getToken", "getCart"]),
    ...mapMutations(["removeToken", "setCart"]),
    parseJwt(token) {
      var base64Payload = token.split(".")[1];
      var payload = Buffer.from(base64Payload, "base64");
      return JSON.parse(payload.toString());
    },
    logout() {
      this.$store.commit("removeToken");
      window.location.reload();
    },
    getCartItemsCount(token) {
      console.log(token);
      fetch("http://localhost:8000/api/cart/count", {
        method: "GET",
        mode: "cors",
        headers: {
          Authorization: "Bearer " + token,
          "Access-Control-Allow-Origin": "*",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data)
          if(data.code == 200){
            this.cartCount = data.message;
            this.$store.commit("setCart", data.message)
            console.log(this.getCart())
          }
          
        });
    },
  },
  created: function () {
    let token = this.getToken();

    if (!(token === "")) {
      this.user = this.parseJwt(token)["username"];
      this.getCartItemsCount(token);
    }
  },
  computed: {
    count () {
      return this.getCart();
      // Or return basket.getters.fruitsCount
      // (depends on your design decisions).
    }
  },
  watch: {
    count (newCount, oldCount) {
      // Our fancy notification (2).
      this.cartCount = newCount;
      console.log(`We have ${newCount} fruits now, yay! ${oldCount}`)
    }
  }
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
#login {
  border: 1px solid orange;
  border-top-left-radius: 50px;
  border-bottom-left-radius: 50px;
  border-top-right-radius: 50px;
  border-bottom-right-radius: 50px;
}
#register {
  background: orange;
  border-top-left-radius: 50px;
  border-bottom-left-radius: 50px;
  border-top-right-radius: 50px;
  border-bottom-right-radius: 50px;
}
#cartCount {
  position: absolute;
  top: -9px;
  right: -12px;
  background: orange;
  border-radius: 50%;
  font-size: 12px;
  padding: 2px;
  text-align: center;
  width: 20px;
}
</style>