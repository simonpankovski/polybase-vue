<template>
  <div id="wrapper" class="heightHundred">
    <v-progress-circular
      indeterminate
      color="orange"
      :size="100"
      v-if="loading"
    ></v-progress-circular>
    <div id="canvasWrapper" class="heightHundred">
      <div id="canvas"></div>
    </div>

    <div class="mt-15">
      <v-simple-table>
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
              <td>
                {{ Math.round((modelSize + textureSizes) * 100) / 100 }} MB
              </td>
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
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
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
      gui: null,
      params: {
        color: 0xffffff,
        transmission: 1,
        opacity: 1,
        metalness: 0,
        roughness: 0,
        ior: 1.5,
        thickness: 0.01,
        specularIntensity: 1,
        specularColor: 0xffffff,
        envMapIntensity: 1,
        lightIntensity: 1,
        exposure: 1,
      },
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
        process.env.VUE_APP_BACKEND_SERVICE_URL +
          "model/" +
          this.modelId +
          "?browse=true",
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
            if (
              element.headers["content-disposition"][0]
                .split("=")[1]
                .toLowerCase()
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
        90,
        container.clientWidth / container.clientHeight,
        0.01,
        1000
      );
      this.camera.position.z = 0;
      this.camera.position.x = 10;
      this.camera.position.y = 40;
      const light = new Three.DirectionalLight(
        0xffffff,
        this.params.lightIntensity
      );
      light.position.set(10, 10, 150);
      this.scene = new Three.Scene();
      this.scene.background = new Three.Color(0xffffff);
      let self = this;
      let hdr = this.hdr;
      const textureLoader = new Three.TextureLoader();
      this.renderer = new Three.WebGLRenderer({ antialias: true });
      this.renderer.outputEncoding = Three.sRGBEncoding;
      this.renderer.toneMapping = Three.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1;
      this.renderer.setSize(container.clientWidth, container.clientHeight);
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.physicallyCorrectLights = true;
      this.renderer.shadowMap.enabled = true;
      loader.load(blob, function (object) {
        console.log(object);
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
              } else if (filename.includes("TRANS")) {
                self.transmission = element.file;
                self.isGlass = true;
              }
            });
            let colorMap = textureLoader.load(self.color);
            let roughnessMap = textureLoader.load(self.rough);
            let normalMap = textureLoader.load(self.normal);
            let aoMap = textureLoader.load(self.ao);
            let transmissionMap = textureLoader.load(self.transmission);

            new RGBELoader().load(hdr, function (hdrMap) {
              hdrMap.mapping = Three.EquirectangularReflectionMapping;
              self.scene.background = hdrMap;

              const material = new Three.MeshPhysicalMaterial({
                map: colorMap,
                envMap: hdrMap,
                envMapIntensity: 1,
                normalMap: normalMap,
                roughnessMap: roughnessMap,
                roughness: self.params.roughness,
                specularColor: 0xffffff,
                specularIntensity: self.params.specularIntensity,
                transmissionMap,
                transmission: self.params.transmission,
                aoMap,
                opacity: self.params.opacity,
                ior: self.params.ior,
              });

              child.material = material;
            });
          }
        });
        if (self.aoMap) {
          object.attributes.uv2 = object.attributes.uv;
        }
        self.gui = new GUI({
          container: document.getElementById("canvasWrapper"),
        });
        const gui = self.gui;
        gui.domElement.id = "gui";
        // console.log(gui)
        // container.appendChild(gui.domElement)
        gui.domElement.style.position = "absolute";
        gui.domElement.style.top = "0";
        const lightFolder = gui.addFolder("Light");
        lightFolder
          .add(self.params, "lightIntensity", 0, 10, 0.01)
          .onChange(function () {
            light.intensity = self.params.lightIntensity;
          });
        object.children.forEach((element, index) => {
          const meshFolder = gui.addFolder("Mesh " + (index + 1));

          meshFolder.addColor(self.params, "color").onChange(function () {
            element.material.color.set(self.params.color);
          });
          meshFolder
            .add(self.params, "transmission", 0, 1, 0.01)
            .onChange(function () {
              element.material.transmission = self.params.transmission;
            });

          meshFolder
            .add(self.params, "opacity", 0, 1, 0.01)
            .onChange(function () {
              element.material.opacity = self.params.opacity;
            });

          meshFolder
            .add(self.params, "metalness", 0, 1, 0.01)
            .onChange(function () {
              element.material.metalness = self.params.metalness;
            });

          meshFolder
            .add(self.params, "roughness", 0, 1, 0.01)
            .onChange(function () {
              element.material.roughness = self.params.roughness;
            });

          meshFolder.add(self.params, "ior", 1, 2, 0.01).onChange(function () {
            element.material.ior = self.params.ior;
          });

          meshFolder
            .add(self.params, "thickness", 0, 5, 0.01)
            .onChange(function () {
              element.material.thickness = self.params.thickness;
            });

          meshFolder
            .add(self.params, "specularIntensity", 0, 1, 0.01)
            .onChange(function () {
              element.material.specularIntensity =
                self.params.specularIntensity;
            });

          meshFolder
            .addColor(self.params, "specularColor")
            .onChange(function () {
              element.material.specularColor.set(self.params.specularColor);
            });

          meshFolder
            .add(self.params, "envMapIntensity", 0, 1, 0.01)
            .name("envMap intensity")
            .onChange(function () {
              element.material.envMapIntensity = self.params.envMapIntensity;
            });

          meshFolder
            .add(self.params, "exposure", 0, 1, 0.01)
            .onChange(function () {
              self.renderer.toneMappingExposure = self.params.exposure;
            });
        });

        self.gui.close();
        self.scene.add(object, light);

        self.mesh = object;
      });
      container.appendChild(this.renderer.domElement);
      this.renderer.render(this.scene, this.camera);
      this.loading = false;
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    },
    animate() {
      let container = document.getElementById("canvas");
      if (container === null) return;
      this.renderer.setSize(container.clientWidth, container.clientHeight);
      requestAnimationFrame(this.animate);
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    },
    render() {
      this.renderer.render(this.scene, this.camera);
    },
    onWindowResize() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(width, height);
    },
  },
  mounted() {
    this.clicked();
  },
  beforeDestroy() {
    this.gui.destroy();
    this.gui = null;
  },
};
</script>
<style lang="scss">
#canvas {
  width: 100% !important;
  height: 100% !important;

  canvas {
    width: 80%;
  }
}

#canvasWrapper {
  position: relative;
}

.heightHundred {
  height: 80%;
}

.bg-color {
  background: #333333 !important;
  padding: 20px;
}

.v-progress-circular {
  position: absolute;
  top: 25%;
  right: 25%;
}

#gui.root .title {
  font-size: inherit !important;
  line-height: 21px !important;
}
</style>