<template>
  <div class="heightHundred">
    <v-progress-circular
      indeterminate
      color="orange"
      :size="100"
      v-if="loading"
    ></v-progress-circular>
    <div id="canvas" class="heightHundred"></div>
    <div class="mt-5">
      <v-simple-table class="bg-color">
        <template v-slot:default>
          <tbody>
            <tr>
              <td>Model Size</td>
              <td>{{ modelSize }} MB</td>
            </tr>
            <tr>
              <td>Texture Sizes</td>
              <td>{{ textureSizes }} MB</td>
            </tr>
            <tr>
              <td>Total Size (Uncompressed)</td>
              <td>{{ Math.round((modelSize + textureSizes) * 100) / 100 }} MB</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import * as Three from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
export default {
  data() {
    return {
      loading: true,
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
      isGlass: false,
      isMetal: false,
      hdr: require("@/assets/studio_country_hall_1k.hdr"),
      modelSize: 0,
      textureSizes: 0,
    };
  },
  props: ["modelData", "modelId"],
  methods: {
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
      console.log(token);
      fetch(
        "http://localhost:8000/api/model/" + this.modelId + "?browse=true",
        {
          method: "GET",
          mode: "cors",
          headers: {
            Authorization: token,
            "Access-Control-Allow-Origin": "*",
          },
        }
      )
        .then((res) => {
          return res.json();
        })
        .then((blob) => {
          let modelToRender = null;
          let textures = [];
          blob[0].forEach((element) => {
            console.log(element);
            if (
              element.headers["content-disposition"][0]
                .split("=")[1].toLowerCase()
                .includes(".fbx")
            ) {
              modelToRender = element.file;
            } else {
              textures.push(element);
            }
          });

          if (modelToRender != null) {
            this.init(modelToRender, textures, token, blob[1]);
            this.animate();
          }
        });
    },
    init: function (blob, textures) {
      this.loading = false;
      const modelSize = Buffer.from(blob.substring(blob.indexOf(",") + 1));

      this.modelSize = Math.round((modelSize.length / 1e6 / 1.33) * 100) / 100;
      let textureSize = 0;
      textures.forEach((element) => {
        let currentSize = Buffer.from(
          element.file.substring(element.file.indexOf(",") + 1)
        );
        textureSize += currentSize;
      });
      this.textureSizes =
        Math.round((textureSize.length / 1e6 / 1.33) * 100) / 100;
      let container = document.getElementById("canvas");
      const loader = new FBXLoader();
      this.camera = new Three.PerspectiveCamera(
        70,
        container.clientWidth / container.clientHeight,
        0.01,
        1000
      );
      this.camera.position.z = 4;
      this.camera.position.x = 100;
      const light = new Three.DirectionalLight(0xffffff, 2);
      light.position.set(10, 10, 15);
      this.scene = new Three.Scene();
      this.scene.background = new Three.Color("#575454");
      let self = this;
      let hdr = this.hdr;
      const textureLoader = new Three.TextureLoader();
      this.renderer = new Three.WebGLRenderer({ antialias: true });
      this.renderer.outputEncoding = Three.sRGBEncoding;
      this.renderer.toneMapping = Three.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.25;
      this.renderer.setSize(container.clientWidth, container.clientHeight);
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.physicallyCorrectLights = true;
      loader.load(blob, function (object) {
        object.traverse(function (child) {
          if (child instanceof Three.Mesh) {
            let data = textures;
            data.forEach((element) => {
              let filename =
                element.headers["content-disposition"][0].split("=")[1];
              if (filename.includes("COL")) {
                self.color = element.file;
              } else if (filename.includes("AO")) {
                self.ao = element.file;
              } else if (filename.includes("DISP")) {
                self.disp = element.file;
              } else if (filename.includes("NRM")) {
                self.normal = element.file;
              } else if (
                filename.includes("ROUGH") ||
                filename.includes("GLOSS")
              ) {
                self.rough = element.file;
              } else if (filename.includes("METAL")) {
                self.metal = element.file;
                self.isMetal = true;
              } else if (
                filename.includes("TRANS") ||
                filename.includes("SSS")
              ) {
                self.transmission = element.file;
                if (filename.includes("TRANS")) self.isGlass = true;
              }
            });
            let envmapLoader = new Three.PMREMGenerator(self.renderer);
            let colorMap = textureLoader.load(self.color);
            let roughnessMap = textureLoader.load(self.rough);
            let normalMap = textureLoader.load(self.normal);
            let aoMap = textureLoader.load(self.ao);
            let transmissionMap = textureLoader.load(self.transmission);

            new RGBELoader().load(hdr, function (hdrMap) {
              let envMap = envmapLoader.fromCubemap(hdrMap);
              let en = Three.EquirectangularReflectionMapping;
              self.scene.background = envMap.texture;

              const material = new Three.MeshPhysicalMaterial({
                map: colorMap,
                envMap: en,
                normalMap: normalMap,
                roughnessMap: roughnessMap,
                transmissionMap,
                aoMap,
                opacity: 1,
              });

              if (self.isGlass) {
                material.roughness = 0;
                material.metalness = 0;
                material.transmission = 1;
                material.thickness = 0.02;
                material.ior = 2;
              } else if (self.metal) {
                material.metalness = 1;
                material.roughness = 0;
                material.ior = 1.5;
              }
              if (self.ao != null)
                child.geometry.attributes.uv2 = child.geometry.attributes.uv;
              child.material = material;
            });
          }
        });

        self.scene.add(object, light);
        self.mesh = object;
      });
      container.appendChild(this.renderer.domElement);
      this.renderer.render(this.scene, this.camera);
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    },
    animate() {
      let container = document.getElementById("canvas");
      this.renderer.setSize(container.clientWidth, container.clientHeight);
      requestAnimationFrame(this.animate);
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    },
  },
  mounted() {
    console.log(this.modelData);
    this.clicked();
  },
};
</script>
<style scoped lang="scss">
#canvas {
  width: 100% !important;
  canvas {
    width: 80%;
  }
}
.heightHundred {
  height: 80%;
  position: relative;
}
.bg-color {
  background: #333333 !important;
  padding: 20px;
}
.v-progress-circular {
  position: absolute;
  top: 30%;
  left: 40%;
}
</style>