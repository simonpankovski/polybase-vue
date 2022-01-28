<template>
  <div id="container"></div>
</template>

<script>
import { mapGetters } from "vuex";
import * as Three from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
export default {
  data() {
    return {
      camera: null,
      scene: null,
      renderer: null,
      mesh: null,
      controls: null,
      file: "",
    };
  },
  props: ["modelData"],
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
      fetch("http://localhost:8000/api/texture/5", {
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
          console.log(blob.message)
          if (blob.code == 200) {
            let message = blob.message
            this.init(message[1].file, message[5].file, message[4].file, message[3].file);
            this.animate();
          } else {
            console.log(blob.message);
          }
        });
    },
    init: function (color, normal, roughness, height) {
      let container = document.getElementById("container");

      //const loader = new FBXLoader();
      this.camera = new Three.PerspectiveCamera(
        70,
        container.clientWidth / container.clientHeight,
        0.01,
        20
      );
      this.camera.position.z = 12;
      const light = new Three.HemisphereLight(0xffffff, 0x080820, 6);

      // move the light right, up, and towards us
      light.position.set(10, 10, 15);
      this.scene = new Three.Scene();
      this.scene.background = new Three.Color("#575454");

      const geometry = new Three.SphereGeometry(4, 64, 64);
      const textureLoader = new Three.TextureLoader();
      let colorMap = textureLoader.load(color);
      let normalMap = textureLoader.load(normal);
      let displacementMap = textureLoader.load(height);
      let roughnessMap = textureLoader.load(roughness);
      let self = this;
      const material = new Three.MeshStandardMaterial({
        map: colorMap,
        normalMap: normalMap,
        roughnessMap: roughnessMap,
        roughness: 0.1,
        displacementMap: displacementMap,
        //aoMap: ao
      });
      // create a Mesh containing the geometry and material
      const cube = new Three.Mesh(geometry, material);
      cube.rotation.set(0.2, -0.7, 2.8);
      //cube.geometry.attributes.uv2 = cube.geometry.attributes.uv
      // add the mesh to the scene
      self.mesh = cube;
      self.scene.add(cube, light);

      self.renderer = new Three.WebGLRenderer({ antialias: true });
      self.renderer.setSize(container.clientWidth, container.clientHeight);
      self.renderer.setPixelRatio(window.devicePixelRatio);
      self.renderer.physicallyCorrectLights = true;
      container.appendChild(self.renderer.domElement);
      self.renderer.render(self.scene, self.camera);
      self.controls = new OrbitControls(self.camera, self.renderer.domElement);
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
  width: 500px;
  height: 500px;
}
</style>