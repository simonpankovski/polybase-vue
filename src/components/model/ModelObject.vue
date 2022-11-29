<template>
  <div id="canvasWrapper" class="heightHundred">
    <div id="canvas">
      <div class="play" v-if="!loadingComplete">
        <v-progress-circular
          indeterminate
          color="orange"
          :size="100"
          v-if="loading"
        ></v-progress-circular>
        <img
          v-if="shouldLoad"
          src="../../assets/play.png"
          @click="loadModel"
          alt=""
        />
      </div>
    </div>
    <div class="mt-5">
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
      loading: false,
      shouldLoad: true,
      loadingComplete: false,
      camera: null,
      scene: null,
      renderer: null,
      mesh: null,
      controls: null,
      file: "",
      color: null,
      normal: null,
      bump: null,
      disp: null,
      ao: null,
      metal: null,
      rough: null,
      transmission: null,
      isGlass: false,
      isMetal: false,
      hdr: require("@/assets/studio_small_08_4k.hdr"),
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
        envMapIntensity: 0.5,
        lightIntensity: 1,
        exposure: 1,
        displacementScale: 0.1,
      },
    };
  },
  props: ["modelData", "modelId"],
  methods: {
    ...mapGetters(["getToken"]),
    loadModel: function () {
      this.loading = true;
      this.shouldLoad = false;
      this.clicked();
    },
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
      // const light = new Three.DirectionalLight(
      //   0xffffff,
      //   this.params.lightIntensity
      // );
      // light.position.set(10, 10, 150);
      this.scene = new Three.Scene();
      this.scene.background = new Three.Color(0x1e1e1e);
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
      new RGBELoader().load(hdr, function (hdrMap) {
        hdrMap.mapping = Three.EquirectangularReflectionMapping;
        let envMapPMREM = new Three.PMREMGenerator(
          self.renderer
        ).fromEquirectangular(hdrMap).texture;
        envMapPMREM.mapping = Three.CubeUVReflectionMapping;
        //self.scene.background = envMapPMREM;
        console.log(self.ao);
        loader.load(blob, function (object) {
          self.gui = new GUI({
            container: document.getElementById("canvasWrapper"),
            touchStyles: false,
          });
          const gui = self.gui;
          gui.domElement.id = "gui";
          gui.domElement.style.position = "absolute";
          gui.domElement.style.top = "0";

          //const lightFolder = gui.addFolder("Light");
          // lightFolder
          //   .add(self.params, "lightIntensity", 0, 10, 0.01)
          //   .onChange(function () {
          //     light.intensity = self.params.lightIntensity;
          //   });
          let index = 1;
          object.traverse(function (child) {
            if (child instanceof Three.Mesh) {
              let data = textures;
              data.forEach((element) => {
                let filename =
                  element.headers["content-disposition"][0].split("=")[1];
                if (filename.includes("COL")) {
                  self.color = textureLoader.load(element.file);
                } else if (filename.includes("AO")) {
                  self.ao = textureLoader.load(element.file);
                } else if (filename.includes("DISP")) {
                  self.disp = textureLoader.load(element.file);
                } else if (filename.includes("NRM")) {
                  self.normal = textureLoader.load(element.file);
                } else if (filename.includes("BUMP")) {
                  self.bump = textureLoader.load(element.file);
                } else if (
                  filename.includes("ROUGH") ||
                  filename.includes("GLOSS")
                ) {
                  self.rough = textureLoader.load(element.file);
                } else if (filename.includes("METAL")) {
                  self.metal = textureLoader.load(element.file);
                  self.isMetal = true;
                } else if (filename.includes("TRANS")) {
                  self.transmission = textureLoader.load(element.file);
                  self.isGlass = true;
                }
              });

              const material = new Three.MeshPhysicalMaterial({
                map: self.color,
                envMap: hdrMap,
                normalMap: self.normal,
                roughnessMap: self.rough,
                transmissionMap: self.transmission,
                metalnessMap: self.metal,
                bumpMap: self.bump,
                aoMap: self.ao,
                displacementScale: self.params.displacementScale,
              });

              child.material = material;
              if (self.ao) {
                console.log(child);
                child.geometry.attributes.uv2 = child.geometry.attributes.uv;
              }
              const meshFolder = gui.addFolder("Mesh " + index++);

              meshFolder.addColor(self.params, "color").onChange(function () {
                child.material.color.set(self.params.color);
              });
              meshFolder
                .add(self.params, "transmission", 0, 1, 0.01)
                .onChange(function () {
                  child.material.transmission = self.params.transmission;
                });

              meshFolder
                .add(self.params, "opacity", 0, 1, 0.01)
                .onChange(function (value) {
                  child.material.opacity = value;
                });

              meshFolder
                .add(self.params, "metalness", 0, 1, 0.01)
                .onChange(function () {
                  child.material.metalness = self.params.metalness;
                });

              meshFolder
                .add(self.params, "roughness", 0, 1, 0.01)
                .onChange(function () {
                  child.material.roughness = self.params.roughness;
                });

              meshFolder
                .add(self.params, "ior", 1, 2, 0.01)
                .onChange(function (value) {
                  child.material.ior = value;
                });

              meshFolder
                .add(self.params, "thickness", 0, 5, 0.01)
                .onChange(function () {
                  child.material.thickness = self.params.thickness;
                });

              meshFolder
                .add(self.params, "specularIntensity", 0, 1, 0.01)
                .onChange(function () {
                  child.material.specularIntensity =
                    self.params.specularIntensity;
                });

              meshFolder
                .addColor(self.params, "specularColor")
                .onChange(function () {
                  child.material.specularColor.set(self.params.specularColor);
                });

              meshFolder
                .add(self.params, "envMapIntensity", 0, 1, 0.01)
                .name("envMap intensity")
                .onChange(function () {
                  child.material.envMapIntensity = self.params.envMapIntensity;
                });

              meshFolder
                .add(self.params, "exposure", 0, 1, 0.01)
                .onChange(function () {
                  self.renderer.toneMappingExposure = self.params.exposure;
                });
              meshFolder
                .add(self.params, "displacementScale", 0, 1, 0.01)
                .onChange(function (value) {
                  child.material.displacementScale = value;
                });
            }
          });

          self.gui.close();
          self.scene.add(object); // ,light

          self.mesh = object;
        });
      });
      container.appendChild(this.renderer.domElement);
      this.renderer.render(this.scene, this.camera);

      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      self.loading = false;
      self.loadingComplete = true;
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
    console.log(this);
  },
  beforeDestroy() {
    this.gui = null;
  },
};
</script>
<style lang="scss">
#canvas {
  width: 100% !important;
  max-height: 600px !important;
  aspect-ratio: 1.15;
  background: #333333;
  position: relative;
  //border: thin solid rgba(255, 255, 255, 0.12);
  box-shadow: rgba(100, 100, 111, 0.15) 0px 7px 29px 0px;
  & .play {
    position: relative;
    width: 100%;
    height: 100%;
    background-color: #333333;
    display: flex;
    justify-content: center;
    align-items: center;
    & img {
      width: 50px;
      height: 50px;
      filter: hue-rotate(262deg);
      &:hover {
        cursor: pointer;
        animation-name: playAnim;
        animation-duration: 0.2s;
        animation-timing-function: ease-in;
        animation-fill-mode: both;
        animation-direction: alternate;
      }
    }
  }
  canvas {
    height: 100% !important;
    width: 100%;
  }
}
@keyframes playAnim {
  @for $i from 0 through 100 {
    #{$i * 5%} {
      filter: hue-rotate(#{($i * -4deg) + 262deg});
    }
  }
}
#canvasWrapper {
  position: relative;
  height: 100% !important;
}

.v-progress-circular {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>