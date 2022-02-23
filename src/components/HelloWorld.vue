<template>
  <div id="main" :style="{ backgroundImage: 'url(' + background + ')' }">
    <div class="container" style="padding-top: 15%">
      <h1 class="white--text" style="font-size: 4rem">
        Explore the best 3D model <br />
        and texture marketplace
      </h1>
      <h2 class="pt-5" style="color: #fa7268">
        Refine your scenes with a curated selection of digital content.
      </h2>
      <router-link to="/browse/models/all" id="no-decoration">
        <v-btn
          class="white--text mt-10"
          id="browse"
          rounded
          x-large
          @click="clicked"
          ><span>Browse</span></v-btn
        ></router-link
      >
      <v-btn
        outlined
        class="white--text mt-10"
        id="learn"
        rounded
        x-large
        @click="clicked"
        ><span class="secondaryColor">Learn More</span></v-btn
      >
    </div>
  </div>
</template>

<script>
//import Texture from './model/Texture.vue'
export default {
  data() {
    return {
      file: "",
      background: require("@/assets/layered-waves-haikei_7.svg"),
      graphic: require("@/assets/clip-fatal-error.png"),
    };
  },
  components: {
    //Texture
  },
  methods: {
    clicked() {},
  },
  computed: {
    cssProps() {
      return {
        "--background-image": this.background,
      };
    },
  },
};
</script>
<style scoped lang="scss">
$secondary-color: #fa7268;
#main {
  height: calc(100vh - 64px);
  background-position: center;
  background-size: cover;
}

.secondaryColor {
  color: $secondary-color;
}
#browse {
  background: linear-gradient(90deg, orange, $secondary-color) !important;
  padding: 0 43.196px;
}
#learn {
  border-color: $secondary-color;
  margin-left: 40px;
}
#no-decoration {
  text-decoration: none;
}
</style>