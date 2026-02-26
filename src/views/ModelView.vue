<script setup>
import { ref, onMounted } from 'vue'
import { Thermometer, Droplet, Wind, Users, Zap, Volume2, Sun } from 'lucide-vue-next'
import * as THREE from 'three'
import { MTLLoader } from 'three/addons/loaders/MTLLoader'
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js'

const modal = ref({
  visible: false,
  roomName: '',
  roomUrl: '',
  availableData: [],
  x: 0,
  y: 0,
  showBelow: false
})

const roomMap = {
  'ST_0.38': 'http://localhost:5173/ST_0.38',
  'ST_0.34': 'http://localhost:5173/ST_0.34',
  'ST_0.30': 'http://localhost:5173/ST_0.30',
  'ST_0.26': 'http://localhost:5173/ST_0.26',
  'ST_0.23': 'http://localhost:5173/ST_0.23',
  'ST_0.22': 'http://localhost:5173/ST_0.22',
  'ST_0.18': 'http://localhost:5173/ST_0.18',
  'ST_0.17': 'http://localhost:5173/ST_0.17',
  'ST_0.10': 'http://localhost:5173/ST_0.10'
}

const roomData = {
  'ST_0.38': ['temp', 'humidity', 'energy'],
  'ST_0.34': ['temp', 'humidity', 'energy'],
  'ST_0.30': ['temp', 'humidity', 'energy'],
  'ST_0.26': ['temp', 'humidity', 'co2', 'energy'],
  'ST_0.23': ['temp', 'humidity', 'co2'],
  'ST_0.22': ['temp', 'humidity', 'energy'],
  'ST_0.17': ['temp', 'humidity'],
  'ST_0.18': ['temp', 'humidity', 'co2', 'occupation', 'energy', 'sound', 'light'],
  'ST_0.10': ['temp', 'humidity', 'co2', 'occupation', 'sound', 'light']
}

const dataIcons = {
  temp: { icon: Thermometer, label: 'Temperature' },
  humidity: { icon: Droplet, label: 'Humidity' },
  co2: { icon: Wind, label: 'CO2' },
  occupation: { icon: Users, label: 'Occupation' },
  energy: { icon: Zap, label: 'Energy' },
  sound: { icon: Volume2, label: 'Sound' },
  light: { icon: Sun, label: 'Light' }
}

function toScreenPosition(object, camera) {
  const box = new THREE.Box3().setFromObject(object)
  const center = new THREE.Vector3()
  box.getCenter(center)

  center.project(camera)

  const x = (center.x * 0.5 + 0.5) * window.innerWidth
  const y = (-center.y * 0.5 + 0.5) * window.innerHeight

  const modalHeight = 300
  const showBelow = y < modalHeight

  return { x, y, showBelow }
}

function openRoom() {
  window.open(modal.value.roomUrl)
  modal.value.visible = false
}

function closeModal() {
  modal.value.visible = false
}

onMounted(() => {
  const container = document.getElementById('container')
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xb8bcc2)

  const raycaster = new THREE.Raycaster()
  const mouse = new THREE.Vector2()

  // Load 3D model
  const mtlLoader = new MTLLoader()
  mtlLoader.load('src/assets/testroom/betermodel.mtl', (materials) => {
    materials.preload()
    const objLoader = new OBJLoader()
    objLoader.setMaterials(materials)
    objLoader.load('src/assets/testroom/betermodel.obj', (object) => {
      var box = new THREE.Box3().setFromObject(object)
      var boundingBoxSize = box.max.sub(box.min)
      var height = boundingBoxSize.y
      object.position.y = -height / 2
      scene.add(object)
    })
  })

  // Camera
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100)
  camera.position.set(0, 15, 15)

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  container.appendChild(renderer.domElement)

  // Composer
  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))

  const outline = new OutlinePass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    scene,
    camera
  )
  outline.edgeThickness = 2.0
  outline.edgeStrength = 3.0
  outline.visibleEdgeColor.set(0xffffff)
  composer.addPass(outline)

  // Controls
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.minDistance = 10
  controls.maxDistance = 15
  controls.minPolarAngle = Math.PI / 6
  controls.maxPolarAngle = Math.PI / 2
  controls.target.set(0, 0, 0)
  controls.update()

  controls.addEventListener('start', () => {
    modal.value.visible = false
  })

  // Lights
  scene.add(new THREE.DirectionalLight(0xffffff, 2))
  scene.add(new THREE.AmbientLight(0xffffff, 1.5))

  // Highlight
  let INTERSECTED = null
  const selectedObjects = []

  function intersection() {
    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObjects(scene.children, true)

    if (intersects.length > 0 && intersects[0].object.type === 'Mesh') {
      INTERSECTED = intersects[0].object
      selectedObjects.length = 0
      selectedObjects.push(INTERSECTED)
      outline.selectedObjects = selectedObjects

      renderer.domElement.style.cursor = roomMap[INTERSECTED.name] ? 'pointer' : 'default'
    } else {
      INTERSECTED = null
      selectedObjects.length = 0
      outline.selectedObjects = []
      renderer.domElement.style.cursor = 'default'
    }
  }

  // Click handler
  function onClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObjects(scene.children, true)

    if (intersects.length > 0) {
      const clickedRoom = intersects[0].object.name
      if (roomMap[clickedRoom]) {
        const pos = toScreenPosition(intersects[0].object, camera)
        modal.value.x = pos.x
        modal.value.y = pos.y
        modal.value.showBelow = pos.showBelow
        modal.value.roomName = `Room ${clickedRoom.replace('ST_', '')}`
        modal.value.roomUrl = roomMap[clickedRoom]
        modal.value.availableData = roomData[clickedRoom] || []
        console.log('clickedName:', clickedRoom)
        console.log('availableData:', modal.value.availableData)
        modal.value.visible = true
      }
    }
  }

  function mouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    intersection()
  }

  // Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    composer.setSize(window.innerWidth, window.innerHeight)
  })

  renderer.domElement.addEventListener('click', onClick)
  renderer.domElement.addEventListener('mousemove', mouseMove)

  // Animate
  function animate() {
    requestAnimationFrame(animate)
    controls.update()
    composer.render()
  }

  animate()
})
</script>

<template>
  <div id="wrapper">
    <div class="overlay">
      <img src="/src/assets/EiT_logo.png" alt="EiT logo" class="logo" />
      <h2>EiT_dashboard</h2>
      <span class="version">version 1.1.1</span>
    </div>

    <div id="container"></div>

    <div
      v-if="modal.visible"
      class="modal"
      :style="{
        left: modal.x + 'px',
        top: modal.y + 'px',
        transform: modal.showBelow ? 'translate(-50%, 16px)' : 'translate(-50%, calc(-100% - 16px))'}"
    >
      <h2>{{ modal.roomName }}</h2>
      <p>Available data:</p>
      <div class="data-badges">
        <div
          v-for="(value, type) in dataIcons"
          :key="type"
          class="badge"
          :class="modal.availableData.includes(type) ? 'badge-available' : 'badge-unavailable'"
        >
          <component :is="value.icon" :size="14" />
          <span>{{ value.label }}</span>
        </div>
      </div>
      <p>View the roomdata in PowerBI</p>
      <div class="modal-buttons">
        <button @click="closeModal">Close</button>
        <button @click="openRoom">To PowerBI →</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
#wrapper {
  position: relative;
  width: 100vw;
  height: 100vh;
}

.overlay {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
  pointer-events: none;
  color: white;
  font-family: sans-serif;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
}

.logo {
  width: 100px;
  margin-bottom: 8px;
}

.modal {
  position: fixed;
  transform: translate(-50%, calc(-100% - 16px));
  background: #181a1b;
  color: white;
  border-radius: 12px;
  padding: 24px;
  min-width: 220px;
  font-family: sans-serif;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  z-index: 100;
}

.modal-buttons {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.modal-buttons button:last-child {
  background: #2563eb;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}

.modal-buttons button:first-child {
  background: transparent;
  color: white;
  border: 1px solid #ccc;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}

.data-badges {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.badge {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.badge-available {
  background: #064425;
  color: #329059;
}

.badge-unavailable {
  background: #430202;
  color: #df3421;
}
</style>
