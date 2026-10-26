
import * as THREE from "three";
import vertexShader from "../sonar/shaders/sonar.vert.glsl?raw";
import fragmentShader from "../sonar/shaders/sonar.frag.glsl?raw";

const MAX_PULSES = 5;

export function createSonarMaterial() {
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uPulseOrigins: {
        value: Array.from(
          { length: MAX_PULSES },
          () => new THREE.Vector3()
        ),
      },
      uPulseRadii: { value: new Array(MAX_PULSES).fill(0) },
      uPulseAges: { value: new Array(MAX_PULSES).fill(0) },
      uPulseCount: { value: 0 },

      uBandWidth: { value: 1.25 },
      uFadeDuration: { value: 1.4 },
      uPulseSpeed: { value: 16.0 },
      uMaxRadius: { value: 18.0 },

      uSurfaceColor: { value: new THREE.Color(0xb8bfba) },
      uWaveColor: { value: new THREE.Color(0xe3e7e1) },
    },
    transparent: false,
    side: THREE.DoubleSide,
  });

  return material;
}

export function syncPulses(material, activePulses, config) {
  if (!material?.uniforms) return;

  const uniforms = material.uniforms;
  const pulses = activePulses ?? [];
  const count = Math.min(pulses.length, MAX_PULSES);

  uniforms.uPulseCount.value = count;

  for (let i = 0; i < MAX_PULSES; i++) {
    if (i < count) {
      const pulse = pulses[i];

      uniforms.uPulseOrigins.value[i].copy(pulse.origin);
      uniforms.uPulseRadii.value[i] = pulse.elapsed * config.speed;
      uniforms.uPulseAges.value[i] = pulse.elapsed;
    } else {
      uniforms.uPulseOrigins.value[i].set(0, 0, 0);
      uniforms.uPulseRadii.value[i] = 0;
      uniforms.uPulseAges.value[i] = 0;
    }
  }
}

// import * as THREE from "three";
// import vertexShader from "../sonar/shaders/sonar.vert.glsl?raw";
// import fragmentShader from "../sonar/shaders/sonar.frag.glsl?raw";

// const MAX_PULSES = 3;

// export function createSonarMaterial() {
//   const material = new THREE.ShaderMaterial({
//     vertexShader,
//     fragmentShader,
//     uniforms: {
//       uPulseOrigins: { value: new Array(MAX_PULSES).fill(new THREE.Vector3()) },
//       uPulseRadii: { value: new Array(MAX_PULSES).fill(0) },
//       uPulseAges: { value: new Array(MAX_PULSES).fill(0) },
//       uPulseCount: { value: 0 },

//       uBandWidth: { value: 1.25 },
//       uFadeDuration: { value: 1.4 },
//       uPulseSpeed: { value: 16.0 },
//       uMaxRadius: { value: 18.0 },

//       uSurfaceColor: { value: new THREE.Color(0xb8bfba) },
//       uWaveColor: { value: new THREE.Color(0xe3e7e1) },
//     },
//     transparent: false,
//     side: THREE.DoubleSide,
//   });

//   return material;
// }

// export function syncPulses(material, activePulses, config) {
//   const uniforms = material.uniforms;
//   const count = Math.min(activePulses.length, MAX_PULSES);

//   uniforms.uPulseCount.value = count;

//   for (let i = 0; i < MAX_PULSES; i++) {
//     if (i < count) {
//       const pulse = activePulses[i];
//       uniforms.uPulseOrigins[i].value.copy(pulse.origin);
//       uniforms.uPulseRadii[i].value = pulse.elapsed * config.speed;
//       uniforms.uPulseAges[i].value = pulse.elapsed;
//     } else {
//       uniforms.uPulseOrigins[i].value.set(0, 0, 0);
//       uniforms.uPulseRadii[i].value = 0;
//       uniforms.uPulseAges[i].value = 0;
//     }
//   }
// }