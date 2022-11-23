<template>
  <v-card :loading="loading" max-width="400" dark>
    <template slot="progress">
      <v-progress-linear
        color="deep-purple"
        height="10"
        indeterminate
      ></v-progress-linear>
    </template>

    <v-carousel
      :continuous="true"
      :cycle="this.cycle"
      :show-arrows="true"
      hide-delimiter-background
      delimiter-icon="mdi-minus"
      height="auto"
    >
      <v-carousel-item
        v-for="(item, i) in this.modelData.thumbnailLinks"
        :key="i"
      >
        <v-img :src="item" height="300"></v-img>
      </v-carousel-item>
    </v-carousel>

    <v-card-title>{{ this.modelData.name }}</v-card-title>

    <v-card-text class="d-flex" align="center">
      <v-row align="center" class="m-0 justify-space-between">
        <div class="d-flex flex-row">
          <v-rating
            :value="this.rating"
            background-color="white"
            color="amber"
            dense
            half-increments
            readonly
            size="14"
            class="mr-2"
          ></v-rating>

          <div class="grey--text">
            {{ this.rating.toFixed(1) }} ({{ this.users }})
          </div>
        </div>
        <div>
          <div class="text-subtitle-1">${{ this.modelData.price }}</div>
        </div>
      </v-row>
    </v-card-text>

    <v-divider class="mx-4"></v-divider>

    <v-card-text v-if="this.modelData.tags" class="py-2">
      <v-chip-group
        v-model="selection"
        active-class="deep-purple accent-4 white--text"
        column
      >
        <v-chip
          color="rgb(48 48 48)"
          v-for="tag in this.modelData.tags"
          :key="tag"
          ><span class="white--text">{{ tag }}</span></v-chip
        >
      </v-chip-group>
    </v-card-text>

    <v-card-actions class="justify-space-between px-4 py-4">
      <v-btn
        class="rounded-0"
        outlined
        color="orange"
        @click="overlay = !overlay"
      >
        <v-icon small color="orange"> mdi-cart </v-icon>
      </v-btn>
      <!-- color="rgb(104 250 220 / 65%)" class="white--text" -->
      <v-btn
        class="rounded-circle rainbow"
        fab
        outlined
        x-small
        color="rgb(104 250 220 / 65%)"
        v-if="displayDownloadButton"
        @click="downloadModel"
      >
        <v-icon small color="rgb(104 250 220 / 65%)">
          mdi-cloud-download-outline</v-icon
        >
      </v-btn>
      <v-overlay :z-index="zIndex" :value="overlay">
        <v-card elevation="2" class="overlay">
          <v-container id="container">
            <div
              class="d-flex justify-space-between px-3"
              style="padding-top: 10px"
            >
              <v-snackbar class="mt-16" top v-model="snackbar">
                {{ text }}

                <template v-slot:action="{ attrs }">
                  <v-btn
                    color="pink"
                    text
                    v-bind="attrs"
                    @click="snackbar = false"
                  >
                    Close
                  </v-btn>
                </template>
              </v-snackbar>
              <v-btn
                class="white--text rounded-0"
                color="white"
                outlined
                @click="overlay = false"
              >
                <v-icon medium color="white"> mdi-close </v-icon>
              </v-btn>
              <v-btn
                fab
                outlined
                small
                color="rgb(104 250 220 / 65%)"
                @click="downloadModel"
                v-if="displayDownloadButton"
              >
                <v-icon small color="rgb(104 250 220 / 65%)">
                  mdi-cloud-download-outline</v-icon
                >
              </v-btn>
              <v-btn
                v-else
                class="rounded-0"
                outlined
                color="orange"
                @click="addToCart"
              >
                <v-icon small color="orange"> mdi-cart </v-icon>
              </v-btn>
            </div>
            <v-row class="mt-6">
              <v-col sm="12" md="6">
                <v-carousel
                  :continuous="true"
                  :cycle="this.cycle"
                  hide-delimiter-background
                  delimiter-icon="mdi-minus"
                  height="300"
                  class="d-flex justify-center"
                >
                  <v-carousel-item
                    v-for="(item, i) in this.modelData.thumbnailLinks"
                    :key="i"
                  >
                    <v-img :src="item" max-height="300" max-width="550"></v-img>
                  </v-carousel-item>
                </v-carousel>
                <v-simple-table class="mt-10 bg-color" id="data-table">
                  <template v-slot:default>
                    <tbody>
                      <tr>
                        <td>Model Name</td>
                        <td>
                          <h3>{{ modelData.name }}</h3>
                        </td>
                      </tr>
                      <tr>
                        <td>Price</td>
                        <td>{{ modelData.price }}€</td>
                      </tr>
                      <tr>
                        <td>Created</td>
                        <td>{{ dateTime }}</td>
                      </tr>
                      <tr>
                        <td>Owner Email</td>
                        <td>{{ modelData.ownerEmail }}</td>
                      </tr>
                      <tr>
                        <td>Rating</td>
                        <td>{{ modelData.rating.toFixed(1) }} / 5</td>
                      </tr>
                      <tr v-if="isModel">
                        <td>Supported Formats</td>
                        <td v-for="tag in modelData.tags" :key="tag">
                          <v-chip
                            class="ma-2"
                            color="pink"
                            label
                            text-color="white"
                          >
                            <v-icon left> mdi-label </v-icon>
                            {{ tag }}
                          </v-chip>
                        </td>
                      </tr>
                    </tbody>
                  </template>
                </v-simple-table>
              </v-col>
              <v-col sm="12" md="6" lg="6">
                <model-object
                  :model-id="this.modelData.id"
                  :model-data="this.modelData"
                  v-if="this.isModel"
                >
                </model-object>
                <texture
                  :model-id="this.modelData.id"
                  :category="this.modelData.category"
                  :model-data="this.modelData"
                  v-else
                ></texture>
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-overlay>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapGetters } from "vuex";
import { mapMutations } from "vuex";
import Texture from "./Texture.vue";
import ModelObject from "./ModelObject.vue";
export default {
  components: {
    Texture,
    ModelObject,
  },
  data: () => ({
    snackbar: false,
    text: `Hello, I'm a snackbar`,
    rating: 0,
    users: 0,
    overlay: false,
    zIndex: 2,
    loading: false,
    selection: 1,
    colors: [],
    cycle: true,
    user: "",
    dateTime: "",
  }),
  props: ["modelData", "isModel"],
  methods: {
    ...mapGetters(["getToken", "getCart"]),
    ...mapMutations(["incrementCart", "decrementCart"]),
    parseJwt: function (token) {
      var base64Payload = token.split(".")[1];
      var payload = Buffer.from(base64Payload, "base64");
      return JSON.parse(payload.toString());
    },
    downloadModel: function () {
      let type = this.isModel ? "model" : "texture";
      let jwt = "Bearer " + this.getToken();

      fetch("http://localhost:8000/api/" + type + "/" + this.modelData.id, {
        method: "GET",
        mode: "cors",
        headers: {
          Authorization: jwt,
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.blob())
        .then((blob) => {
          var file = window.URL.createObjectURL(blob);
          window.location.assign(file);
        });
    },
    addToCart: function () {
      let token = "Bearer " + this.getToken();
      let model = this.isModel ? "model" : "texture";
      fetch(
        "http://localhost:8000/api/cart/" +
          this.modelData.id +
          "?type=" +
          model,
        {
          method: "POST",
          mode: "cors",
          headers: {
            Authorization: token,
            "Access-Control-Allow-Origin": "*",
          },
        }
      )
        .then((res) => res.json())
        .then((data) => {
          this.text = data.message;
          this.snackbar = true;
          if (data.code == 200) {
            this.$store.commit("incrementCart");
          }
          if (data.code == 401) {
            this.text = "Redirecting to login page in 3 seconds!";
            this.snackbar = true;
            const self = this;
            let counter = 4;
            let myInterval = setInterval(function () {
              if (counter === 0) {
                self.text = "";
                clearInterval(myInterval);
                self.$router.push("/login");
              } else {
                self.text =
                  "Redirecting to login page in " + --counter + " seconds!";
              }
            }, 1000);
          }
        });
    },
  },
  watch: {
    overlayValue(newVal, oldVal) {
      console.log(newVal, oldVal, "overlay");
    },
  },
  computed: {
    displayDownloadButton: function () {
      // `this` points to the vm instance
      return this.modelData.purchases.includes(this.user);
    },
    overlayValue() {
      return this.overlay;
    },
  },
  created: function () {
    let createdOn = this.modelData.createdOn.split("T");
    this.dateTime = createdOn[0] + " " + createdOn[1].split("+")[0];
    if (this.getToken() != "")
      this.user = this.parseJwt(this.getToken()).username;
    this.rating = this.modelData.rating;
    this.users = this.modelData.purchaseCount;
  },
};
</script>

<style scoped lang="scss">
#data-table {
  margin: 0 auto;
}
.overlay {
  overflow-y: auto;
  height: auto;
  padding: 0;
}
.row {
  margin: 0 !important;
}

#container {
  overflow-y: visible;
}

.bg-color {
  padding: 20px;
  background: #333333;
}

.v-overlay--active {
  backdrop-filter: blur(5px) !important;
}
</style>
