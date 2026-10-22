import * as THREE from "three";
import { GAME_CONFIG } from "../config/gameConfig.js";

export class Renderer {
  constructor(canvas) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(
      GAME_CONFIG.rendering.background
    );

    this.camera = new THREE.PerspectiveCamera(
      GAME_CONFIG.camera.fov,
      window.innerWidth / window.innerHeight,
      GAME_CONFIG.camera.near,
      GAME_CONFIG.camera.far
    );

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance"
    });

    this.renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio,
        GAME_CONFIG.rendering.maxPixelRatio
      )
    );

    this.renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.resize = this.resize.bind(this);
    window.addEventListener("resize", this.resize);
  }

  resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    window.removeEventListener("resize", this.resize);
    this.renderer.dispose();
  }
}