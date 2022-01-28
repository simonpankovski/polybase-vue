<template>
  <div>
    <p>High quality 3D model and texture marketplace</p>
    <texture :model-data="file"></texture>
    <button @click="clicked">Test</button>
  </div>
</template>

<script>

import Texture from './model/Texture.vue'
export default {
   data() {
    return {
      file: ""
    }
   },
  components:{
    Texture
  },
  methods:{
    
    clicked(){
      
    }
  },
  created: function () {
    //v-if="this.file != ''"
  },
};
</script>
