<template>
  <v-card :loading="loading" max-width="374">
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
        <v-img :src="item" height="300" width="500"></v-img>
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
          color="rgb(241, 171, 87)"
          v-for="tag in this.modelData.tags"
          :key="tag"
          ><span class="white--text">{{ tag }}</span></v-chip
        >
      </v-chip-group>
    </v-card-text>

    <v-card-actions>
      <v-btn class="white--text" @click="overlay = !overlay">
        <v-icon large color="grey darken-4"> mdi-cart </v-icon>
      </v-btn>

      <v-overlay :z-index="zIndex" :value="overlay">
        <div class="d-flex justify-space-between">
          <v-btn
            class="white--text"
            color="transparent"
            @click="overlay = false"
          >
            <v-icon large color="white"> mdi-close </v-icon>
          </v-btn>
          <v-btn
            class="white--text"
            color="deep-orange accent-2"
            @click="overlay = false"
          >
            <v-icon large color="white"> mdi-cart </v-icon>
          </v-btn>
        </div>
        <v-row class="mt-16">
          <v-col>
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
                <v-img :src="item" height="300" width="500"></v-img>
              </v-carousel-item>
            </v-carousel>
          </v-col>
          <v-col>
            <model-object
              :model-id="this.modelData.id"
              v-if="this.isModel"
            ></model-object>
            <texture
              :model-id="this.modelData.id"
              :category="this.modelData.category"
              v-else
            ></texture>
          </v-col>
        </v-row>
      </v-overlay>
    </v-card-actions>
  </v-card>
</template>

<script>
import { mapGetters } from "vuex";
import Texture from "./Texture.vue";
import ModelObject from "./ModelObject.vue";
export default {
  components: {
    Texture,
    ModelObject,
  },
  data: () => ({
    rating: 0,
    users: 0,
    overlay: false,
    zIndex: 2,
    loading: false,
    selection: 1,
    colors: [],
    cycle: true,
  }),
  props: ["modelData", "isModel"],
  methods: {
    ...mapGetters(["getToken"]),
  },
  created: function () {
    this.rating = this.modelData.rating;
    this.users = this.modelData.purchaseCount;
  },
};
</script>

<style>
</style>