<template>
  <div>
    <div id="container">
      <v-subheader class="pl-0">
        <h2>Metalness</h2>
      </v-subheader>
      <v-slider
        v-model="metalness"
        thumb-label="always"
        :thumb-color="'orange'"
        @change="metalnessFunc"
      ></v-slider>
      <v-subheader class="pl-0">
        <h2>Roughness</h2>
      </v-subheader>
      <v-slider
        v-model="roughness"
        thumb-label="always"
        :thumb-color="'orange'"
        @change="metalnessFunc"
      ></v-slider>
      <div id="canvas"></div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import * as Three from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
export default {
  data() {
    return {
      logo: require("@/assets/lilienstein_4k.hdr"),
      camera: null,
      scene: null,
      renderer: null,
      mesh: null,
      controls: null,
      file: "",
      roughness: 10,
      color: null,
      metalness: 45,
      normal: null,
      disp: null,
      ao: null,
      metal: null,
      rough: null,
    };
  },
  props: ["modelId", "category"],
  methods: {
    metalnessFunc: function () {
     
      if (this.mesh != null) {
         console.log(this.mesh.material)
        this.mesh.material.metalness = this.metalness * 0.01;
        this.mesh.material.roughness = this.roughness * 0.01;
      }

      this.renderer.render(this.scene, this.camera);
    },
    ...mapGetters(["getToken"]),
    blobToDataURL: function (blob, callback) {
      var a = new FileReader();
      a.onload = function (e) {
        callback(e.target.result);
      };
      a.readAsDataURL(blob);
    },
    clicked: function () {
      let token = "Bearer " + this.getToken();
      fetch("http://localhost:8000/api/texture/" + this.modelId, {
        method: "GET",
        mode: "cors",
        headers: {
          Authorization: token,
          "Access-Control-Allow-Origin": "*",
        },
      })
        .then((res) => {
          return res.json();
        })
        .then((blob) => {
          if (blob.code == 200) {
            let message = blob.message;
            message.forEach((element) => {
              let filename = element.headers["content-disposition"][0].split("=")[1];
              if (filename.includes("COL")) {
                this.color = element.file;
              } else if (filename.includes("AO")) {
                this.ao = element.file;
              } else if (filename.includes("DISP")) {
                this.disp = element.file;
              } else if (filename.includes("NRM")) {
                this.normal = element.file;
              } else if (
                filename.includes("ROUGH") ||
                filename.includes("REFL")
              ) {
                this.rough = element.file;
              } else if (
                filename.includes("METAL") ||
                filename.includes("GLOSS")
              ) {
                this.metal = element.file;
              }
            });
            this.init();
          } else {
            console.log("blob.message");
          }
        });
    },
    init: function () {
      let container = document.getElementById("canvas");

      //const loader = new FBXLoader();
      this.camera = new Three.PerspectiveCamera(
        70,
        container.clientWidth / container.clientHeight,
        0.01,
        20
      );
      this.camera.position.z = 12;
      const light = new Three.DirectionalLight(0xffffff, 3);

      // move the light right, up, and towards us
      light.position.set(10, 10, 15);
      this.scene = new Three.Scene();
      this.scene.background = new Three.Color("#575454");

      const geometry = new Three.SphereGeometry(4, 1024, 1024);
      const textureLoader = new Three.TextureLoader();
      let colorMap = textureLoader.load(this.color);
      let normalMap = textureLoader.load(this.normal);
      let displacementMap = textureLoader.load(this.disp);
      let roughnessMap = textureLoader.load(this.roughness);
      let aoMap = textureLoader.load(this.ao);
      let metalMap = textureLoader.load(this.metal);
      let self = this;
      self.renderer = new Three.WebGLRenderer({ antialias: true });
      self.renderer.outputEncoding = Three.sRGBEncoding;
      self.renderer.toneMapping = Three.ACESFilmicToneMapping;
      self.renderer.toneMappingExposure = 1.25;
      self.renderer.setSize(container.clientWidth, container.clientHeight);
      self.renderer.setPixelRatio(window.devicePixelRatio);
      self.renderer.physicallyCorrectLights = true;
      let roughnessValue = self.roughness * 0.01;
      let metalnessValue = self.metalness * 0.01;
      let envmapLoader = new Three.PMREMGenerator(self.renderer);
      new RGBELoader().load(this.logo, function (hdrMap) {
        let envMap = envmapLoader.fromCubemap(hdrMap);
        self.scene.background = envMap.texture;
        const material = new Three.MeshPhysicalMaterial({
          map: colorMap,
          normalMap: normalMap,
          roughnessMap: roughnessMap,
          roughness: roughnessValue,
          aoMap: aoMap,
          displacementMap: displacementMap,
          metalnessMap: metalMap,
          metalness: metalnessValue,
          envMap: envMap.texture,
        });
        const cube = new Three.Mesh(geometry, material);
        cube.geometry.attributes.uv2 = cube.geometry.attributes.uv;
        cube.rotation.set(0.2, -0.7, 2.8);

        self.mesh = cube;
        self.scene.add(cube, light);
        container.appendChild(self.renderer.domElement);
        self.renderer.render(self.scene, self.camera);
        self.controls = new OrbitControls(
          self.camera,
          self.renderer.domElement
        );
        self.animate();
      });
    },
    animate() {
      requestAnimationFrame(this.animate);
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    },
  },
  mounted() {
    this.clicked();
    //this.animate();
  },
};
</script>

<style scoped>
#container {
  overflow-y: visible;
}
#canvas {
  width: 40vw!important;
  height: 500px;
}
</style>