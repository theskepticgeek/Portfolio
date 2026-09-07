"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * StarryNightAnimated
 *
 * Real-time Van Gogh Starry Night animation using ONE still image.
 * The original composition remains the texture itself; the shader only
 * applies subtle, region-aware motion to the brush flow and light halos.
 *
 * Required asset:
 *   public/starry-night-base.jpg
 *
 * Usage:
 *   <StarryNightAnimated className="portfolio-starry-bg" />
 */
export default function StarryNightAnimated({
  className = "",
  intensity = 1.4,
  speed = 2,
}) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(mount.clientWidth, mount.clientHeight, false);
    renderer.setClearColor(0x020617, 1);

    if ("outputEncoding" in renderer && THREE.sRGBEncoding) {
      renderer.outputEncoding = THREE.sRGBEncoding;
    }

    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    renderer.domElement.style.pointerEvents = "none";

    mount.appendChild(renderer.domElement);

    const loader = new THREE.TextureLoader();
    const texture = loader.load("/starry-night-base.jpg");

    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;

    if ("encoding" in texture && THREE.sRGBEncoding) {
      texture.encoding = THREE.sRGBEncoding;
    }

    const uniforms = {
      uTexture: { value: texture },
      uTime: { value: 0 },
      uResolution: {
        value: new THREE.Vector2(
          Math.max(1, mount.clientWidth),
          Math.max(1, mount.clientHeight)
        ),
      },
      uImageResolution: { value: new THREE.Vector2(1280, 720) },
      uIntensity: { value: intensity },
      uSpeed: { value: speed },
    };

    const vertexShader = `
      precision highp float;

      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `;

    const fragmentShader = `
      precision highp float;

      uniform sampler2D uTexture;
      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec2 uImageResolution;
      uniform float uIntensity;
      uniform float uSpeed;

      varying vec2 vUv;

      #define PI 3.141592653589793
      #define TAU 6.283185307179586

      // ------------------------------------------------------------
      // COVER UV
      // Keeps the artwork proportional when used as a fullscreen bg.
      // ------------------------------------------------------------
      vec2 coverUv(vec2 uv) {
        float screenAspect = uResolution.x / max(uResolution.y, 1.0);
        float imageAspect =
          uImageResolution.x / max(uImageResolution.y, 1.0);

        vec2 result = uv;

        if (screenAspect > imageAspect) {
          float scale = imageAspect / screenAspect;
          result.y = (uv.y - 0.5) * scale + 0.5;
        } else {
          float scale = screenAspect / imageAspect;
          result.x = (uv.x - 0.5) * scale + 0.5;
        }

        return result;
      }

      float gaussian(vec2 p, vec2 center, vec2 radius) {
        vec2 d = (p - center) / radius;
        return exp(-dot(d, d) * 2.15);
      }

      // Tangential flow around a swirl center.
      vec2 vortex(
        vec2 uv,
        vec2 center,
        float radius,
        float amount,
        float phase
      ) {
        vec2 d = uv - center;
        float r = length(d);

        float influence =
          exp(-(r * r) / max(radius * radius, 0.00001));

        vec2 tangent =
          vec2(-d.y, d.x) / max(r, 0.002);

        // Alternating brush-current motion.
        float current =
          sin(phase + r * 31.0) * 0.55 +
          sin(phase * 0.63 - r * 17.0) * 0.45;

        return tangent * influence * current * amount;
      }

      float starPulse(
        vec2 uv,
        vec2 center,
        float radius,
        float phase,
        float t
      ) {
        float d = length((uv - center) / vec2(1.0, 1.78));
        float core = exp(-pow(d / radius, 2.0) * 4.0);
        float pulse = 0.5 + 0.5 * sin(t * 1.7 + phase);
        return core * (0.35 + pulse * 0.65);
      }

      void main() {
        vec2 uv = coverUv(vUv);

        // ------------------------------------------------------------
// ------------------------------------------------------------
// TIME
// ------------------------------------------------------------

// Continuous time for stars and lighting.
// These keep animating normally instead of reversing.
float lightT =
  uTime * uSpeed;

// ------------------------------------------------------------
// PING-PONG SKY ANIMATION
//
// 0 → 1 → 0
//
// First the sky swirls forward,
// then smoothly reverses back to its original state.
// ------------------------------------------------------------

float cycle =
  mod(uTime * uSpeed, 20.0);

float pingPong =
  0.5 -
  0.5 *
  cos(
    PI * cycle / 10.0
  );

float flowT =
  pingPong * TAU;

        // ------------------------------------------------------------
        // REGION MASKS
        // ------------------------------------------------------------

        // Sky dominates above the village/hills.
        float skyMask =
          smoothstep(0.30, 0.55, uv.y);

        // Keep the bottom village virtually fixed.
        float villageProtect =
          1.0 - smoothstep(0.20, 0.37, uv.y);

        // Protect the tall cypress from excessive sky distortion.
        // It may breathe very slightly, but its silhouette remains stable.
        float cypressProtect =
          gaussian(
            uv,
            vec2(0.285, 0.47),
            vec2(0.105, 0.42)
          );

        float motionMask =
          skyMask *
          (1.0 - cypressProtect * 0.88) *
          (1.0 - villageProtect);

        // ------------------------------------------------------------
        // VAN GOGH SKY FLOW
        // Multiple local vortices match the major painted currents.
        // Coordinates are based on the supplied artwork.
        // ------------------------------------------------------------

        vec2 flow = vec2(0.0);

        // Large central spiral.
        flow += vortex(
          uv,
          vec2(0.458, 0.645),
          0.245,
          0.0062,
          flowT
        );

        // Left wave current.
        flow += vortex(
          uv,
          vec2(0.135, 0.635),
          0.205,
          0.0046,
          -flowT* 0.82
        );

        // Smaller lower-right central spiral.
        flow += vortex(
          uv,
          vec2(0.635, 0.515),
          0.120,
          0.0036,
          flowT * 1.18 + 1.2
        );

        // Moon halo current.
        flow += vortex(
          uv,
          vec2(0.823, 0.827),
          0.155,
          0.0027,
          -flowT * 0.74 + 0.8
        );

        // Broad horizontal atmospheric movement.
        vec2 atmospheric = vec2(
          sin(uv.y * 33.0 + flowT) *
          sin(flowT * 0.5) *
          0.00095,

          cos(uv.x * 24.0 - flowT * 0.8) *
          sin(flowT) *
          0.00072
        );

        flow += atmospheric;

        vec2 warpedUv =
          uv +
          flow *
          motionMask *
          uIntensity;

        // ------------------------------------------------------------
        // HILLS
        // A tiny lateral breathing motion makes the landscape feel alive
        // without detaching it from the original painting.
        // ------------------------------------------------------------

        float hillMask =
          smoothstep(0.25, 0.39, uv.y) *
          (1.0 - smoothstep(0.39, 0.56, uv.y));

        float hillMotion =
          sin(flowT + uv.x * 8.0) *
          0.00065 *
          uIntensity;

        warpedUv.x += hillMotion * hillMask;

        // Clamp to the artwork.
        warpedUv = clamp(warpedUv, vec2(0.001), vec2(0.999));

        vec4 original = texture2D(uTexture, uv);
        vec4 animated = texture2D(uTexture, warpedUv);

        // Slightly soften the deformation blend.
        vec3 color =
          mix(
            original.rgb,
            animated.rgb,
            clamp(motionMask * 0.92 + hillMask * 0.32, 0.0, 1.0)
          );

        // ------------------------------------------------------------
        // STARS + MOON
        // The painting itself stays visible; these masks only add a subtle
        // luminosity oscillation around the existing painted lights.
        //
        // y coordinates use WebGL UVs: 0 bottom, 1 top.
        // ------------------------------------------------------------

        float glow = 0.0;

        // Large moon.
        glow += starPulse(
          uv,
          vec2(0.823, 0.827),
          0.094,
          0.0,
          lightT
        ) * 0.54;

        // Major stars.
        glow += starPulse(uv, vec2(0.200, 0.955), 0.040, 0.8, lightT) * 0.32;
        glow += starPulse(uv, vec2(0.379, 0.956), 0.035, 2.2, lightT) * 0.28;
        glow += starPulse(uv, vec2(0.581, 0.920), 0.048, 4.1, lightT) * 0.34;
        glow += starPulse(uv, vec2(0.298, 0.825), 0.039, 1.4, lightT) * 0.30;
        glow += starPulse(uv, vec2(0.655, 0.755), 0.033, 3.5, lightT) * 0.28;
        glow += starPulse(uv, vec2(0.385, 0.445), 0.047, 5.0, lightT) * 0.29;

        // Smaller left / right stars.
        glow += starPulse(uv, vec2(0.050, 0.735), 0.028, 4.9, lightT) * 0.22;
        glow += starPulse(uv, vec2(0.101, 0.540), 0.023, 2.8, lightT) * 0.20;
        glow += starPulse(uv, vec2(0.150, 0.535), 0.021, 0.4, lightT) * 0.19;
        glow += starPulse(uv, vec2(0.925, 0.705), 0.025, 1.9, lightT) * 0.20;
        glow += starPulse(uv, vec2(0.942, 0.935), 0.020, 3.6, lightT) * 0.17;

        // Warm painted-light bias rather than pure white.
        vec3 starLight = vec3(1.0, 0.91, 0.48);

        color +=
          starLight *
          glow *
          0.18 *
          uIntensity;

        // Tiny global paint-breathing variation.
        float breath =
          sin(lightT) * 0.012 * uIntensity;

        color *= 1.0 + breath;

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const geometry = new THREE.PlaneGeometry(2, 2);

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      depthTest: false,
      depthWrite: false,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const clock = new THREE.Clock();
    let raf = 0;
    let disposed = false;

    const resize = () => {
      if (!mount || disposed) return;

      const width = Math.max(1, mount.clientWidth);
      const height = Math.max(1, mount.clientHeight);

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(width, height, false);

      uniforms.uResolution.value.set(width, height);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);

    const animate = () => {
      if (disposed) return;

      raf = requestAnimationFrame(animate);
      uniforms.uTime.value = clock.getElapsedTime();

      renderer.render(scene, camera);
    };

    resize();
    animate();

    return () => {
      disposed = true;

      cancelAnimationFrame(raf);
      resizeObserver.disconnect();

      scene.remove(mesh);

      geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [intensity, speed]);

  return (
    <div
      ref={mountRef}
      className={`starry-night-animated ${className}`.trim()}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "#020617",
      }}
    />
  );
}
