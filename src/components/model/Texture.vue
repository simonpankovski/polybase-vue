<template>
  <div id="canvasWrapper" class="heightHundred">
    <div id="canvas"></div>
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
      logo: require("@/assets/lilienstein_4k.hdr"),
      camera: null,
      scene: null,
      renderer: null,
      mesh: null,
      controls: null,
      file: "",
      color: null,
      normal: null,
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
      },
    };
  },
  props: ["modelId", "category"],
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
          if (blob.code == 200) {
            let message = blob.message;
            message.forEach((element) => {
              let filename =
                element.headers["content-disposition"][0].split("=")[1];
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
                filename.includes("GLOSS")
              ) {
                this.rough = element.file;
              } else if (filename.includes("METAL")) {
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

      this.camera = new Three.PerspectiveCamera(
        70,
        container.clientWidth / container.clientHeight,
        0.01,
        20
      );
      this.camera.position.z = 12;
      const light = new Three.DirectionalLight(0xffffff, 3);

      light.position.set(10, 10, 15);
      this.scene = new Three.Scene();
      this.scene.background = new Three.Color("#575454");
      this.gui = new GUI({
        container: document.getElementById("canvasWrapper"),
      });
      const gui = this.gui;
      gui.domElement.id = "gui";
      gui.domElement.style.position = "absolute";
      gui.domElement.style.top = "0";
      const lightFolder = gui.addFolder("Light");
      let self = this;

      const geometry = new Three.SphereGeometry(4, 1024, 1024);
      const textureLoader = new Three.TextureLoader();
      let colorMap = textureLoader.load(this.color);
      let normalMap = textureLoader.load(this.normal);
      let displacementMap = textureLoader.load(this.disp);
      let roughnessMap = textureLoader.load(this.roughness);
      let aoMap = textureLoader.load(this.ao);
      let metalMap = textureLoader.load(this.metal);
      self.renderer = new Three.WebGLRenderer({ antialias: true });
      self.renderer.outputEncoding = Three.sRGBEncoding;
      self.renderer.toneMapping = Three.ACESFilmicToneMapping;
      self.renderer.toneMappingExposure = 1.25;
      self.renderer.setSize(container.clientWidth, container.clientHeight);
      self.renderer.setPixelRatio(window.devicePixelRatio);
      self.renderer.physicallyCorrectLights = true;
      //let roughnessValue = self.roughness * 0.01;
      //let dispValue = self.dispScale * 0.01;
      let envmapLoader = new Three.PMREMGenerator(self.renderer);
      new RGBELoader().load(this.logo, function (hdrMap) {
        let envMap = envmapLoader.fromCubemap(hdrMap);
        self.scene.background = envMap.texture;
        const material = new Three.MeshPhysicalMaterial({
          map: colorMap,
          normalMap: normalMap,
          roughnessMap: roughnessMap,
          roughness: self.params.roughness,
          aoMap: aoMap,
          displacementMap: displacementMap,
          // displacementScale: dispValue,
          metalnessMap: metalMap,
          metalness: self.params.metalness,
          envMap: envMap.texture,
        });
        const sphere = new Three.Mesh(geometry, material);
        sphere.geometry.attributes.uv2 = sphere.geometry.attributes.uv;
        sphere.rotation.set(0.2, -0.7, 2.8);

        self.mesh = sphere;

        self.scene.add(self.mesh, light);
        container.appendChild(self.renderer.domElement);
        self.renderer.render(self.scene, self.camera);
        self.controls = new OrbitControls(
          self.camera,
          self.renderer.domElement
        );
        self.animate();
        lightFolder
          .add(self.params, "lightIntensity", 0, 10, 0.01)
          .onChange(function () {
            light.intensity = self.params.lightIntensity;
          });
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
          .add(self.params, "exposure", 0, 1, 0.01)
          .onChange(function () {
            self.renderer.toneMappingExposure = self.params.exposure;
          });
      });
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
    this.clicked();
  },
};
</script>

<style scoped lang="scss">
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
.bg-color {
  padding: 20px;
  background: #333333;
}
</style>