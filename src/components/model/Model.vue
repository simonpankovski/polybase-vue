<template>
  <v-card :loading="loading" max-width="374" dark>
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
      height="300"
    >
      <v-carousel-item
        v-for="(item, i) in this.modelData.thumbnailLinks"
        :key="i"
      >
        <v-img :src="item" height="300"></v-img>
      </v-carousel-item>
    </v-carousel>

    <v-card-title>{{ this.modelData.name }}</v-card-title>

    <v-card-text>
      <v-row align="center" class="mx-0">
        <v-rating
          :value="this.rating"
          color="amber"
          dense
          half-increments
          readonly
          size="14"
        ></v-rating>

        <div class="grey--text ms-4">{{ this.rating }} ({{ this.users }})</div>
      </v-row>

      <div class="my-4 text-subtitle-1">${{ this.modelData.price }}</div>
    </v-card-text>

    <v-divider class="mx-4"></v-divider>

    <v-card-text>
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

    <v-card-actions class="justify-space-between">
      <v-btn color="orange" @click="overlay = !overlay">
        <v-icon large color="white"> mdi-cart </v-icon>
      </v-btn>
      <v-btn
        color="rgb(104 250 220 / 65%)"
        class="white--text"
        v-if="displayDownloadButton"
        @click="downloadModel"
      >
        <v-icon large color="white"> mdi-cloud-download-outline</v-icon>
      </v-btn>
      <v-overlay :z-index="zIndex" :value="overlay" class="fullHeight">
        <v-card elevation="2">
          <v-container id="container" class="height">
            <div class="d-flex justify-space-between" style="padding-top: 10px">
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
                class="white--text"
                color="transparent"
                @click="overlay = false"
              >
                <v-icon large color="white"> mdi-close </v-icon>
              </v-btn>
              <v-btn
                color="rgb(104 250 220 / 65%)"
                class="white--text"
                @click="downloadModel"
                v-if="displayDownloadButton"
              >
                <v-icon large color="white"> mdi-cloud-download-outline</v-icon>
              </v-btn>
              <v-btn
                v-else
                class="white--text"
                color="deep-orange accent-2"
                @click="addToCart"
              >
                <v-icon large color="white"> mdi-cart </v-icon>
              </v-btn>
            </div>
            <v-row class="mt-6" style="height: 80vh">
              <v-col sm="12" md="6">
                <v-carousel
                  :continuous="true"
                  :cycle="this.cycle"
                  :show-arrows="true"
                  hide-delimiter-background
                  delimiter-icon="mdi-minus"
                  height="300"
                  class="d-flex justify-center"
                >
                  <v-carousel-item
                    v-for="(item, i) in this.modelData.thumbnailLinks"
                    :key="i"
                  >
                    <v-img :src="item" max-height="300" max-width="400"></v-img>
                  </v-carousel-item>
                </v-carousel>
                <v-simple-table class="mt-10 ml-5 bg-color">
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
                        <td>{{ modelData.rating }}/ 5</td>
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
                            {{tag}}
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
                ></model-object>
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
      console.log(this.modelData.id);
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
        });
    },
  },
  computed: {
    displayDownloadButton: function () {
      // `this` points to the vm instance
      return this.modelData.purchases.includes(this.user);
    },
  },
  created: function () {
    let createdOn = this.modelData.createdOn.split("T");
    this.dateTime = createdOn[0] + " " + createdOn[1].split("+")[0];
    this.user = this.parseJwt(this.getToken()).username;
    this.rating = this.modelData.rating;
    this.users = this.modelData.purchaseCount;
  },
};
</script>

<style scoped>
.fullHeight {
  height: 100vh;
  width: 100vw;
}
.height {
  height: 90vh;
  width: 80vw;
  padding: 0px 3%;
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