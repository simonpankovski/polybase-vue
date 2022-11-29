<template>
  <v-container class="mt-16">
    <v-snackbar v-model="snackbar" top>
      {{ text }}
      <template v-slot:action="{ attrs }">
        <v-btn color="#94d2bd" text v-bind="attrs" @click="snackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
    <v-data-table
      dark
      :headers="headers"
      :items="items"
      :sort-by="['price', 'fat']"
      :sort-desc="[false, true]"
      multi-sort
      class="elevation-1"
      :loading="loading"
      loading-text="Loading... Please wait"
    >
      <template v-slot:item="row">
        <tr>
          <td>{{ row.item.name }}</td>
          <td>{{ row.item.price + " $" }}</td>
          <td>{{ row.item.type }}</td>
          <td>
            <v-btn small @click="onButtonClick(row.item)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </td>
        </tr>
      </template>

      <template v-slot:footer>
        <v-btn
          style="position: absolute; margin: 10px 20px; background: orange"
          :disabled="items.length == 0"
          @click="tokenCreated"
        >
          Checkout
        </v-btn>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";
export default {
  data() {
    return {
      secret: "",
      token: null,
      overlay: false,
      zIndex: 0,
      loading: true,
      headers: [
        {
          text: "Model/ Texture name",
          align: "start",
          sortable: false,
          value: "name",
        },
        { text: "Price", sortable: true, value: "price" },
        { text: "Type", value: "type" },
        { text: "Remove", value: "remove" },
      ],
      items: [],
      snackbar: false,
      text: `Checkout was successful!`,
      timeout: 5000,
    };
  },
  beforeMount() {
    if (this.getToken() === "") {
      this.$router.push("/login");
    }
  },
  methods: {
    ...mapGetters(["getToken", "getCart"]),
    ...mapMutations(["setCart"]),
    submit() {
      // this will trigger the process
      this.$refs.elementRef.submit();
    },
    tokenCreated() {
      let jwt = "Bearer " + this.getToken();
      this.loading = true;
      fetch(process.env.VUE_APP_BACKEND_SERVICE_URL + "cart/checkout", {
        method: "POST",
        mode: "cors",
        headers: {
          Authorization: jwt,
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          this.loading = false;
          if (data.code == 200) {
            this.$store.commit("setCart", 0);
            this.items = [];
            this.snackbar = true;
          }
        });
    },
    getClientSecret() {
      let token = "Bearer " + this.getToken();
      fetch(process.env.VUE_APP_BACKEND_SERVICE_URL + "cart/checkout", {
        method: "GET",
        mode: "cors",
        headers: {
          Authorization: token,
          "Access-Control-Allow-Origin": "*",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          this.secret = data.clientSecret;
        });
    },
    checkout() {},
    onButtonClick(item) {
      this.items = this.items.filter((d) => d.id !== item.id);
      let token = "Bearer " + this.getToken();
      fetch(
        process.env.VUE_APP_BACKEND_SERVICE_URL + "cart/" +
          item.objectId +
          "?type=" +
          item.type,
        {
          method: "DELETE",
          mode: "cors",
          headers: {
            Authorization: token,
            "Access-Control-Allow-Origin": "*",
          },
        }
      )
        .then((res) => res.json())
        .then(() => {
          this.$store.commit("setCart", this.getCart() - 1);
          this.items = this.items.filter((d) => d.id !== item.id);
        });
    },
  },
  created: function () {
    let token = "Bearer " + this.getToken();
    console.log(token);
    fetch(process.env.VUE_APP_BACKEND_SERVICE_URL + "cart/", {
      method: "GET",
      mode: "cors",
      headers: {
        Authorization: token,
        "Access-Control-Allow-Origin": "*",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        this.items = data.message;
        this.loading = false;
      });
  },
};
</script>

<style scoped lang="scss">
#checkout {
  padding: 50px;
  height: 30vh;
}

.v-overlay--active {
  backdrop-filter: blur(5px);
}
.v-snack__wrapper {
  position: fixed;
  top: 0 !important;
}
</style>
