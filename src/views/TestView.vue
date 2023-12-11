<template>
  <div ref="webglRef"></div>
</template>
<script lang="ts" setup>
import { onBeforeMount, onMounted, ref } from 'vue';
import * as THREE from 'three';
const webglRef = ref(null);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
onMounted(() => {
  render3DScene();
});
const render3DScene = () => {
  // AxesHelper：辅助观察的坐标系
  const axesHelper = new THREE.AxesHelper(150);
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  webglRef.value.appendChild(renderer.domElement);

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00,transparent:true,//开启透明
    opacity:0.5,});
  const cube = new THREE.Mesh(geometry, material);
  cube.position.set(3,0,0);
  scene.add(cube);
  scene.add(axesHelper);

  camera.position.z = 5;
  function animate() {
    requestAnimationFrame(animate);

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    renderer.render(scene, camera);
  }

  animate();
};
</script>
