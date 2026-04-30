// shader.js — WebGL shader background, blue-tinted to match brand
import * as THREE from "three";

const canvas = document.getElementById("shader-canvas");
if (canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(new THREE.Color(0x050813));

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, -1);

  // Hero size — match the hero section, not the full window.
  const hero = canvas.parentElement;
  const sizeOf = () => ({
    w: hero?.clientWidth || window.innerWidth,
    h: hero?.clientHeight || window.innerHeight,
  });

  const uniforms = {
    resolution: { value: [1, 1] },
    time: { value: 0.0 },
    xScale: { value: 1.1 },
    yScale: { value: 0.42 },
    distortion: { value: 0.06 },
  };

  const vertexShader = /* glsl */ `
    attribute vec3 position;
    void main() {
      gl_Position = vec4(position, 1.0);
    }
  `;

  // Re-tinted: subtle chromatic offset, but the dominant channel is blue,
  // so the wave reads as electric-blue ribbons against deep navy.
  const fragmentShader = /* glsl */ `
    precision highp float;
    uniform vec2 resolution;
    uniform float time;
    uniform float xScale;
    uniform float yScale;
    uniform float distortion;

    void main() {
      vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);

      float d = length(p) * distortion;

      float rx = p.x * (1.0 + d);
      float gx = p.x;
      float bx = p.x * (1.0 - d);

      // Heavily blue-weighted intensity per channel
      float r = 0.012 / abs(p.y + sin((rx + time) * xScale) * yScale);
      float g = 0.038 / abs(p.y + sin((gx + time) * xScale) * yScale);
      float b = 0.095 / abs(p.y + sin((bx + time) * xScale) * yScale);

      // Tint shift: pull whites toward electric blue, blacks toward navy
      vec3 col = vec3(r, g, b);
      col = mix(col, col * vec3(0.45, 0.85, 1.4), 0.35);

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  const positions = new Float32Array([
    -1.0, -1.0, 0.0,
    1.0, -1.0, 0.0,
    -1.0,  1.0, 0.0,
    1.0, -1.0, 0.0,
    -1.0,  1.0, 0.0,
    1.0,  1.0, 0.0,
  ]);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.RawShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  const resize = () => {
    const { w, h } = sizeOf();
    renderer.setSize(w, h, false);
    uniforms.resolution.value = [w, h];
  };
  resize();
  window.addEventListener("resize", resize);

  // Pause animation when hero is offscreen — saves battery.
  let isVisible = true;
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => (isVisible = e.isIntersecting));
        },
        { rootMargin: "0px" }
    );
    io.observe(canvas.parentElement);
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const animate = () => {
    if (isVisible && !reduceMotion) {
      uniforms.time.value += 0.008;
      renderer.render(scene, camera);
    } else if (!reduceMotion) {
      // keep ticking time slowly so it doesn't freeze when scrolling back
      uniforms.time.value += 0.001;
    } else {
      // single render for reduced motion
      renderer.render(scene, camera);
    }
    requestAnimationFrame(animate);
  };
  animate();
}
