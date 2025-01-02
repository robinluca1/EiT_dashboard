<template>
  <div id="container"></div>
  <!-- <v-container id="container"></v-container> -->
</template>

<script>
import * as THREE from 'three'
import { MTLLoader } from 'three/addons/loaders/MTLLoader'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'
import { MapControls } from 'three/examples/jsm/controls/MapControls'
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";

export default {
  data() {
    return {}
  },
  mounted() {
    this.init()
  },
  methods: {
    init: function () {
      const container = document.getElementById('container')
      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0xb8bcc2)
      const mtlLoader = new MTLLoader()
      const raycaster = new THREE.Raycaster()
      const mouse = new THREE.Vector2()

      mtlLoader.load('src/assets/testroom/betermodel.mtl', (materials) => {
        materials.preload()
        const objLoader = new OBJLoader()
        objLoader.setMaterials(materials)
        objLoader.load('src/assets/testroom/betermodel.obj', (object) => {
          //object.geometry.center();
          var box = new THREE.Box3().setFromObject(object)
          var boundingBoxSize = box.max.sub(box.min)
          var height = boundingBoxSize.y
          object.position.y = -height / 2
          scene.add(object)
        })
      })

      // Camera
      const camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        100
      )

      camera.position.set(0, 11, 0)
      camera.up.set(0, 0, -1)
      camera.lookAt(0, 0, 0)

      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true })

      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio))
      renderer.outputEncoding = THREE.sRGBEncoding
      container.appendChild(renderer.domElement)

      // Highlight
      const outline = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
      outline.edgeThickness = 2.0;
      outline.edgeStrength = 3.0;
      outline.visibleEdgeColor.set(0xffffff);
      
      const composer = new EffectComposer(renderer);
      composer.addPass(outline);

      let INTERSECTED;
      const selectedObjects = [];

      function addselectedObjects(object) {
        if (selectedObjects.length > 0 ) {
          selectedObjects.pop();
        }
        selectedObjects.push(object);
      }
      
      // Responsive
      window.addEventListener('resize', onWindowResize, false)
      renderer.domElement.addEventListener('click', onClick, false)
      renderer.domElement.addEventListener("mousemove", mouseMove);
      

      function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()

        renderer.setSize(window.innerWidth, window.innerHeight)
      }

      // Controls
      const controls = new MapControls(camera, renderer.domElement)
      controls.enableDamping = true

      controls.screenSpacePanning = false
      controls.minDistance = 10
      controls.maxDistance = 15
      
      // Intersection
      function intersection() {
        raycaster.setFromCamera(mouse, camera)
        var intersects1 = raycaster.intersectObjects(scene.children, false);

        if (intersects1.length > 0 ) {
          if ( INTERSECTED != intersects1[0].object && intersects1[0].object.type === "Mesh" ) {

            INTERSECTED = intersects1[0].object;
            addselectedObjects(INTERSECTED);
            outline.selectedObjects = selectedObjects;
          }
        } else {
          INTERSECTED = null;
        }
      }

      // Raycaster
      function onClick(event) {
        var object1 = 'ST_0.38'
        var object2 = 'ST_0.34'
        var object3 = 'ST_0.30'
        var object4 = 'ST_0.26'
        var object5 = 'ST_0.22'
        var object6 = 'ST_0.17'
        var object7 = 'ST_0.23'
        var object8 = 'ST_0.10'
        var object9 = 'ST_0.18'
        event.preventDefault()

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

        raycaster.setFromCamera(mouse, camera)
        var intersects = raycaster.intersectObjects(scene.children, true)

        if (intersects.length > 0) {
          // for ( let i = 0; i < intersects.length; i ++ ) {
          //   intersects[i].object.material.color.set(Math.random() * 0xff0000 );
          // }
          if (intersects[0].object.name === object1) {window.open('http://localhost:5173/ST_0.38')}
          if (intersects[0].object.name === object2) {window.open('http://localhost:5173/ST_0.34')}
          if (intersects[0].object.name === object3) {window.open('http://localhost:5173/ST_0.30')}
          if (intersects[0].object.name === object4) {window.open('http://localhost:5173/ST_0.26')}
          if (intersects[0].object.name === object5) {window.open('http://localhost:5173/ST_0.22')}
          if (intersects[0].object.name === object6) {window.open('http://localhost:5173/ST_0.17')}
          if (intersects[0].object.name === object7) {window.open('http://localhost:5173/ST_0.23')}
          if (intersects[0].object.name === object8) {window.open('http://localhost:5173/ST_0.10')}
          if (intersects[0].object.name === object9) {window.open('http://localhost:5173/ST_0.18')}
        }
      }

      // OnSelectHighlight
      function mouseMove(event) {
        event.preventDefault();
        mouse.x = (event.clientx / event.clientY) * 2 - 1;
        mouse.y -(event.clientY / window.innerHeight) * 2 + 1

        intersection();
        composer.render();
      }
      
      // Lights
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
      directionalLight.position.set(10, 10, 10)
      scene.add(directionalLight)

      const ambientLight = new THREE.AmbientLight(0xffffff, 1)
      scene.add(ambientLight)

      const animate = function () {
        requestAnimationFrame(animate)
        controls.update()
        renderer.render(scene, camera)
      }

      animate()
    }
  }
}
</script>
