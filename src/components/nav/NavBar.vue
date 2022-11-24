<template>
  <div class="nav-bar">
    <v-app-bar fixed color="grey darken-4" class="px-7">
      <router-link to="/" class="d-flex align-center white--text">
        <v-img
          class="mr-2"
          alt="Vuetify Logo"
          contain
          src="../../assets/polybase.png"
          transition="scale-transition"
          width="40"
        />Polybase
      </router-link>
      <v-spacer></v-spacer>
      <v-app-bar-nav-icon
        @click="drawer = true"
        color="white"
        v-if="this.windowWidth < 1280"
      ></v-app-bar-nav-icon>
      <div v-else>
        <template v-if="this.user == ''" class="d-flex">
          <router-link to="/login" class="mx-8 py-2 px-5" id="login"
            >Login</router-link
          >
          <router-link to="/register" class="py-2 px-5" id="register"
            >Register</router-link
          >
        </template>
        <template v-else>
          <div class="d-flex">
            <router-link to="/browse/models/all" class="pr-4">
              <v-icon class="nav-icon" medium dark>
                mdi-toy-brick-search
              </v-icon>
            </router-link>
            <router-link to="/cart" class="pr-4 relative">
              <v-icon class="nav-icon" dark> mdi-cart </v-icon
              ><span id="cartCount" v-if="cartCount > 0">{{
                this.cartCount
              }}</span>
            </router-link>
            <span class="pr-4 link">
              <div class="text-center">
                <v-menu offset-y>
                  <template v-slot:activator="{ on }">
                    <v-icon class="nav-icon" dark v-on="on">
                      mdi-account
                    </v-icon>
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
          </div>
        </template>
      </div>
    </v-app-bar>

    <v-navigation-drawer
      v-model="drawer"
      absolute
      temporary
      color="grey darken-4"
    >
      <template v-if="this.user == ''" class="d-flex">
        <div class="d-flex flex-column">
          <router-link to="/login" class="mx-15 mt-10 py-2 px-5" id="login"
            >Login</router-link
          >
          <router-link to="/register" class="mx-15 mt-5 py-2 px-5" id="register"
            >Register</router-link
          >
        </div>
      </template>
      <template v-else>
        <div class="d-flex flex-column nav-links">
          <router-link to="/browse/models/all" class="text-center mt-5">
            <v-icon class="nav-icon" dark> mdi-toy-brick-search </v-icon>
          </router-link>
          <router-link to="/cart" class="text-center mt-5 cart-link">
            <v-icon class="nav-icon" dark> mdi-cart </v-icon
            ><span id="cartCount" v-if="cartCount > 0">{{
              this.cartCount
            }}</span>
          </router-link>
          <span class="link">
            <div class="text-center mt-5">
              <v-menu offset-y>
                <template v-slot:activator="{ on }">
                  <v-icon class="nav-icon" dark v-on="on"> mdi-account </v-icon>
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
          <span class="link text-center mt-5" @click="logout">Logout</span>
        </div>
      </template>
    </v-navigation-drawer>
  </div>
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
    drawer: false,
    group: null,
    windowWidth: window.innerWidth,
  }),
  methods: {
    ...mapGetters(["getToken", "getCart"]),
    ...mapMutations(["removeToken", "setCart", "setSearchTerm"]),
    capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
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
      fetch(process.env.VUE_APP_BACKEND_SERVICE_URL + "cart/count", {
        method: "GET",
        mode: "cors",
        headers: {
          Authorization: "Bearer " + token,
          "Access-Control-Allow-Origin": "*",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          if (data.code == 200) {
            this.cartCount = data.message;
            this.$store.commit("setCart", data.message);
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
    count() {
      return this.getCart();
    },
    width() {
      return this.windowWidth;
    },
    isMobile() {
      return this.windowWidth < 1280;
    },
  },
  watch: {
    count(newCount, oldCount) {
      // Our fancy notification (2).
      console.log(newCount, oldCount);
      this.cartCount = newCount;
    },
    width(newWidth, oldWidth) {
      console.log(newWidth, oldWidth);
    },
  },
  mounted() {
    window.addEventListener("resize", () => {
      this.windowWidth = window.innerWidth;
    });
  },
};
</script>

<style scoped lang="scss">
.relative {
  position: relative !important;
}
.nav-icon:hover {
  color: orange;
}

.v-application a {
  color: white;
  text-decoration: none;
}

.link {
  color: white;
  display: flex;
  justify-content: center;
  align-content: center;
  flex-direction: column;
  text-align: center !important;

  &:hover {
    cursor: pointer;
  }
}

#register {
  background: orange;
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  transition: 0.3s;

  &:hover {
    background: rgb(255, 190, 68);
  }
}
.nav-links {
  justify-content: center !important;
  & a {
    margin: 0 auto;
    width: 24% !important;
  }
}
.cart-link {
  position: relative;
}
#cartCount {
  position: absolute;
  top: -9px;
  right: 8px;
  background: #333333;
  border: 1px solid rgb(104, 250, 220);
  background-color: rgb(104, 250, 220);
  color: white;
  border-radius: 50%;
  font-size: 12px;
  padding: 2px;
  text-align: center;
  width: 22px;
  height: 22px;
}
.nav-bar {
  z-index: 2;
  width: 100%;
}
.v-toolbar__content {
  padding: 0 !important;
}
</style>