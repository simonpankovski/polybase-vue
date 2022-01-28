<template>
  <v-container>
    <v-card>
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

      <v-tabs-items v-model="tab">
        <v-tab-item :value="'tab-1'">
          <v-container>
            <model-form></model-form>
          </v-container>
        </v-tab-item>
        <v-tab-item :value="'tab-2'">
          <v-container>
            <texture-form></texture-form>
          </v-container>
        </v-tab-item>
      </v-tabs-items>
    </v-card>
  </v-container>
</template>

<script>
import ModelForm from '../components/forms/ModelForm.vue';
import TextureForm from '../components/forms/TextureForm.vue';
export default {
  components: {ModelForm, TextureForm},
  data() {
    return {
      tab: null,
    }
  },

  methods: {
    
  },
 
};
</script>

<style>
</style>