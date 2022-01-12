<template>
  <v-card
    :loading="loading"
    max-width="374"
  >
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
        <v-img
          :src="item"
          height="300"
          width="500"
        ></v-img>
      </v-carousel-item>
    </v-carousel>

    <v-card-title>{{this.modelData.name}}</v-card-title>

    <v-card-text>
      <v-row
        align="center"
        class="mx-0"
      >
        <v-rating
          :value="4.5"
          color="amber"
          dense
          half-increments
          readonly
          size="14"
        ></v-rating>

        <div class="grey--text ms-4">
          4.5 (413)
        </div>
      </v-row>

      <div class="my-4 text-subtitle-1">
        ${{this.modelData.price}}
      </div>
    </v-card-text>

    <v-divider class="mx-4"></v-divider>

    <v-card-text>
      <v-chip-group
        v-model="selection"
        active-class="deep-purple accent-4 white--text"
        column
      >
        <v-chip color="rgb(241, 171, 87)" v-for="tag in this.modelData.tags" :key="tag"><span class="white--text">{{tag}}</span></v-chip>

      </v-chip-group>
    </v-card-text>

    <v-card-actions>
    <v-btn
      class="white--text"
      @click="overlay = !overlay"
    >
      <v-icon
      large
      color="grey darken-4"
    >
      mdi-cart
    </v-icon>
    </v-btn>

    <v-overlay
      :z-index="zIndex"
      :value="overlay"
    >
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
        <v-img
          :src="item"
          height="300"
          width="500"
        ></v-img>
      </v-carousel-item>
    </v-carousel>
    <model-object></model-object>
      <v-btn
        class="white--text"
        color="teal"
        @click="overlay = false"
      >
        Hide Overlay
      </v-btn>
    </v-overlay>
    </v-card-actions>
  </v-card>
</template>

<script>
import ModelObject from './ModelObject.vue'
export default {
  components: {
    ModelObject
  },
data: () => ({
      overlay: false,
      zIndex: 2,
      loading: false,
      selection: 1,
      colors: [
        ],
        cycle: true,
        
    }),
    props: ['modelData'],
    created: function () {
    // `this` points to the vm instance
    console.log(this.modelData)
  }
}
</script>

<style>

</style>