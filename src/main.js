import "./style.css";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { RGBShiftShader } from "three/examples/jsm/shaders/RGBShiftShader";
import Lenis from "lenis";
import gsap from "gsap";

const lenis = new Lenis();

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#canvas"),
  antialias: true,
  alpha: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;

// Add HDR Environment
let model;
const rgbeLoader = new RGBELoader();
rgbeLoader.load(
  "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/pond_bridge_night_1k.hdr",
  (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;

    const loader = new GLTFLoader();
    loader.load("/public/DamagedHelmet.gltf", (gltf) => {
      model = gltf.scene;
      scene.add(model);
    });
  }
);

// Set up the camera position
camera.position.z = 2;

// Post-Processing Setup
const composer = new EffectComposer(renderer);

// Add the render pass (renders the scene normally)
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// Add the RGBShift pass
const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.uniforms["amount"].value = 0.0035; // Adjust the intensity of the effect
composer.addPass(rgbShiftPass);

window.addEventListener("mousemove", (e) => {
  if (model) {
    const rotationX = ((e.clientX / window.innerWidth - 0.5) * Math.PI) / 5;
    const rotationY = ((e.clientY / window.innerHeight - 0.5) * Math.PI) / 5;
    gsap.to(model.rotation, {
      y: rotationX,
      x: rotationY,
      duration: 1,
      ease: "power4",
    });
  }
});

gsap.from("nav a,nav img, nav button", {
  y: -100,
  stagger: 0.1,
  opacity: 0,
  duration: 1,
  ease: "power4",
  delay: 1,
});
gsap.from(".hero img", {
  y: 300,
  opacity: 0,
  duration: 1,
  ease: "power4",
  delay: 1,
});

gsap.from(".hero canvas", {
  y: 300,
  scale: 0,
  opacity: 0,
  duration: 1,
  ease: "power4",
  delay: 1.8,
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});
function animate() {
  composer.render();

  window.requestAnimationFrame(animate);
}

animate();
