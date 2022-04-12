<template>
  <v-container>
    <v-card color="grey darken-2">
      <v-tabs
        v-model="tab"
        background-color="deep-orange accent-2"
        centered
        dark
        icons-and-text
      >
        <v-tabs-slider></v-tabs-slider>

        <v-tab href="#tab-1">
          Upload a model with textures
          <v-icon>mdi-toy-brick-outline</v-icon>
        </v-tab>

        <v-tab href="#tab-2">
          Upload textures only
          <v-icon>mdi-texture</v-icon>
        </v-tab>
      </v-tabs>

      <v-tabs-items v-model="tab" dark>
        <v-tab-item :value="'tab-1'">
          
            <model-form></model-form>
          
        </v-tab-item>
        <v-tab-item :value="'tab-2'">
          
            <texture-form></texture-form>
          
        </v-tab-item>
      </v-tabs-items>
    </v-card>
  </v-container>
</template>

<script>
import ModelForm from "../components/forms/ModelForm.vue";
import TextureForm from "../components/forms/TextureForm.vue";
import { mapGetters } from "vuex";
export default {
  components: { ModelForm, TextureForm },
  data() {
    return {
      tab: null,
    };
  },
  beforeMount() {
    if (this.getToken() === "") {
      this.$router.push("/login");
    }
  },
  methods: {
    ...mapGetters(["getToken"]),
  },
};
</script>

<style>
</style>