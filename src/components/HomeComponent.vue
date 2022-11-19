<template>
  <div id="main" :style="{ backgroundImage: 'url(' + background + ')' }">
    <div class="container" id="container">
      <h1 class="white--text">
        Explore the best 3D model and texture marketplace
      </h1>
      <h2 class="pt-5" id="second">
        Refine your scenes with a curated selection of digital content.
      </h2>
      <router-link to="/browse/models/all" id="no-decoration">
        <v-btn class="white--text mt-10" id="browse" x-large @click="clicked"
          ><span>Browse</span></v-btn
        ></router-link
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
  height: 100vh;
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
#second {
  color: #fbb5b0;
}
#container {
  padding: 15% 40px;
}
html,
body {
  overflow-y: hidden !important;
}
</style>