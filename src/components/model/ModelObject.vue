<template>
  <div>
    <div id="container">CON</div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import * as Three from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
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
      fetch("http://localhost:8000/api/model/2", {
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
          this.init(blob.file);
          this.animate();
        });
    },
    init: function (blob) {
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
      let self = this;
      // create a Mesh containing the geometry and material
      const loader = new FBXLoader();
      loader.setResourcePath( 'http://localhost:8000/api/models/textures/2' );
      loader.load(
        blob,
        function (object) {
          self.scene.add(object, light);
          self.mesh = object;
        },
        
      );
      this.renderer = new Three.WebGLRenderer({ antialias: true });
      this.renderer.setSize(container.clientWidth, container.clientHeight);
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.physicallyCorrectLights = true;
      container.appendChild(this.renderer.domElement);
      this.renderer.render(this.scene, this.camera);
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    },
    animate() {
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
<style scoped>
#container {
  width: 500px;
  height: 500px;
}
</style>