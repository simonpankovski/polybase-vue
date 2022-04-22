<template>
  <v-container>
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
          <td>{{ row.item.price }}</td>
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
          @click="overlay = !overlay"
          :disabled="items.length == 0"
        >
          Checkout
        </v-btn>
      </template>
    </v-data-table>
    <v-overlay :z-index="zIndex" :value="overlay" style="width: 100%">
      <v-btn class="white--text mb-10" @click="overlay = false">
        <v-icon dark> mdi-close </v-icon>
      </v-btn>

      <v-card elevation="2" id="checkout">
        <v-card-text>
          <h2>Card Credentials</h2>
        </v-card-text>
        <stripe-element-card
          :pk="publishableKey"
          ref="elementRef"
          @token="tokenCreated"
          style="width: 100vh"
          class="px-2 my-5"
        ></stripe-element-card>
        <v-card-actions>
          <v-btn @click="submit" color="orange">Proceed</v-btn>
        </v-card-actions>
      </v-card>
      <v-snackbar v-model="snackbar" :timeout="timeout">
        {{ text }}

        <template v-slot:action="{ attrs }">
          <v-btn color="pink" text v-bind="attrs" @click="snackbar = false">
            Close
          </v-btn>
        </template>
      </v-snackbar>
    </v-overlay>
  </v-container>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";
import { StripeElementCard } from "@vue-stripe/vue-stripe";
export default {
  components: {
    StripeElementCard,
  },
  data() {
    return {
      secret: "",
      publishableKey:
        "pk_test_51K4oeOL44p3mSuwWwZwOVo0fiZKoJIdLE5Oj9p0DeBdL9bxABeNir4lfNRYZwfQw8O5C8h0rEETM4iQnmj5Bb8rt00ZeA7zBXB",
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
        { text: "Price in €", sortable: true, value: "price" },
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
    ...mapGetters(["getToken"]),
    ...mapMutations(["setCart"]),
    submit() {
      // this will trigger the process
      this.$refs.elementRef.submit();
    },
    tokenCreated(token) {
      console.log(token);
      let jwt = "Bearer " + this.getToken();
      fetch("http://localhost:8000/api/cart/checkout", {
        method: "POST",
        mode: "cors",
        headers: {
          Authorization: jwt,
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: token }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.code == 200) {
            this.$store.commit("setCart", 0);
            this.items = [];
            this.snackbar = true;
          }
        });
    },
    getClientSecret() {
      let token = "Bearer " + this.getToken();
      fetch("http://localhost:8000/api/cart/checkout", {
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
        "http://localhost:8000/api/cart/" +
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
        .then((data) => {
          console.log(data);
          this.items = this.items.filter((d) => d.id !== item.id);
        });
    },
  },
  created: function () {
    let token = "Bearer " + this.getToken();
    console.log(token);
    fetch("http://localhost:8000/api/cart/", {
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
</style>