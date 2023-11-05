<template>
  <div id="container" />
</template>

<script>
import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Water } from "three/examples/jsm/objects/Water.js";
import { Sky } from "three/examples/jsm/objects/Sky.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export default {
  async mounted() {
    let shimScript = document.createElement("script");
    shimScript.setAttribute(
      "src",
      "https://unpkg.com/es-module-shims@1.3.6/dist/es-module-shims.js"
    );
    shimScript.setAttribute("defer", "defer");
    document.head.appendChild(shimScript);

    let polyFillScript = document.createElement("script");
    polyFillScript.setAttribute(
      "src",
      "https://polyfill.io/v3/polyfill.min.js?features=default"
    );
    document.head.appendChild(polyFillScript);

    const vertexShader = `
        uniform mat4 textureMatrix;
            uniform float time;

            varying vec4 mirrorCoord;
            varying vec4 worldPosition;

            #include <common>
            #include <fog_pars_vertex>
            #include <shadowmap_pars_vertex>
            #include <logdepthbuf_pars_vertex>

            uniform vec4 waveA;
            uniform vec4 waveB;
            uniform vec4 waveC;

            vec3 GerstnerWave (vec4 wave, vec3 p) {
            	float steepness = wave.z;
            	float wavelength = wave.w;
            	float k = 2.0 * PI / wavelength;
            	float c = sqrt(9.8 / k);
            	vec2 d = normalize(wave.xy);
            	float f = k * (dot(d, p.xy) - c * time);
            	float a = steepness / k;

            	return vec3(
            		d.x * (a * cos(f)),
            		d.y * (a * cos(f)),
            		a * sin(f)
            	);
            }

            void main() {
            	mirrorCoord = modelMatrix * vec4( position, 1.0 );
            	worldPosition = mirrorCoord.xyzw;
            	mirrorCoord = textureMatrix * mirrorCoord;
							vec4 mvPosition =  modelViewMatrix * vec4( position, 1.0 );
              
            	vec3 p = position.xyz;
            	p += GerstnerWave(waveA, position.xyz);
            	p += GerstnerWave(waveB, position.xyz);
            	p += GerstnerWave(waveC, position.xyz);
            	gl_Position = projectionMatrix * modelViewMatrix * vec4( p.x, p.y, p.z, 1.0);

            	#include <beginnormal_vertex>
            	#include <defaultnormal_vertex>
            	#include <logdepthbuf_vertex>
            	#include <fog_vertex>
            	#include <shadowmap_vertex>
            }
`;
    const fragmentShader = `
        uniform sampler2D mirrorSampler;
            uniform float alpha;
            uniform float time;
            uniform float size;
            uniform float distortionScale;
            uniform sampler2D normalSampler;
            uniform vec3 sunColor;
            uniform vec3 sunDirection;
            uniform vec3 eye;
            uniform vec3 waterColor;

            varying vec4 mirrorCoord;
            varying vec4 worldPosition;

            vec4 getNoise( vec2 uv ) {
                vec2 uv0 = ( uv / 103.0 ) + vec2(time / 17.0, time / 29.0);
                vec2 uv1 = uv / 107.0-vec2( time / -19.0, time / 31.0 );
                vec2 uv2 = uv / vec2( 8907.0, 9803.0 ) + vec2( time / 101.0, time / 97.0 );
                vec2 uv3 = uv / vec2( 1091.0, 1027.0 ) - vec2( time / 109.0, time / -113.0 );
                vec4 noise = texture2D( normalSampler, uv0 ) +
                    texture2D( normalSampler, uv1 ) +
                    texture2D( normalSampler, uv2 ) +
                    texture2D( normalSampler, uv3 );
                return noise * 0.5 - 1.0;
            }

            void sunLight( const vec3 surfaceNormal, const vec3 eyeDirection, float shiny, float spec, float diffuse, inout vec3 diffuseColor, inout vec3 specularColor ) {
                vec3 reflection = normalize( reflect( -sunDirection, surfaceNormal ) );
                float direction = max( 0.0, dot( eyeDirection, reflection ) );
                specularColor += pow( direction, shiny ) * sunColor * spec;
                diffuseColor += max( dot( sunDirection, surfaceNormal ), 0.0 ) * sunColor * diffuse;
            }

            #include <common>
            #include <packing>
            #include <bsdfs>
            #include <fog_pars_fragment>
            #include <logdepthbuf_pars_fragment>
            #include <lights_pars_begin>
            #include <shadowmap_pars_fragment>
            #include <shadowmask_pars_fragment>

            void main() {

                #include <logdepthbuf_fragment>
                vec4 noise = getNoise( worldPosition.xz * size );
                vec3 surfaceNormal = normalize( noise.xzy * vec3( 1.5, 1.0, 1.5 ) );

                vec3 diffuseLight = vec3(0.0);
                vec3 specularLight = vec3(0.0);

                vec3 worldToEye = eye-worldPosition.xyz;
                vec3 eyeDirection = normalize( worldToEye );
                sunLight( surfaceNormal, eyeDirection, 100.0, 2.0, 0.5, diffuseLight, specularLight );

                float distance = length(worldToEye);

                vec2 distortion = surfaceNormal.xz * ( 0.001 + 1.0 / distance ) * distortionScale;
                vec3 reflectionSample = vec3( texture2D( mirrorSampler, mirrorCoord.xy / mirrorCoord.w + distortion ) );

                float theta = max( dot( eyeDirection, surfaceNormal ), 0.0 );
                float rf0 = 0.3;
                float reflectance = rf0 + ( 1.0 - rf0 ) * pow( ( 1.0 - theta ), 5.0 );
                vec3 scatter = max( 0.0, dot( surfaceNormal, eyeDirection ) ) * waterColor;
                vec3 albedo = mix( ( sunColor * diffuseLight * 0.3 + scatter ) * getShadowMask(), ( vec3( 0.1 ) + reflectionSample * 0.9 + reflectionSample * specularLight ), reflectance);
                vec3 outgoingLight = albedo;
                gl_FragColor = vec4( outgoingLight, alpha );

                #include <tonemapping_fragment>
                #include <fog_fragment>
            }
        `;
    const createShader = (text, id, type) => {
      const tag = document.createElement("script");
      tag.setAttribute("id", id);
      tag.setAttribute("type", type);
      const tnode = document.createTextNode(text);
      tag.appendChild(tnode);

      document.head.appendChild(tag);
      return tag.textContent;
    };

    createShader(vertexShader, "vertexShader", "x-shader/x-vertex");
    createShader(fragmentShader, "fragmentShader", "x-shader/x-fragment");

    let container, stats;
    let camera, scene, renderer;
    let controls, water, sun;
    let clock, delta, boxes, numBoxes;
    let waves;
    if (localStorage.getItem("waves")) {
      waves = JSON.parse(localStorage.getItem("waves"));
    } else {
      waves = {
        A: { direction: 359, steepness: 0.4, wavelength: 60 },
        B: { direction: 90, steepness: 0.4, wavelength: 30 },
        C: { direction: 90, steepness: 0.4, wavelength: 15 },
      };
    }
    const loader = new GLTFLoader();

    class Boat {
      constructor() {
        loader.load("assets/boat/scene.gltf", (gltf) => {
          scene.add(gltf.scene);
          gltf.scene.scale.set(3, 3, 3);
          gltf.scene.position.set(-50, 13, 40);
          gltf.scene.rotation.y = 1.5;

          this.boat = gltf.scene;
          this.speed = {
            vel: 0,
            rot: 0,
          };
        });
      }
    }

    const boat = new Boat();

    class Whale {
      constructor() {
        loader.load("assets/whale/whale.gltf", (gltf) => {
          scene.add(gltf.scene);
          gltf.scene.scale.set(15, 9, 10);
          gltf.scene.position.set(-5, 1, 5);
          gltf.scene.rotation.y = 3.5;

          this.boat = gltf.scene;
          this.speed = {
            vel: 0,
            rot: 0,
          };
        });
      }
    }

    const whale = new Whale();

    function getWaveInfo(x, z, time) {
      const pos = new THREE.Vector3();
      const tangent = new THREE.Vector3(1, 0, 0);
      const binormal = new THREE.Vector3(0, 0, 1);
      Object.keys(waves).forEach((wave) => {
        const w = waves[wave];
        const k = (Math.PI * 2) / w.wavelength;
        const c = Math.sqrt(9.8 / k);
        const d = new THREE.Vector2(
          Math.sin((w.direction * Math.PI) / 180),
          -Math.cos((w.direction * Math.PI) / 180)
        );
        const f = k * (d.dot(new THREE.Vector2(x, z)) - c * time);
        const a = w.steepness / k;

        pos.x += d.y * (a * Math.cos(f));
        pos.y += a * Math.sin(f);
        pos.z += d.x * (a * Math.cos(f));

        tangent.x += -d.x * d.x * (w.steepness * Math.sin(f));
        tangent.y += d.x * (w.steepness * Math.cos(f));
        tangent.z += -d.x * d.y * (w.steepness * Math.sin(f));

        binormal.x += -d.x * d.y * (w.steepness * Math.sin(f));
        binormal.y += d.y * (w.steepness * Math.cos(f));
        binormal.z += -d.y * d.y * (w.steepness * Math.sin(f));
      });

      const normal = binormal.cross(tangent).normalize();

      return { position: pos, normal: normal };
    }

    function updateBoxes(delta) {
      const t = water.material.uniforms["time"].value;
      boxes.forEach((b) => {
        const waveInfo = getWaveInfo(b.position.x, b.position.z, t);
        b.position.y = waveInfo.position.y;
        const quat = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(
            waveInfo.normal.x,
            waveInfo.normal.y,
            waveInfo.normal.z
          )
        );
        b.quaternion.rotateTowards(quat, delta * 0.5);
      });
    }

    init();
    animate();

    function init() {
      container = document.getElementById("container");

      //

      renderer = new THREE.WebGLRenderer();
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      container.appendChild(renderer.domElement);

      //

      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(
        55,
        window.innerWidth / window.innerHeight,
        1,
        20000
      );
      camera.position.set(30, 30, 100);

      //

      sun = new THREE.Vector3();

      // floating boxes
      const boxGeometry = new THREE.BoxGeometry(10, 10, 10);
      numBoxes = 10;
      boxes = [];

      for (let i = 0; i < numBoxes; i++) {
        const box = new THREE.Mesh(
          boxGeometry,
          new THREE.MeshStandardMaterial({ roughness: 0 })
        );
        box.position.set(
          Math.random() * 200 - 100,
          0,
          Math.random() * 200 - 100
        );
        scene.add(box);
        boxes.push(box);
      }

      // Water

      const waterGeometry = new THREE.PlaneGeometry(2048, 2048, 512, 512);

      water = new Water(waterGeometry, {
        textureWidth: 512,
        textureHeight: 512,
        waterNormals: new THREE.TextureLoader().load(
          "/assets/textures/waternormals.jpg",
          function (texture) {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
          }
        ),
        sunDirection: new THREE.Vector3(),
        sunColor: 0xffffff,
        waterColor: 0x001e0f,
        distortionScale: 9,
        fog: scene.fog !== undefined,
      });
      water.rotation.x = -Math.PI / 2;

      water.material.onBeforeCompile = function (shader) {
        shader.uniforms.waveA = {
          value: [
            Math.sin((waves.A.direction * Math.PI) / 180),
            Math.cos((waves.A.direction * Math.PI) / 180),
            waves.A.steepness,
            waves.A.wavelength,
          ],
        };
        shader.uniforms.waveB = {
          value: [
            Math.sin((waves.B.direction * Math.PI) / 180),
            Math.cos((waves.B.direction * Math.PI) / 180),
            waves.B.steepness,
            waves.B.wavelength,
          ],
        };
        shader.uniforms.waveC = {
          value: [
            Math.sin((waves.C.direction * Math.PI) / 180),
            Math.cos((waves.C.direction * Math.PI) / 180),
            waves.C.steepness,
            waves.C.wavelength,
          ],
        };
        shader.vertexShader =
          document.getElementById("vertexShader").textContent;
        shader.fragmentShader =
          document.getElementById("fragmentShader").textContent;
      };

      scene.add(water);

      // Skybox

      const sky = new Sky();
      sky.scale.setScalar(10000);
      scene.add(sky);

      const skyUniforms = sky.material.uniforms;

      skyUniforms["turbidity"].value = 10;
      skyUniforms["rayleigh"].value = 2;
      skyUniforms["mieCoefficient"].value = 0.005;
      skyUniforms["mieDirectionalG"].value = 0.8;

      const parameters = {
        elevation: 2,
        azimuth: 180,
      };

      const pmremGenerator = new THREE.PMREMGenerator(renderer);

      function updateSun() {
        const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
        const theta = THREE.MathUtils.degToRad(parameters.azimuth);

        sun.setFromSphericalCoords(1, phi, theta);

        sky.material.uniforms["sunPosition"].value.copy(sun);
        water.material.uniforms["sunDirection"].value.copy(sun).normalize();

        scene.environment = pmremGenerator.fromScene(sky).texture;
      }

      updateSun();

      //

      controls = new OrbitControls(camera, renderer.domElement);
      controls.maxPolarAngle = Math.PI * 0.495;
      controls.target.set(0, 10, 0);
      controls.minDistance = 40.0;
      controls.maxDistance = 200.0;
      controls.update();

      //

      stats = new Stats();
      container.appendChild(stats.dom);

      const gui = new GUI();

      const folderSky = gui.addFolder("Sky");
      folderSky.add(parameters, "elevation", 0, 90, 0.1).onChange(updateSun);
      folderSky.add(parameters, "azimuth", -180, 180, 0.1).onChange(updateSun);
      folderSky.open();

      const waterUniforms = water.material.uniforms;

      const folderWater = gui.addFolder("Water");
      folderWater
        .add(waterUniforms.distortionScale, "value", 0, 8, 0.1)
        .name("distortionScale");
      folderWater.add(waterUniforms.size, "value", 0.1, 10, 0.1).name("size");
      folderWater.add(water.material, "wireframe");
      folderWater.open();

      const waveAFolder = gui.addFolder("Wave A");
      waveAFolder
        .add(waves.A, "direction", 0, 359)
        .name("Direction")
        .onChange((v) => {
          const x = (v * Math.PI) / 180;
          water.material.uniforms.waveA.value[0] = Math.sin(x);
          water.material.uniforms.waveA.value[1] = Math.cos(x);
        });
      waveAFolder
        .add(waves.A, "steepness", 0, 1, 0.1)
        .name("Steepness")
        .onChange((v) => {
          water.material.uniforms.waveA.value[2] = v;
        });
      waveAFolder
        .add(waves.A, "wavelength", 1, 100)
        .name("Wavelength")
        .onChange((v) => {
          water.material.uniforms.waveA.value[3] = v;
        });
      waveAFolder.open();

      const waveBFolder = gui.addFolder("Wave B");
      waveBFolder
        .add(waves.B, "direction", 0, 359)
        .name("Direction")
        .onChange((v) => {
          const x = (v * Math.PI) / 180;
          water.material.uniforms.waveB.value[0] = Math.sin(x);
          water.material.uniforms.waveB.value[1] = Math.cos(x);
        });
      waveBFolder
        .add(waves.B, "steepness", 0, 1, 0.1)
        .name("Steepness")
        .onChange((v) => {
          water.material.uniforms.waveB.value[2] = v;
        });
      waveBFolder
        .add(waves.B, "wavelength", 1, 100)
        .name("Wavelength")
        .onChange((v) => {
          water.material.uniforms.waveB.value[3] = v;
        });
      waveBFolder.open();

      const waveCFolder = gui.addFolder("Wave C");
      waveCFolder
        .add(waves.C, "direction", 0, 359)
        .name("Direction")
        .onChange((v) => {
          const x = (v * Math.PI) / 180;
          water.material.uniforms.waveC.value[0] = Math.sin(x);
          water.material.uniforms.waveC.value[1] = Math.cos(x);
        });
      waveCFolder
        .add(waves.C, "steepness", 0, 1, 0.1)
        .name("Steepness")
        .onChange((v) => {
          water.material.uniforms.waveC.value[2] = v;
        });
      waveCFolder
        .add(waves.C, "wavelength", 1, 100)
        .name("Wavelength")
        .onChange((v) => {
          water.material.uniforms.waveC.value[3] = v;
        });
      waveCFolder.open();

      window.addEventListener("resize", onWindowResize);

      clock = new THREE.Clock();
    }

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function animate() {
      requestAnimationFrame(animate);
      delta = clock.getDelta();
      water.material.uniforms["time"].value += delta;
      updateBoxes(delta);
      render();
      stats.update();
    }

    function render() {
      renderer.render(scene, camera);
    }
  },
};
</script>
