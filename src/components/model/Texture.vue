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
          @click="loadTexture"
          alt=""
        />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import * as Three from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
export default {
  data() {
    return {
      loading: false,
      shouldLoad: true,
      loadingComplete: false,
      logo: require("@/assets/lilienstein_4k.hdr"),
      camera: null,
      scene: null,
      renderer: null,
      mesh: null,
      controls: null,
      color: null,
      normal: null,
      bump: null,
      disp: null,
      ao: null,
      metal: null,
      rough: null,
      gui: null,
      params: {
        color: 0xffffff,
        transmission: 0,
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
        displacementScale: 0.1,
        wireframe: false,
      },
    };
  },
  props: ["modelId", "category"],
  methods: {
    ...mapGetters(["getToken"]),
    loadTexture: function () {
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
      fetch(
        process.env.VUE_APP_BACKEND_SERVICE_URL +
          "texture/" +
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
          const textureLoader = new Three.TextureLoader();

          if (blob.code == 200) {
            let message = blob.message;
            message.forEach((element) => {
              let filename =
                element.headers["content-disposition"][0].split("=")[1];

              if (filename.includes("COL")) {
                this.color = textureLoader.load(element.file);
              } else if (filename.includes("AO")) {
                this.ao = textureLoader.load(element.file);
              } else if (filename.includes("DISP")) {
                this.disp = textureLoader.load(element.file);
              } else if (filename.includes("NRM")) {
                this.normal = textureLoader.load(element.file);
              } else if (filename.includes("BUMP")) {
                this.bump = textureLoader.load(element.file);
              } else if (
                filename.includes("ROUGH") ||
                filename.includes("GLOSS")
              ) {
                this.rough = textureLoader.load(element.file);
              } else if (filename.includes("METAL")) {
                this.metal = textureLoader.load(element.file);
              }
            });
            this.init();
          } else {
            console.log(blob.message);
          }
        });
    },
    init: function () {
      let container = document.getElementById("canvas");

      this.camera = new Three.PerspectiveCamera(
        90,
        container.clientWidth / container.clientHeight,
        0.01,
        20
      );
      this.camera.position.z = 12;
      // const light = new Three.DirectionalLight(0xffffff, 3);

      // light.position.set(10, 10, 15);
      this.scene = new Three.Scene();
      this.scene.background = new Three.Color("#575454");
      this.gui = new GUI({
        container: document.getElementById("canvasWrapper"),
        touchStyles: false,
      });
      const gui = this.gui;
      gui.domElement.id = "gui";
      gui.domElement.style.position = "absolute";
      gui.domElement.style.top = "0";
      gui.close();
      //const lightFolder = gui.addFolder("Light");
      let self = this;

      const geometry = new Three.SphereGeometry(4, 1024, 1024);

      self.renderer = new Three.WebGLRenderer({ antialias: true });
      self.renderer.outputEncoding = Three.sRGBEncoding;
      self.renderer.toneMapping = Three.ACESFilmicToneMapping;
      self.renderer.toneMappingExposure = 1.25;
      self.renderer.setSize(container.clientWidth, container.clientHeight);
      self.renderer.setPixelRatio(window.devicePixelRatio);
      self.renderer.physicallyCorrectLights = true;
      //let envmapLoader = new Three.PMREMGenerator(self.renderer);
      new RGBELoader().load(this.logo, function (hdrMap) {
        hdrMap.mapping = Three.EquirectangularReflectionMapping;
        let envMapPMREM = new Three.PMREMGenerator(
          self.renderer
        ).fromEquirectangular(hdrMap).texture;
        envMapPMREM.mapping = Three.CubeUVReflectionMapping;
        self.scene.background = envMapPMREM;
        const material = new Three.MeshPhysicalMaterial({
          map: self.color,
          normalMap: self.normal,
          bumpMap: self.bump,
          roughnessMap: self.rough,
          aoMap: self.ao,
          displacementMap: self.disp,
          metalnessMap: self.metal,
          envMap: hdrMap,
          displacementScale: self.params.displacementScale,
        });
        const sphere = new Three.Mesh(geometry, material);
        sphere.geometry.attributes.uv2 = sphere.geometry.attributes.uv;
        sphere.rotation.set(0.2, -0.7, 2.8);

        self.mesh = sphere;
        console.log(self.mesh.material);
        self.scene.add(self.mesh); //, light
        container.appendChild(self.renderer.domElement);
        self.renderer.render(self.scene, self.camera);
        self.controls = new OrbitControls(
          self.camera,
          self.renderer.domElement
        );
        self.animate();
        // lightFolder
        //   .add(self.params, "lightIntensity", 0, 10, 0.01)
        //   .onChange(function () {
        //     light.intensity = self.params.lightIntensity;
        //   });
        const meshFolder = gui.addFolder("Properties");
        meshFolder.addColor(self.params, "color").onChange(function () {
          self.mesh.material.color.set(self.params.color);
        });
        meshFolder
          .add(self.params, "transmission", 0, 1, 0.01)
          .onChange(function () {
            self.mesh.material.transmission = self.params.transmission;
          });
        meshFolder
          .add(self.params, "opacity", 0, 1, 0.01)
          .onChange(function () {
            self.mesh.material.opacity = self.params.opacity;
          });

        meshFolder
          .add(self.params, "metalness", 0, 1, 0.01)
          .onChange(function () {
            self.mesh.material.metalness = self.params.metalness;
          });

        meshFolder
          .add(self.params, "roughness", 0, 1, 0.01)
          .onChange(function () {
            self.mesh.material.roughness = self.params.roughness;
          });

        meshFolder.add(self.params, "ior", 1, 2, 0.01).onChange(function () {
          self.mesh.material.ior = self.params.ior;
        });

        meshFolder
          .add(self.params, "thickness", 0, 5, 0.01)
          .onChange(function () {
            self.mesh.material.thickness = self.params.thickness;
          });

        meshFolder
          .add(self.params, "specularIntensity", 0, 1, 0.01)
          .onChange(function () {
            self.mesh.material.specularIntensity =
              self.params.specularIntensity;
          });

        meshFolder.addColor(self.params, "specularColor").onChange(function () {
          self.mesh.material.specularColor.set(self.params.specularColor);
        });

        meshFolder
          .add(self.params, "envMapIntensity", 0, 1, 0.01)
          .name("envMap intensity")
          .onChange(function () {
            self.mesh.material.envMapIntensity = self.params.envMapIntensity;
          });
        meshFolder
          .add(self.params, "displacementScale", 0, 1, 0.01)
          .onChange(function (value) {
            self.mesh.material.displacementScale = value;
          });
        meshFolder.add(self.params, "wireframe");
        meshFolder
          .add(self.params, "exposure", 0, 1, 0.01)
          .onChange(function () {
            self.renderer.toneMappingExposure = self.params.exposure;
          });
      });
      self.loading = false;
      self.loadingComplete = true;
    },
    animate() {
      let container = document.getElementById("canvas");
      this.renderer.setSize(container.clientWidth, container.clientHeight);
      requestAnimationFrame(this.animate);
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    },
  },
  mounted() {},
};
</script>

<style scoped lang="scss">
.v-progress-circular {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
}
#canvas {
  width: 100% !important;
  height: 100%;
  aspect-ratio: 1.15;
  background: #333333;
  position: relative;
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
      transition: transform 0.2s ease-in;
      &:hover {
        cursor: pointer;
        transform: scale(1.5);
      }
    }
  }
  canvas {
    width: 100%;
    height: 100%;
  }
}

#canvasWrapper {
  position: relative;
 
}
.bg-color {
  padding: 20px;
  background: #333333;
}
</style>