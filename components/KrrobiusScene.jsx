"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

// The strip has 54 longitudinal divisions and 10 width divisions.
// Setting track to 0 centers every element directly on the central
// longitudinal gridline of the ribbon, avoiding the outer corners and edges.
const PORTFOLIO_ITEMS = [
  { id: "about", label: "ABOUT ME", phase: 0 / 54, track: 0 },
  { id: "projects", label: "PROJECTS", phase: 5 / 54, track: 0 },
  { id: "research", label: "RESEARCH", phase: 10 / 54, track: 0 },
  { id: "current-work", label: "CURRENT WORK", phase: 15 / 54, track: 0 },
  { id: "experience", label: "EXPERIENCE", phase: 20 / 54, track: 0 },
  { id: "tech-stack", label: "TECH STACK", phase: 25 / 54, track: 0 },
  { id: "education", label: "EDUCATION", phase: 30 / 54, track: 0 },
  { id: "achievements", label: "ACHIEVEMENTS", phase: 35 / 54, track: 0 },
  { id: "resume", label: "RESUME", phase: 40 / 54, track: 0 },
  { id: "contact", label: "CONTACT", phase: 45 / 54, track: 0 },
  { id: "playground", label: "PLAYGROUND", phase: 50 / 54, track: 0 },
];

export default function KrrobiusScene() {
  const rootRef = useRef(null);
  const bgCanvasRef = useRef(null);
  const tooltipRef = useRef(null);
  const tooltipLabelRef = useRef(null);
  const tooltipSubRef = useRef(null);

  // ======================================================
  // NIGHT VIDEO PAGE TRANSITION
  // ======================================================
  // public/night.mp4 is available in the browser as /night.mp4.
  // We keep the actual navigation action in a ref so the video can
  // finish first, then perform whatever navigation was requested.
  const [nightTransitionVisible, setNightTransitionVisible] = useState(false);
  const transitionActiveRef = useRef(false);
  const pendingNavigationRef = useRef(null);
  const transitionVideoRef = useRef(null);

  const startNightTransition = (navigationAction) => {
    if (transitionActiveRef.current) return;

    transitionActiveRef.current = true;
    pendingNavigationRef.current = navigationAction;
    setNightTransitionVisible(true);
  };

  const finishNightTransition = () => {
    const navigationAction = pendingNavigationRef.current;
    pendingNavigationRef.current = null;

    if (navigationAction) {
      // Execute the navigation.
      // IMPORTANT: We DO NOT call setNightTransitionVisible(false) here!
      // When navigating to /portfolio, the browser takes a moment to load the page.
      // Keeping the overlay visible guarantees that the Krrobius scene never glimpses through.
      navigationAction();
      return;
    }

    transitionActiveRef.current = false;
    setNightTransitionVisible(false);
  };

  // Ensure unmuted audio playback when the loading transition appears
  useEffect(() => {
    if (nightTransitionVisible) {
      const handleKeyDown = (e) => {
        if (e.key === "Escape" || e.key === " ") {
          finishNightTransition();
        }
      };
      window.addEventListener("keydown", handleKeyDown);

      if (transitionVideoRef.current) {
        const vid = transitionVideoRef.current;
        vid.currentTime = 0;
        vid.muted = false;
        vid.volume = 1.0;
        const playPromise = vid.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn("Unmuted autoplay restricted by browser policy; trying muted:", err);
            vid.muted = true;
            vid.play().catch((e) => console.error("Video play error:", e));
          });
        }
      }

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [nightTransitionVisible]);

  const navigateToPortfolioItem = (targetId) => {
    startNightTransition(() => {
      if (targetId === "playground") {
        window.location.href = "/portfolio/playground.html";
        return;
      }

      // Preserve your existing navigation behavior for the other sections.
      // If another component listens for "krrobius:navigate", it will now
      // receive the event AFTER night.mp4 has finished.
      window.location.hash = targetId;

      window.dispatchEvent(
        new CustomEvent("krrobius:navigate", {
          detail: { id: targetId },
        })
      );
    });
  };

  useEffect(() => {
    const rootElement = rootRef.current;
    const bgCanvas = bgCanvasRef.current;
    const tooltipElement = tooltipRef.current;
    const tooltipLabelElement = tooltipLabelRef.current;
    const tooltipSubElement = tooltipSubRef.current;

    if (!rootElement || !bgCanvas) return;

    // ======================================================
            // CONSTANTS
            // ======================================================

            const TAU = Math.PI * 2;



            // ======================================================
            // THREE.JS SCENE
            // ======================================================

            const scene = new THREE.Scene();

            /*
            IMPORTANT:

            Do NOT use:

            scene.background = new THREE.Color(0x000000);

            because we need the WebGL background to remain
            transparent so the vector-field canvas is visible.
            */



            // ======================================================
            // CAMERA
            // ======================================================

            const camera = new THREE.PerspectiveCamera(
            40,
            window.innerWidth / window.innerHeight,
            0.1,
            100
            );

            camera.position.set(
            0,
            0,
            6.5
            );

            camera.lookAt(
            0,
            0,
            0
            );



            // ======================================================
            // WEBGL RENDERER
            // ======================================================

            const renderer = new THREE.WebGLRenderer({
            antialias: true,

            // Required so the background canvas can show through.
            alpha: true
            });


            renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio,
                2
            )
            );


            renderer.setSize(
            window.innerWidth,
            window.innerHeight
            );


            renderer.outputEncoding =
            THREE.sRGBEncoding;


            // Transparent clear color
            renderer.setClearColor(
            0x000000,
            0
            );


            renderer.domElement.classList.add(
            "webgl"
            );


            rootElement.appendChild(
            renderer.domElement
            );



            // ======================================================
            // INFINITY CENTERLINE
            // ======================================================

            function getCenterPoint(t) {

            const a = 2.25;


            // Vertical size of infinity loops
            const yScale = 1.35;


            // Separates front/rear branches
            // at the central crossing.
            const crossingDepth = 0.55;


            const sinT =
                Math.sin(t);

            const cosT =
                Math.cos(t);


            const denominator =
                1.0 +
                sinT * sinT;



            // Bernoulli lemniscate
            const x =
                (a * cosT) /
                denominator;


            const y =
                yScale *
                (a * sinT * cosT) /
                denominator;


            // Put one crossing in front,
            // the other behind.
            const z =
                crossingDepth *
                sinT;


            return new THREE.Vector3(
                x,
                y,
                z
            );
            }



            // ======================================================
            // RIBBON FRAME FOR PORTFOLIO ITEMS
            // ======================================================
            //
            // Uses exactly the same centerline + Möbius twist as the
            // strip geometry. `trackOffset` is a fixed width position,
            // so each label rides a longitudinal grid line.
            function getRibbonFrame(u, trackOffset = 0) {
              const t = u * TAU - Math.PI / 2;
              const epsilon = 0.0005;
              const referenceAxis = new THREE.Vector3(0, 0, 1);

              const center = getCenterPoint(t);
              const previous = getCenterPoint(t - epsilon);
              const next = getCenterPoint(t + epsilon);

              const tangent = next
                .clone()
                .sub(previous)
                .normalize();

              let across = new THREE.Vector3().crossVectors(
                referenceAxis,
                tangent
              );

              if (across.lengthSq() < 0.000001) {
                across = new THREE.Vector3().crossVectors(
                  new THREE.Vector3(0, 1, 0),
                  tangent
                );
              }

              across.normalize();

              const binormal = new THREE.Vector3()
                .crossVectors(tangent, across)
                .normalize();

              const twist = u * Math.PI - Math.PI / 4;

              const widthDirection = across
                .clone()
                .multiplyScalar(Math.cos(twist))
                .add(
                  binormal
                    .clone()
                    .multiplyScalar(Math.sin(twist))
                )
                .normalize();

              const point = center
                .clone()
                .add(widthDirection.clone().multiplyScalar(trackOffset));

              const surfaceNormal = new THREE.Vector3()
                .crossVectors(tangent, widthDirection)
                .normalize();

              return {
                point,
                tangent,
                widthDirection,
                surfaceNormal,
              };
            }


            // ======================================================
            // CREATE CLOSED INFINITY MÖBIUS STRIP
            // ======================================================

            function createInfinityMobiusGeometry({

            halfWidth = 0.30,

            tSegments = 320,

            sSegments = 16

            } = {}) {


            const positions = [];

            const uvs = [];

            const indices = [];


            const epsilon =
                0.0005;


            const referenceAxis =
                new THREE.Vector3(
                0,
                0,
                1
                );



            // ====================================================
            // VERTICES
            // ====================================================

            for (
                let i = 0;
                i < tSegments;
                i++
            ) {


                const u =
                i / tSegments;



                // ==================================================
                // MOVE THE MÖBIUS SEAM
                // ==================================================
                //
                // -PI/2 places the seam on the rear central branch
                // instead of the visible right-hand edge.
                // ==================================================

                const t =
                u * TAU -
                Math.PI / 2;



                const center =
                getCenterPoint(t);



                // --------------------------------------------------
                // TANGENT
                // --------------------------------------------------

                const previous =
                getCenterPoint(
                    t - epsilon
                );


                const next =
                getCenterPoint(
                    t + epsilon
                );


                const tangent =
                next
                    .clone()
                    .sub(previous)
                    .normalize();



                // --------------------------------------------------
                // LOCAL RIBBON FRAME
                // --------------------------------------------------

                let across =
                new THREE.Vector3()
                    .crossVectors(
                    referenceAxis,
                    tangent
                    );


                if (
                across.lengthSq() <
                0.000001
                ) {

                across =
                    new THREE.Vector3()
                    .crossVectors(

                        new THREE.Vector3(
                        0,
                        1,
                        0
                        ),

                        tangent
                    );
                }


                across.normalize();



                const binormal =
                new THREE.Vector3()
                    .crossVectors(
                    tangent,
                    across
                    )
                    .normalize();



                // ==================================================
                // MÖBIUS HALF TWIST
                // ==================================================
                //
                // u = 0 → 1
                //
                // therefore:
                //
                // twist = 0 → PI
                //
                // exactly one half twist.
                //
                // IMPORTANT:
                // We use u here instead of t because the path itself
                // was offset by -PI/2 to move the seam.
                // ==================================================

                const twist =
                u * Math.PI -
                Math.PI / 4;


                const cosTwist =
                Math.cos(twist);


                const sinTwist =
                Math.sin(twist);



                const widthDirection =
                across
                    .clone()
                    .multiplyScalar(
                    cosTwist
                    )
                    .add(

                    binormal
                        .clone()
                        .multiplyScalar(
                        sinTwist
                        )

                    )
                    .normalize();



                // --------------------------------------------------
                // WIDTH VERTICES
                // --------------------------------------------------

                for (
                let j = 0;
                j <= sSegments;
                j++
                ) {


                const v =
                    j / sSegments;


                const s =
                    THREE.MathUtils.lerp(

                    -halfWidth,

                    halfWidth,

                    v
                    );



                const position =
                    center
                    .clone()
                    .add(

                        widthDirection
                        .clone()
                        .multiplyScalar(s)

                    );



                positions.push(
                    position.x,
                    position.y,
                    position.z
                );


                uvs.push(
                    u,
                    v
                );
                }
            }



            // ====================================================
            // TRIANGLES
            // ====================================================

            const row =
                sSegments + 1;



            for (
                let i = 0;
                i < tSegments;
                i++
            ) {


                const nextI =
                (i + 1) %
                tSegments;


                const seam =
                i ===
                tSegments - 1;



                for (
                let j = 0;
                j < sSegments;
                j++
                ) {


                const a =
                    i * row +
                    j;


                const b =
                    i * row +
                    j + 1;


                let c;
                let d;



                if (!seam) {

                    c =
                    nextI * row +
                    j;


                    d =
                    nextI * row +
                    j + 1;

                }

                else {

                    // ==============================================
                    // MÖBIUS SEAM
                    // ==============================================
                    //
                    // Width must reverse after completing
                    // one journey around a Möbius strip.
                    // ==============================================

                    c =
                    sSegments -
                    j;


                    d =
                    sSegments -
                    (j + 1);

                }



                indices.push(
                    a,
                    b,
                    c
                );


                indices.push(
                    b,
                    d,
                    c
                );
                }
            }



            const geometry =
                new THREE.BufferGeometry();



            geometry.setAttribute(

                "position",

                new THREE.Float32BufferAttribute(
                positions,
                3
                )

            );



            geometry.setAttribute(

                "uv",

                new THREE.Float32BufferAttribute(
                uvs,
                2
                )

            );



            geometry.setIndex(
                indices
            );


            geometry.computeBoundingSphere();


            return geometry;
            }



            // ======================================================
            // GEOMETRY
            // ======================================================

            const geometry =
            createInfinityMobiusGeometry({

                halfWidth: 0.30,

                tSegments: 320,

                sSegments: 16

            });



            // ======================================================
            // VERTEX SHADER
            // ======================================================

            const vertexShader = `

            precision highp float;

            varying vec2 vUv;
            varying vec3 vViewPos;


            void main() {

                vUv = uv;


                vec4 mvPosition =
                modelViewMatrix *
                vec4(
                    position,
                    1.0
                );


                vViewPos =
                mvPosition.xyz;


                gl_Position =
                projectionMatrix *
                mvPosition;
            }

            `;



            // ======================================================
            // FRAGMENT SHADER
            // ======================================================

            const fragmentShader = `

            precision highp float;


            varying vec2 vUv;

            varying vec3 vViewPos;


            uniform float uTime;



            // ===================================================
            // SOFT GRID LINE
            // ===================================================

            float softGridLine(
                float coord,
                float thickness,
                float blur
            ) {

                float f =
                fract(coord);


                float dist =
                min(
                    f,
                    1.0 - f
                );


                float aa =
                fwidth(coord) *
                1.2;


                return

                1.0 -

                smoothstep(

                    thickness,

                    thickness +
                    blur +
                    aa,

                    dist

                );
            }



            void main() {


                // =================================================
                // SMOOTH FRONT/BACK SHADING
                // =================================================

                vec3 dx =
                dFdx(vViewPos);


                vec3 dy =
                dFdy(vViewPos);


                vec3 normal =
                normalize(
                    cross(
                    dx,
                    dy
                    )
                );


                vec3 viewDir =
                normalize(
                    -vViewPos
                );


                float facing =
                dot(
                    normal,
                    viewDir
                );



                // Smooth white-grey transition
                float sideMix =
                smoothstep(
                    -0.12,
                    0.12,
                    facing
                );



                vec3 frontColor =
                vec3(
                    0.95,
                    0.95,
                    0.95
                );


                vec3 backColor =
                vec3(
                    0.70,
                    0.70,
                    0.70
                );



                vec3 baseColor =
                mix(
                    backColor,
                    frontColor,
                    sideMix
                );



                // =================================================
                // MOVING GRID
                // =================================================

                float lengthDivisions =
                54.0;


                float widthDivisions =
                10.0;


                float speed =
                0.60;



                float u =
                vUv.x *
                lengthDivisions -
                uTime *
                speed;


                float v =
                vUv.y *
                widthDivisions;



                float lineU =
                softGridLine(
                    u,
                    0.007,
                    0.020
                );


                float lineV =
                softGridLine(
                    v,
                    0.006,
                    0.018
                );



                float gridMask =
                max(
                    lineU,
                    lineV
                );



                // Grid tone follows surface tone
                vec3 gridColor =
                baseColor *
                0.80;



                // Reduce grid contrast around
                // the white-grey transition.
                float transitionFade =
                abs(facing);


                transitionFade =
                smoothstep(
                    0.00,
                    0.18,
                    transitionFade
                );



                float gridStrength =
                0.34 *
                transitionFade;



                vec3 finalColor =
                mix(

                    baseColor,

                    gridColor,

                    gridMask *
                    gridStrength

                );



                gl_FragColor =
                vec4(
                    finalColor,
                    1.0
                );
            }

            `;



            // ======================================================
            // MATERIAL
            // ======================================================

            const material =
            new THREE.ShaderMaterial({

                vertexShader:
                vertexShader,

                fragmentShader:
                fragmentShader,


                uniforms: {

                uTime: {
                    value: 0
                }

                },


                side:
                THREE.DoubleSide,


                depthTest:
                true,


                depthWrite:
                true,


                transparent:
                false,


                // fwidth / dFdx / dFdy support
                extensions: {
                derivatives: true
                }

            });



            // ======================================================
            // MESH
            // ======================================================

            const mobius =
            new THREE.Mesh(
                geometry,
                material
            );


            scene.add(
            mobius
            );



            // ======================================================
            // PORTFOLIO LABELS RIDING THE MÖBIUS GRID
            // ======================================================

            function roundedRect(ctx, x, y, width, height, radius) {
              const r = Math.min(radius, width / 2, height / 2);

              ctx.beginPath();
              ctx.moveTo(x + r, y);
              ctx.lineTo(x + width - r, y);
              ctx.quadraticCurveTo(x + width, y, x + width, y + r);
              ctx.lineTo(x + width, y + height - r);
              ctx.quadraticCurveTo(
                x + width,
                y + height,
                x + width - r,
                y + height
              );
              ctx.lineTo(x + r, y + height);
              ctx.quadraticCurveTo(x, y + height, x, y + height - r);
              ctx.lineTo(x, y + r);
              ctx.quadraticCurveTo(x, y, x + r, y);
              ctx.closePath();
            }


            // ======================================================
            // PROCEDURAL GLYPH DRAWING FOR FLOATING POINTERS
            // ======================================================

            function drawAboutMeGlyph(ctx, cx, cy, time, isHovered) {
              ctx.save();
              ctx.translate(cx, cy);
              ctx.strokeStyle = isHovered
                ? "rgba(255, 255, 255, 0.96)"
                : "rgba(255, 255, 255, 0.82)";
              ctx.lineWidth = 1.3;

              // Concentric biometric fingerprint ridges with topographic perturbation
              const ridgeRadii = [3.5, 7.2, 11.2, 15.2];
              ridgeRadii.forEach((baseR, idx) => {
                ctx.beginPath();
                const steps = 38;
                const startAngle = idx === 0 ? 0 : 0.45;
                const endAngle = idx === 0 ? TAU : TAU - 0.45;
                for (let i = 0; i <= steps; i++) {
                  const a = startAngle + (i / steps) * (endAngle - startAngle);
                  const wave =
                    Math.sin(a * 3 + idx * 0.8) * 0.85 +
                    Math.cos(a * 2) * 0.45;
                  const r = baseR + wave;
                  const px = Math.cos(a) * r;
                  const py = Math.sin(a) * (r * 1.18);
                  if (i === 0) ctx.moveTo(px, py);
                  else ctx.lineTo(px, py);
                }
                ctx.stroke();
              });

              // Central biometric core whorl / singularity
              ctx.beginPath();
              ctx.arc(0, 1.4, 1.3, 0, TAU);
              ctx.fillStyle = "#ffffff";
              ctx.fill();
              ctx.restore();
            }

            function drawProjectsGlyph(ctx, cx, cy, time, isHovered) {
              ctx.save();
              ctx.translate(cx, cy);
              const rotY = time * 0.65;
              const rotX = 0.52;
              const size = 11.5;

              const rawVertices = [
                [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
                [-1, -1,  1], [1, -1,  1], [1, 1,  1], [-1, 1,  1],
              ];

              const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
              const cosX = Math.cos(rotX), sinX = Math.sin(rotX);

              const proj = rawVertices.map(([x, y, z]) => {
                const x1 = x * cosY + z * sinY;
                const y1 = y;
                const z1 = -x * sinY + z * cosY;

                const x2 = x1;
                const y2 = y1 * cosX - z1 * sinX;
                const z2 = y1 * sinX + z1 * cosX;
                return { x: x2 * size, y: -y2 * size, z: z2 };
              });

              const edges = [
                [0, 1], [1, 2], [2, 3], [3, 0],
                [4, 5], [5, 6], [6, 7], [7, 4],
                [0, 4], [1, 5], [2, 6], [3, 7],
              ];

              edges.forEach(([i, j]) => {
                const avgZ = (proj[i].z + proj[j].z) * 0.5;
                const alpha = avgZ > 0
                  ? (isHovered ? 0.96 : 0.86)
                  : 0.35;
                ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.lineWidth = avgZ > 0 ? 1.4 : 1.0;
                ctx.beginPath();
                ctx.moveTo(proj[i].x, proj[i].y);
                ctx.lineTo(proj[j].x, proj[j].y);
                ctx.stroke();
              });

              proj.forEach((p) => {
                if (p.z > 0) {
                  ctx.fillStyle = "#ffffff";
                  ctx.beginPath();
                  ctx.arc(p.x, p.y, 1.2, 0, TAU);
                  ctx.fill();
                }
              });
              ctx.restore();
            }

            function drawResearchGlyph(ctx, cx, cy, time, isHovered) {
              ctx.save();
              ctx.translate(cx, cy);

              // Central nucleus
              ctx.beginPath();
              ctx.arc(0, 0, 2.5, 0, TAU);
              ctx.fillStyle = "#ffffff";
              ctx.fill();

              // 3 tilted orbital rings with revolving satellite nodes
              const orbits = [
                { rx: 15, ry: 5.5, rot: Math.PI / 6, speed: 1.6, phase: 0 },
                { rx: 15, ry: 5.5, rot: -Math.PI / 6, speed: -1.3, phase: 1.8 },
                { rx: 14, ry: 5.0, rot: Math.PI / 2, speed: 1.4, phase: 3.2 },
              ];

              orbits.forEach((orb) => {
                ctx.save();
                ctx.rotate(orb.rot);
                ctx.beginPath();
                ctx.ellipse(0, 0, orb.rx, orb.ry, 0, 0, TAU);
                ctx.strokeStyle = isHovered
                  ? "rgba(255, 255, 255, 0.55)"
                  : "rgba(255, 255, 255, 0.35)";
                ctx.lineWidth = 1.0;
                ctx.stroke();

                const angle = time * orb.speed + orb.phase;
                const sx = Math.cos(angle) * orb.rx;
                const sy = Math.sin(angle) * orb.ry;
                ctx.beginPath();
                ctx.arc(sx, sy, 1.8, 0, TAU);
                ctx.fillStyle = "#ffffff";
                ctx.fill();
                ctx.restore();
              });
              ctx.restore();
            }

            function drawCurrentWorkGlyph(ctx, cx, cy, time, isHovered) {
              ctx.save();
              ctx.translate(cx, cy);
              const R = 13.5;

              // Outer guide circle
              ctx.beginPath();
              ctx.arc(0, 0, R, 0, TAU);
              ctx.strokeStyle = "rgba(255, 255, 255, 0.20)";
              ctx.lineWidth = 1.0;
              ctx.stroke();

              // Incomplete rotating arc
              const startAngle = time * 1.5;
              const arcSpan = 4.8;
              const endAngle = startAngle + arcSpan;

              ctx.beginPath();
              ctx.arc(0, 0, R, startAngle, endAngle);
              ctx.strokeStyle = isHovered
                ? "rgba(255, 255, 255, 1.0)"
                : "rgba(255, 255, 255, 0.90)";
              ctx.lineWidth = 2.0;
              ctx.stroke();

              // Pulsing leading bead & radar ripple
              const pulse = Math.sin(time * 5.0) * 0.5 + 0.5;
              const tipX = Math.cos(endAngle) * R;
              const tipY = Math.sin(endAngle) * R;

              ctx.beginPath();
              ctx.arc(tipX, tipY, 2.0 + pulse * 3.0, 0, TAU);
              ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - pulse) * 0.7})`;
              ctx.lineWidth = 1.0;
              ctx.stroke();

              ctx.beginPath();
              ctx.arc(tipX, tipY, 2.2, 0, TAU);
              ctx.fillStyle = "#ffffff";
              ctx.fill();

              // Cardinal tick marks
              for (let i = 0; i < 4; i++) {
                const a = (i * Math.PI) / 2;
                ctx.beginPath();
                ctx.moveTo(Math.cos(a) * (R - 2.5), Math.sin(a) * (R - 2.5));
                ctx.lineTo(Math.cos(a) * (R + 2.5), Math.sin(a) * (R + 2.5));
                ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
                ctx.lineWidth = 1.0;
                ctx.stroke();
              }

              ctx.beginPath();
              ctx.arc(0, 0, 1.5, 0, TAU);
              ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
              ctx.fill();
              ctx.restore();
            }

            function drawExperienceGlyph(ctx, cx, cy, time, isHovered) {
              ctx.save();
              ctx.translate(cx, cy);
              ctx.strokeStyle = isHovered
                ? "rgba(255, 255, 255, 0.96)"
                : "rgba(255, 255, 255, 0.82)";
              ctx.lineWidth = 1.4;

              // Main backbone timeline
              ctx.beginPath();
              ctx.moveTo(-11, 10);
              ctx.lineTo(-4, 3);
              ctx.lineTo(3, -3);
              ctx.lineTo(11, -10);
              ctx.stroke();

              // Branch 1
              ctx.beginPath();
              ctx.moveTo(-4, 3);
              ctx.quadraticCurveTo(-8, 0, -9, -7);
              ctx.stroke();

              // Branch 2
              ctx.beginPath();
              ctx.moveTo(3, -3);
              ctx.quadraticCurveTo(7, 0, 9, 5);
              ctx.stroke();

              const nodes = [
                { x: -11, y: 10, r: 1.8 },
                { x: -4, y: 3, r: 2.2 },
                { x: 3, y: -3, r: 2.2 },
                { x: 11, y: -10, r: 2.4 },
                { x: -9, y: -7, r: 1.6 },
                { x: 9, y: 5, r: 1.6 },
              ];

              nodes.forEach((n) => {
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r, 0, TAU);
                ctx.fillStyle = "#ffffff";
                ctx.fill();
              });

              // Active progression pulse along the timeline
              const pulseProg = (time * 0.75) % 1.0;
              const px = -11 + pulseProg * 22;
              const py = 10 - pulseProg * 20;
              ctx.beginPath();
              ctx.arc(px, py, 2.5, 0, TAU);
              ctx.fillStyle = "#ffffff";
              ctx.fill();
              ctx.restore();
            }

            function drawTechStackGlyph(ctx, cx, cy, time, isHovered) {
              ctx.save();
              ctx.translate(cx, cy);
              const w = 11.5;
              const h = 5.0;
              const floatOffset = Math.sin(time * 1.8) * 1.0;
              const layerY = [-7.5 - floatOffset, 0, 7.5 + floatOffset];

              // Vertical corner guide pillars linking strata
              ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
              ctx.lineWidth = 1.0;
              ctx.beginPath();
              ctx.moveTo(0, layerY[0]);
              ctx.lineTo(0, layerY[2]);
              ctx.moveTo(w, layerY[0]);
              ctx.lineTo(w, layerY[2]);
              ctx.moveTo(-w, layerY[0]);
              ctx.lineTo(-w, layerY[2]);
              ctx.stroke();

              for (let i = 2; i >= 0; i--) {
                const y = layerY[i];
                ctx.beginPath();
                ctx.moveTo(0, y - h);
                ctx.lineTo(w, y);
                ctx.lineTo(0, y + h);
                ctx.lineTo(-w, y);
                ctx.closePath();

                ctx.fillStyle = i === 0
                  ? "rgba(255, 255, 255, 0.20)"
                  : "rgba(0, 0, 0, 0.70)";
                ctx.fill();

                ctx.strokeStyle = isHovered || i === 0
                  ? "rgba(255, 255, 255, 0.95)"
                  : "rgba(255, 255, 255, 0.65)";
                ctx.lineWidth = i === 0 ? 1.4 : 1.1;
                ctx.stroke();

                if (i === 0) {
                  ctx.beginPath();
                  ctx.arc(0, y, 1.5, 0, TAU);
                  ctx.fillStyle = "#ffffff";
                  ctx.fill();
                }
              }
              ctx.restore();
            }

            function drawEducationGlyph(ctx, cx, cy, time, isHovered) {
              ctx.save();
              ctx.translate(cx, cy);
              ctx.strokeStyle = isHovered
                ? "rgba(255, 255, 255, 0.96)"
                : "rgba(255, 255, 255, 0.82)";
              ctx.lineWidth = 1.3;

              // Center vertical spine
              ctx.beginPath();
              ctx.moveTo(0, -6);
              ctx.lineTo(0, 9);
              ctx.stroke();

              // Left open plane
              ctx.beginPath();
              ctx.moveTo(0, 9);
              ctx.lineTo(-12, 4);
              ctx.lineTo(-12, -8);
              ctx.lineTo(0, -5);
              ctx.closePath();
              ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
              ctx.fill();
              ctx.stroke();

              // Right open plane
              ctx.beginPath();
              ctx.moveTo(0, 9);
              ctx.lineTo(12, 4);
              ctx.lineTo(12, -8);
              ctx.lineTo(0, -5);
              ctx.closePath();
              ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
              ctx.fill();
              ctx.stroke();

              // Expanding perspective inner page lines
              ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
              ctx.lineWidth = 1.0;
              ctx.beginPath();
              ctx.moveTo(0, 8);
              ctx.lineTo(-8, 0);
              ctx.lineTo(-8, -6);
              ctx.moveTo(0, 8);
              ctx.lineTo(8, 0);
              ctx.lineTo(8, -6);
              ctx.stroke();

              // Floating knowledge apex delta
              const floatApex = Math.sin(time * 2.0) * 0.8;
              const apexY = -10 + floatApex;
              ctx.beginPath();
              ctx.moveTo(0, apexY - 3.5);
              ctx.lineTo(3, apexY + 1.5);
              ctx.lineTo(-3, apexY + 1.5);
              ctx.closePath();
              ctx.fillStyle = "#ffffff";
              ctx.fill();
              ctx.restore();
            }

            function drawAchievementsGlyph(ctx, cx, cy, time, isHovered) {
              ctx.save();
              ctx.translate(cx, cy);
              const R = 12.5;
              const inner = 2.8;
              const shimmer = Math.sin(time * 3.5) * 0.15 + 0.85;

              // Diffraction spikes
              const spikeLen = R + 4.5 * shimmer;
              ctx.strokeStyle = `rgba(255, 255, 255, ${0.45 * shimmer})`;
              ctx.lineWidth = 1.0;
              ctx.beginPath();
              ctx.moveTo(-spikeLen, 0);
              ctx.lineTo(spikeLen, 0);
              ctx.moveTo(0, -spikeLen);
              ctx.lineTo(0, spikeLen);
              ctx.stroke();

              // Diagonal micro sparkles
              const diag = 5.5;
              ctx.strokeStyle = `rgba(255, 255, 255, ${0.35 * shimmer})`;
              ctx.beginPath();
              ctx.moveTo(-diag, -diag);
              ctx.lineTo(diag, diag);
              ctx.moveTo(-diag, diag);
              ctx.lineTo(diag, -diag);
              ctx.stroke();

              // Four-point astroid star body
              ctx.beginPath();
              ctx.moveTo(0, -R);
              ctx.quadraticCurveTo(inner, -inner, R, 0);
              ctx.quadraticCurveTo(inner, inner, 0, R);
              ctx.quadraticCurveTo(-inner, inner, -R, 0);
              ctx.quadraticCurveTo(-inner, -inner, 0, -R);
              ctx.closePath();
              ctx.fillStyle = isHovered
                ? "rgba(255, 255, 255, 0.96)"
                : "rgba(255, 255, 255, 0.85)";
              ctx.fill();
              ctx.strokeStyle = "#ffffff";
              ctx.lineWidth = 1.2;
              ctx.stroke();

              // Brilliant core
              ctx.beginPath();
              ctx.arc(0, 0, 1.8 * shimmer, 0, TAU);
              ctx.fillStyle = "#ffffff";
              ctx.fill();
              ctx.restore();
            }

            function drawResumeGlyph(ctx, cx, cy, time, isHovered) {
              ctx.save();
              ctx.translate(cx, cy);
              const w = 9.5;
              const h = 13.0;
              const fold = 5.0;

              // Document outline with folded dog-ear corner
              ctx.beginPath();
              ctx.moveTo(-w, -h);
              ctx.lineTo(w - fold, -h);
              ctx.lineTo(w, -h + fold);
              ctx.lineTo(w, h);
              ctx.lineTo(-w, h);
              ctx.closePath();
              ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
              ctx.fill();
              ctx.strokeStyle = isHovered
                ? "rgba(255, 255, 255, 0.96)"
                : "rgba(255, 255, 255, 0.78)";
              ctx.lineWidth = 1.3;
              ctx.stroke();

              // Corner fold tab
              ctx.beginPath();
              ctx.moveTo(w - fold, -h);
              ctx.lineTo(w - fold, -h + fold);
              ctx.lineTo(w, -h + fold);
              ctx.closePath();
              ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
              ctx.fill();
              ctx.stroke();

              // Schematic data lines
              ctx.strokeStyle = isHovered
                ? "rgba(255, 255, 255, 0.88)"
                : "rgba(255, 255, 255, 0.55)";
              ctx.lineWidth = 2.0;
              ctx.beginPath();
              ctx.moveTo(-w + 3.5, -4);
              ctx.lineTo(w - 3.5, -4);
              ctx.stroke();

              ctx.lineWidth = 1.2;
              ctx.beginPath();
              ctx.moveTo(-w + 3.5, 0);
              ctx.lineTo(w - 3.5, 0);
              ctx.moveTo(-w + 3.5, 4);
              ctx.lineTo(w - 3.5, 4);
              ctx.moveTo(-w + 3.5, 8);
              ctx.lineTo(-w + 9.5, 8);
              ctx.stroke();
              ctx.restore();
            }

            function drawContactGlyph(ctx, cx, cy, time, isHovered) {
              ctx.save();
              ctx.translate(cx, cy);

              // Central transmitter node
              ctx.beginPath();
              ctx.arc(0, 0, 2.8, 0, TAU);
              ctx.fillStyle = "#ffffff";
              ctx.fill();

              // Expanding directional transmission signal waves
              const waveCount = 3;
              const maxRadius = 15.0;
              for (let i = 0; i < waveCount; i++) {
                const phase = (time * 1.2 + i / waveCount) % 1.0;
                const r = 4.0 + phase * (maxRadius - 4.0);
                const alpha = (1.0 - phase) * (isHovered ? 0.95 : 0.75);

                ctx.beginPath();
                ctx.arc(0, 0, r, -Math.PI * 0.45, Math.PI * 0.45);
                ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.lineWidth = 1.2;
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(0, 0, r, Math.PI * 0.55, Math.PI * 1.45);
                ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.45})`;
                ctx.stroke();
              }

              const corePulse = Math.sin(time * 4.0) * 0.5 + 0.5;
              ctx.beginPath();
              ctx.arc(0, 0, 1.2 + corePulse * 1.0, 0, TAU);
              ctx.fillStyle = "#ffffff";
              ctx.fill();
              ctx.restore();
            }

            function drawPlaygroundGlyph(ctx, cx, cy, time, isHovered) {
              ctx.save();
              ctx.translate(cx, cy);
              const steps = 64;
              const R = 11.5;
              const morph = time * 0.8;

              // Strange procedural topological knot
              ctx.beginPath();
              for (let i = 0; i <= steps; i++) {
                const t = (i / steps) * TAU;
                const x = Math.sin(2 * t + morph) * R + Math.sin(3 * t) * (R * 0.35);
                const y = Math.cos(3 * t) * (R * 0.85) + Math.cos(t - morph) * (R * 0.35);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
              }
              ctx.closePath();
              ctx.strokeStyle = isHovered
                ? "rgba(255, 255, 255, 0.96)"
                : "rgba(255, 255, 255, 0.82)";
              ctx.lineWidth = 1.3;
              ctx.stroke();

              // Central singularity
              ctx.beginPath();
              ctx.arc(0, 0, 1.8, 0, TAU);
              ctx.fillStyle = "#ffffff";
              ctx.fill();

              // Orbiting quantum particle
              const orbitT = -time * 1.5;
              const ox = Math.cos(orbitT) * (R + 2.5);
              const oy = Math.sin(orbitT) * (R + 2.5);
              ctx.beginPath();
              ctx.arc(ox, oy, 1.2, 0, TAU);
              ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
              ctx.fill();
              ctx.restore();
            }

            function drawPortfolioGlyph(ctx, id, cx, cy, time, isHovered) {
              switch (id) {
                case "about":
                  drawAboutMeGlyph(ctx, cx, cy, time, isHovered);
                  break;
                case "projects":
                  drawProjectsGlyph(ctx, cx, cy, time, isHovered);
                  break;
                case "research":
                  drawResearchGlyph(ctx, cx, cy, time, isHovered);
                  break;
                case "current-work":
                  drawCurrentWorkGlyph(ctx, cx, cy, time, isHovered);
                  break;
                case "experience":
                  drawExperienceGlyph(ctx, cx, cy, time, isHovered);
                  break;
                case "tech-stack":
                  drawTechStackGlyph(ctx, cx, cy, time, isHovered);
                  break;
                case "education":
                  drawEducationGlyph(ctx, cx, cy, time, isHovered);
                  break;
                case "achievements":
                  drawAchievementsGlyph(ctx, cx, cy, time, isHovered);
                  break;
                case "resume":
                  drawResumeGlyph(ctx, cx, cy, time, isHovered);
                  break;
                case "contact":
                  drawContactGlyph(ctx, cx, cy, time, isHovered);
                  break;
                case "playground":
                  drawPlaygroundGlyph(ctx, cx, cy, time, isHovered);
                  break;
                default:
                  drawProjectsGlyph(ctx, cx, cy, time, isHovered);
              }
            }


            // ======================================================
            // PORTFOLIO GLYPH TOKENS (GLYPH ONLY RIDING THE STRIP)
            // ======================================================

            function createPortfolioTexture(item) {
              const pixelRatio = 2;
              const logicalSize = 64;

              const canvas = document.createElement("canvas");
              canvas.width = logicalSize * pixelRatio;
              canvas.height = logicalSize * pixelRatio;

              const ctx = canvas.getContext("2d");
              ctx.scale(pixelRatio, pixelRatio);

              const cx = logicalSize / 2;
              const cy = logicalSize / 2;
              const radius = 26;

              function renderToken(time = 0, isHovered = false) {
                ctx.save();
                ctx.clearRect(0, 0, logicalSize, logicalSize);

                // Outer faint halo pulse when hovered
                if (isHovered) {
                  ctx.beginPath();
                  ctx.arc(cx, cy, radius + 3.5, 0, TAU);
                  ctx.strokeStyle = "rgba(255, 255, 255, 0.32)";
                  ctx.lineWidth = 1.0;
                  ctx.stroke();
                }

                // Circular token disc backing
                ctx.beginPath();
                ctx.arc(cx, cy, radius, 0, TAU);
                ctx.fillStyle = isHovered
                  ? "rgba(12, 14, 20, 0.94)"
                  : "rgba(4, 6, 12, 0.84)";
                ctx.fill();

                ctx.strokeStyle = isHovered
                  ? "rgba(255, 255, 255, 0.96)"
                  : "rgba(255, 255, 255, 0.45)";
                ctx.lineWidth = isHovered ? 1.5 : 1.1;
                ctx.stroke();

                // Draw procedural visual element glyph centered
                drawPortfolioGlyph(
                  ctx,
                  item.id,
                  cx,
                  cy,
                  time,
                  isHovered
                );

                ctx.restore();
              }

              // Initial render
              renderToken(0, false);

              const texture = new THREE.CanvasTexture(canvas);
              texture.minFilter = THREE.LinearFilter;
              texture.magFilter = THREE.LinearFilter;
              texture.generateMipmaps = false;

              return {
                texture,
                aspect: 1.0,
                renderToken,
              };
            }


            // Shared geometry for all portfolio tokens
            const tokenGeometry = new THREE.PlaneGeometry(1, 1);

            const portfolioMeshes = PORTFOLIO_ITEMS.map((item) => {
              const { texture, aspect, renderToken } = createPortfolioTexture(item);

              const tokenMaterial = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                opacity: 1,
                depthTest: true,
                depthWrite: false,
                side: THREE.DoubleSide,
                polygonOffset: true,
                polygonOffsetFactor: -2,
                polygonOffsetUnits: -2,
              });

              const mesh = new THREE.Mesh(tokenGeometry, tokenMaterial);

              const baseSize = 0.28;

              mesh.scale.set(baseSize, baseSize, 1);
              mesh.userData = {
                ...item,
                baseSize,
                texture,
                renderToken,
                hovered: false,
                wasHovered: false,
                lastUpdateTime: 0,
              };

              scene.add(mesh);
              return mesh;
            });


            // The strip shader moves its longitudinal grid at:
            // u = uTime * 0.60 / 54.0
            // Matching that speed makes these tokens visually ride
            // the same moving grid instead of sliding independently.
            const portfolioOrbitSpeed = 0.60 / 54.0;

            function updatePortfolioItems(time) {
              for (const mesh of portfolioMeshes) {
                const isHovered = !!mesh.userData.hovered;
                const hoverChanged = isHovered !== mesh.userData.wasHovered;
                const timeSinceUpdate = time - mesh.userData.lastUpdateTime;

                // Redraw texture on hover change or at ~30 FPS for active procedural animations
                if (hoverChanged || timeSinceUpdate >= 0.033) {
                  mesh.userData.wasHovered = isHovered;
                  mesh.userData.lastUpdateTime = time;
                  mesh.userData.renderToken(time, isHovered);
                  mesh.userData.texture.needsUpdate = true;
                }

                const u =
                  (mesh.userData.phase +
                    time * portfolioOrbitSpeed) %
                  1;

                const frame = getRibbonFrame(
                  u,
                  mesh.userData.track
                );

                const toCamera = camera.position
                  .clone()
                  .sub(frame.point)
                  .normalize();

                // Compute visible surface normal facing the camera
                let surfaceNormal = frame.surfaceNormal.clone();
                if (surfaceNormal.dot(toCamera) < 0) {
                  surfaceNormal.negate();
                }

                // ===================================================
                // PHASE-BASED RESIZING:
                // Gradual, balanced scaling:
                // Tokens smoothly scale between 0.82x on the left side (u ~ 0.68)
                // and 1.28x at the strip's right bottom (u ~ 0.18).
                // The minimum of 0.82x ensures tokens never get too small with respect
                // to the strip's thickness on the left side, keeping the transition gradual.
                // ===================================================
                const phaseT = (Math.cos((u - 0.18) * TAU) + 1) * 0.5;

                // Gradual scaling transition between 0.82x (left side) and 1.28x (right bottom)
                const phaseScale = THREE.MathUtils.lerp(0.82, 1.28, phaseT);
                const hoverScale = mesh.userData.hovered ? 1.20 : 1.0;
                const finalSize = mesh.userData.baseSize * phaseScale * hoverScale;

                mesh.scale.set(finalSize, finalSize, 1);

                // cos(theta) is dot product between visible ribbon surface normal and camera view vector
                const cosTheta = Math.max(0, Math.min(1, surfaceNormal.dot(toCamera)));
                const sinTheta = Math.sqrt(Math.max(0, 1 - cosTheta * cosTheta));

                // Radius of the token quad
                const halfSize = finalSize * 0.5;

                // Lift the quad along the visible surface normal so the backmost corner
                // of the upright camera-facing quad never penetrates behind the ribbon surface.
                const normalLift = halfSize * sinTheta + 0.015;

                const worldPoint = frame.point
                  .clone()
                  .addScaledVector(surfaceNormal, normalLift)
                  .addScaledVector(toCamera, 0.035);

                mesh.position.copy(worldPoint);

                // Fixed upright camera-facing orientation:
                // Glyphs never tilt sideways, twist, or flip upside-down.
                mesh.quaternion.copy(camera.quaternion);

                // Smooth opacity fade with depth
                mesh.material.opacity = THREE.MathUtils.lerp(
                  0.70,
                  1.0,
                  phaseT
                );

                mesh.renderOrder = Math.round((worldPoint.z + 1.0) * 10);
              }
            }


            const portfolioRaycaster = new THREE.Raycaster();
            const portfolioPointer = new THREE.Vector2();


            function getPortfolioHit(event) {
              portfolioPointer.x =
                (event.clientX / window.innerWidth) * 2 - 1;
              portfolioPointer.y =
                -(event.clientY / window.innerHeight) * 2 + 1;

              portfolioRaycaster.setFromCamera(
                portfolioPointer,
                camera
              );

              const hits = portfolioRaycaster.intersectObjects(
                portfolioMeshes,
                false
              );

              return hits[0]?.object ?? null;
            }


            // ======================================================
            // BACKGROUND VECTOR FIELD
            // ======================================================

            const bgCtx =
            bgCanvas.getContext(
                "2d"
            );



            // ======================================================
            // VECTOR FIELD CONFIGURATION
            // ======================================================

            const fieldConfig = {

            // Distance between particles
            spacing: 32,


            // Calm dot size
            dotRadius: 0.9,


            // Length of vector arrows
            arrowLength: 8.5,


            // General radius over which cursor is strongest
            fieldRadius: 280,


            // Swirling / rotational component
            curlStrength: 1.15,


            // Direct attraction toward mouse
            attractStrength: 0.72,


            // How strongly particles return home
            springStrength: 2.4,


            // Particle velocity damping.
            // This is treated as "per 60Hz frame".
            damping: 0.91,


            // Overall vector-field force
            forceStrength: 145,


            // Maximum particle velocity
            maxSpeed: 125,


            // Idle white-dot opacity
            dotOpacity: 0.42,


            // Arrow opacity
            arrowOpacity: 0.72,


            // ------------------------------------------------------
            // CURSOR CONSUMPTION
            // ------------------------------------------------------
            // These affect only what happens right at the cursor.
            // They do NOT change curl, attraction, speed or falloff.

            // Particle disappears once its center reaches this radius.
            consumeRadius: 8,


            // Begin a very short fade only just before consumption.
            vanishFadeRadius: 26

            };



            // ======================================================
            // MOUSE STATE
            // ======================================================

            const mouse = {

            x:
                window.innerWidth *
                0.5,

            y:
                window.innerHeight *
                0.5,

            active:
                false

            };



            // Smooth 0 → 1 interaction state.
            //
            // This means dots don't instantly snap into arrows.
            let interactionStrength =
            0;



            // ======================================================
            // PARTICLES
            // ======================================================

            const particles = [];



            // ======================================================
            // RESIZE BACKGROUND CANVAS
            // ======================================================

            function resizeBackground() {


            const dpr =
                Math.min(
                window.devicePixelRatio ||
                1,

                2
                );


            const width =
                window.innerWidth;


            const height =
                window.innerHeight;



            bgCanvas.width =
                Math.floor(
                width *
                dpr
                );


            bgCanvas.height =
                Math.floor(
                height *
                dpr
                );


            bgCanvas.style.width =
                width + "px";


            bgCanvas.style.height =
                height + "px";



            // Draw using CSS pixel coordinates
            bgCtx.setTransform(
                dpr,
                0,
                0,
                dpr,
                0,
                0
            );


            buildParticleField();
            }



            // ======================================================
            // BUILD WHITE DOT FIELD
            // ======================================================

            function buildParticleField() {


            particles.length =
                0;


            const spacing =
                fieldConfig.spacing;


            const width =
                window.innerWidth;


            const height =
                window.innerHeight;



            const columns =
                Math.ceil(
                width /
                spacing
                ) + 2;


            const rows =
                Math.ceil(
                height /
                spacing
                ) + 2;



            // Center the grid
            const totalWidth =
                (columns - 1) *
                spacing;


            const totalHeight =
                (rows - 1) *
                spacing;


            const startX =
                (width - totalWidth) *
                0.5;


            const startY =
                (height - totalHeight) *
                0.5;



            for (
                let row = 0;
                row < rows;
                row++
            ) {


                for (
                let column = 0;
                column < columns;
                column++
                ) {


                const x =
                    startX +
                    column *
                    spacing;


                const y =
                    startY +
                    row *
                    spacing;



                particles.push({
                    homeX: x,
                    homeY: y,
                    x: x,
                    y: y,
                    vx: 0,
                    vy: 0,
                    fx: 0,
                    fy: 0,
                    influence: 0,
                    dist: 9999
                });
                }
            }
            }



            // ======================================================
            // VECTOR FIELD
            // ======================================================

            function getVectorField(
            x,
            y
            ) {


            const dx =
                mouse.x -
                x;


            const dy =
                mouse.y -
                y;


            const rawDistance =
                Math.sqrt(
                dx * dx +
                dy * dy
                );



            const distance =
                Math.max(
                rawDistance,
                0.0001
                );



            // Direction directly toward cursor
            const radialX =
                dx /
                distance;


            const radialY =
                dy /
                distance;



            // Perpendicular direction.
            //
            // This creates the curl.
            const tangentX =
                -dy /
                distance;


            const tangentY =
                dx /
                distance;



            // Smooth field with no hard radius boundary.
            //
            // This is important:
            // instead of arrows abruptly stopping at some radius,
            // the field gradually weakens across the canvas.
            const normalizedDistance =
                distance /
                fieldConfig.fieldRadius;


            const influence =
                1.0 /
                (
                1.0 +
                normalizedDistance *
                normalizedDistance
                );



            // Reduce the rotational singularity at
            // the exact mouse position.
            const core =
                Math.min(
                1,
                distance /
                30
                );



            const curl =
                fieldConfig.curlStrength *
                core;


            const attraction =
                fieldConfig.attractStrength;



            const fx =
                (
                tangentX *
                curl +

                radialX *
                attraction
                ) *
                influence;



            const fy =
                (
                tangentY *
                curl +

                radialY *
                attraction
                ) *
                influence;



            return {

                x: fx,

                y: fy,

                influence:
                influence

            };
            }


            // ======================================================
            // UPDATE PARTICLES (ZERO-ALLOCATION FIELD PHYSICS)
            // ======================================================

            function updateVectorField(dt) {
              const target = mouse.active ? 1 : 0;
              const response = 1 - Math.exp(-dt * 7.0);
              interactionStrength += (target - interactionStrength) * response;

              const isInteracting = interactionStrength > 0.001;
              const consumeRadiusSq = fieldConfig.consumeRadius * fieldConfig.consumeRadius;
              const damping = Math.pow(fieldConfig.damping, dt * 60);

              const mouseX = mouse.x;
              const mouseY = mouse.y;
              const fieldRadius = fieldConfig.fieldRadius;
              const curlBase = fieldConfig.curlStrength;
              const attraction = fieldConfig.attractStrength;
              const forceStrength = fieldConfig.forceStrength;
              const springStrength = fieldConfig.springStrength;
              const maxSpeed = fieldConfig.maxSpeed;

              for (let i = 0; i < particles.length; i++) {
                const particle = particles[i];

                const dx = mouseX - particle.x;
                const dy = mouseY - particle.y;
                const distSq = dx * dx + dy * dy;
                const distance = Math.max(Math.sqrt(distSq), 0.0001);

                const radialX = dx / distance;
                const radialY = dy / distance;
                const tangentX = -dy / distance;
                const tangentY = dx / distance;

                const normalizedDistance = distance / fieldRadius;
                const influence = 1.0 / (1.0 + normalizedDistance * normalizedDistance);
                const core = Math.min(1, distance / 30);
                const curl = curlBase * core;

                const fx = (tangentX * curl + radialX * attraction) * influence;
                const fy = (tangentY * curl + radialY * attraction) * influence;

                // Cache directly on particle for zero-allocation rendering
                particle.fx = fx;
                particle.fy = fy;
                particle.influence = influence;
                particle.dist = distance;

                if (isInteracting) {
                  particle.vx += fx * forceStrength * interactionStrength * dt;
                  particle.vy += fy * forceStrength * interactionStrength * dt;
                }

                // Spring back to home grid position
                particle.vx += (particle.homeX - particle.x) * springStrength * dt;
                particle.vy += (particle.homeY - particle.y) * springStrength * dt;

                particle.vx *= damping;
                particle.vy *= damping;

                const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
                if (speed > maxSpeed) {
                  const scale = maxSpeed / speed;
                  particle.vx *= scale;
                  particle.vy *= scale;
                }

                particle.x += particle.vx * dt;
                particle.y += particle.vy * dt;

                // Consumption reset at mouse core
                if (mouse.active && interactionStrength > 0.05) {
                  const cdx = mouseX - particle.x;
                  const cdy = mouseY - particle.y;
                  if (cdx * cdx + cdy * cdy <= consumeRadiusSq) {
                    particle.x = particle.homeX;
                    particle.y = particle.homeY;
                    particle.vx = 0;
                    particle.vy = 0;
                  }
                }
              }
            }


            // ======================================================
            // RENDER VECTOR FIELD (BATCHED HIGH-PERFORMANCE CANVAS)
            // ======================================================

            // Pre-allocated bucket index arrays for zero-allocation arrow batching
            const bucketIndices = [[], [], [], []];
            const COS_SPREAD = 0.86602540378; // Math.cos(Math.PI / 6)
            const SIN_SPREAD = 0.5;           // Math.sin(Math.PI / 6)

            function renderVectorField() {
              const width = window.innerWidth;
              const height = window.innerHeight;

              bgCtx.clearRect(0, 0, width, height);

              const arrowMorph = interactionStrength;
              const dotMorph = 1 - interactionStrength;

              // --------------------------------------------------
              // 1. BATCHED CALM DOTS (ONE SINGLE FILL CALL)
              // --------------------------------------------------
              const dotAlpha = fieldConfig.dotOpacity * dotMorph;
              if (dotAlpha > 0.003) {
                bgCtx.globalAlpha = dotAlpha;
                bgCtx.fillStyle = "#ffffff";
                bgCtx.beginPath();
                const r = fieldConfig.dotRadius;
                for (let i = 0; i < particles.length; i++) {
                  const p = particles[i];
                  bgCtx.moveTo(p.x + r, p.y);
                  bgCtx.arc(p.x, p.y, r, 0, TAU);
                }
                bgCtx.fill();
              }

              // --------------------------------------------------
              // 2. BATCHED VECTOR ARROWS (4 STROKE CALLS TOTAL)
              // --------------------------------------------------
              if (arrowMorph > 0.001) {
                bucketIndices[0].length = 0;
                bucketIndices[1].length = 0;
                bucketIndices[2].length = 0;
                bucketIndices[3].length = 0;

                const consumeRadius = fieldConfig.consumeRadius;
                const vanishFadeRadius = fieldConfig.vanishFadeRadius;

                for (let i = 0; i < particles.length; i++) {
                  const p = particles[i];
                  const dist = p.dist;

                  // Vanish when consumed
                  if (dist <= consumeRadius) {
                    continue;
                  }

                  let bIndex;
                  if (dist < vanishFadeRadius) {
                    bIndex = 0;
                  } else if (p.influence < 0.25) {
                    bIndex = 0;
                  } else if (p.influence < 0.50) {
                    bIndex = 1;
                  } else if (p.influence < 0.75) {
                    bIndex = 2;
                  } else {
                    bIndex = 3;
                  }

                  bucketIndices[bIndex].push(i);
                }

                bgCtx.strokeStyle = "#ffffff";
                bgCtx.lineWidth = 0.9;
                bgCtx.lineCap = "round";
                bgCtx.lineJoin = "round";

                const baseOpacity = fieldConfig.arrowOpacity * arrowMorph;
                const bucketAlphas = [
                  baseOpacity * (0.42 + 0.12 * 0.58),
                  baseOpacity * (0.42 + 0.37 * 0.58),
                  baseOpacity * (0.42 + 0.62 * 0.58),
                  baseOpacity * (0.42 + 0.87 * 0.58),
                ];

                const arrowBaseLen = fieldConfig.arrowLength;

                for (let b = 0; b < 4; b++) {
                  const indices = bucketIndices[b];
                  if (indices.length === 0 || bucketAlphas[b] <= 0.001) continue;

                  bgCtx.globalAlpha = bucketAlphas[b];
                  bgCtx.beginPath();

                  for (let k = 0; k < indices.length; k++) {
                    const p = particles[indices[k]];
                    const fx = p.fx;
                    const fy = p.fy;
                    const magSq = fx * fx + fy * fy;
                    if (magSq < 0.000001) continue;

                    const invMag = 1 / Math.sqrt(magSq);
                    const nx = fx * invMag;
                    const ny = fy * invMag;

                    const length =
                      arrowBaseLen *
                      (0.70 + p.influence * 0.85) *
                      (0.75 + arrowMorph * 0.25);

                    const startX = p.x - nx * length * 0.30;
                    const startY = p.y - ny * length * 0.30;
                    const endX = p.x + nx * length * 0.70;
                    const endY = p.y + ny * length * 0.70;

                    const headLength = Math.max(2.3, length * 0.26);

                    const h1x = endX - (nx * COS_SPREAD + ny * SIN_SPREAD) * headLength;
                    const h1y = endY - (ny * COS_SPREAD - nx * SIN_SPREAD) * headLength;
                    const h2x = endX - (nx * COS_SPREAD - ny * SIN_SPREAD) * headLength;
                    const h2y = endY - (ny * COS_SPREAD + nx * SIN_SPREAD) * headLength;

                    // Shaft
                    bgCtx.moveTo(startX, startY);
                    bgCtx.lineTo(endX, endY);
                    // Left head barb
                    bgCtx.lineTo(h1x, h1y);
                    // Right head barb
                    bgCtx.moveTo(endX, endY);
                    bgCtx.lineTo(h2x, h2y);
                  }

                  bgCtx.stroke();
                }
              }

              // Restore full alpha for next frame
              bgCtx.globalAlpha = 1;
            }



            // ======================================================
            // MOUSE / POINTER INTERACTION
            // ======================================================

            const handlePointerMove = (event) => {
                mouse.x = event.clientX;
                mouse.y = event.clientY;
                mouse.active = true;
            };

            let currentHoveredMesh = null;

            function updateHoverAndTooltip() {
              if (mouse.active) {
                portfolioPointer.x =
                  (mouse.x / window.innerWidth) * 2 - 1;
                portfolioPointer.y =
                  -(mouse.y / window.innerHeight) * 2 + 1;

                portfolioRaycaster.setFromCamera(
                  portfolioPointer,
                  camera
                );

                const hits = portfolioRaycaster.intersectObjects(
                  portfolioMeshes,
                  false
                );
                currentHoveredMesh = hits[0]?.object ?? null;
              } else {
                currentHoveredMesh = null;
              }

              for (const mesh of portfolioMeshes) {
                mesh.userData.hovered =
                  mesh === currentHoveredMesh;
              }

              const newCursor = currentHoveredMesh ? "pointer" : "default";
              if (rootElement.style.cursor !== newCursor) {
                rootElement.style.cursor = newCursor;
              }

              if (currentHoveredMesh && tooltipElement) {
                const proj = currentHoveredMesh.position
                  .clone()
                  .project(camera);

                if (proj.z < 1) {
                  const screenX =
                    (proj.x * 0.5 + 0.5) * window.innerWidth;
                  const screenY =
                    (-proj.y * 0.5 + 0.5) * window.innerHeight;

                  tooltipElement.style.left = `${screenX}px`;
                  tooltipElement.style.top = `${screenY - 20}px`;

                  if (tooltipLabelElement && tooltipLabelElement.textContent !== currentHoveredMesh.userData.label) {
                    tooltipLabelElement.textContent =
                      currentHoveredMesh.userData.label;
                  }
                  const subText = currentHoveredMesh.userData.id === "playground"
                    ? "INTERACTIVE 3D"
                    : "SECTION";
                  if (tooltipSubElement && tooltipSubElement.textContent !== subText) {
                    tooltipSubElement.textContent = subText;
                  }

                  if (!tooltipElement.classList.contains("visible")) {
                    tooltipElement.classList.add("visible");
                  }
                } else {
                  if (tooltipElement.classList.contains("visible")) {
                    tooltipElement.classList.remove("visible");
                  }
                }
              } else if (tooltipElement && tooltipElement.classList.contains("visible")) {
                tooltipElement.classList.remove("visible");
              }
            }

            const handlePortfolioClick = (event) => {
  const hit = getPortfolioHit(event);

  if (!hit) return;

  const targetId = hit.userData.id;

  // Every 3D portfolio glyph now plays night.mp4 first.
  navigateToPortfolioItem(targetId);
};

            const handlePointerLeave = () => {
                mouse.active = false;
            };

            const handleWindowBlur = () => {
                mouse.active = false;
            };

            window.addEventListener("pointermove", handlePointerMove);
            window.addEventListener("pointerup", handlePortfolioClick);
            document.documentElement.addEventListener("pointerleave", handlePointerLeave);
            window.addEventListener("blur", handleWindowBlur);


            // ======================================================
            // WINDOW RESIZE
            // ======================================================

            const handleResize = () => {
                camera.aspect =
                    window.innerWidth /
                    window.innerHeight;

                camera.updateProjectionMatrix();

                renderer.setSize(
                    window.innerWidth,
                    window.innerHeight
                );

                renderer.setPixelRatio(
                    Math.min(
                        window.devicePixelRatio,
                        2
                    )
                );

                resizeBackground();
            };

            window.addEventListener("resize", handleResize);


            // ======================================================
            // INITIALIZE BACKGROUND
            // ======================================================

            resizeBackground();



            // ======================================================
            // ANIMATION
            // ======================================================

            const clock =
            new THREE.Clock();


            let elapsedTime =
            0;



            let animationFrameId;

            function animate() {


            animationFrameId = requestAnimationFrame(
                animate
            );



            // Cap delta so returning to the browser tab
            // doesn't cause a huge physics step.
            const dt =
                Math.min(
                clock.getDelta(),
                0.033
                );


            elapsedTime +=
                dt;



            // Möbius grid animation
            material.uniforms.uTime.value =
                elapsedTime;



            // Background interaction
            updateVectorField(
                dt
            );


            renderVectorField();


            // Portfolio labels riding the strip
            updatePortfolioItems(
                elapsedTime
            );


            // Update hover state and floating tooltip
            updateHoverAndTooltip();


            // Möbius + portfolio labels
            renderer.render(
                scene,
                camera
            );
            }



            animate();


    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePortfolioClick);
      document.documentElement.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("resize", handleResize);

      for (const mesh of portfolioMeshes) {
        scene.remove(mesh);
        mesh.material.dispose();
        mesh.userData.texture.dispose();
      }
      tokenGeometry.dispose();

      rootElement.style.cursor = "default";

      geometry.dispose();
      material.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode === rootElement) {
        rootElement.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div ref={rootRef} className="krrobius-root">
      {/* =====================================================
          FULL-SCREEN NIGHT VIDEO TRANSITION

          Put your file here:
          public/night.mp4

          Browser URL:
          /night.mp4

          The destination is opened only after this video ends.
         ===================================================== */}
      {nightTransitionVisible && (
        <div
          className="krrobius-night-transition"
          style={{
            position: "fixed",
            inset: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 999999,
            background: "#000",
            overflow: "hidden",
            pointerEvents: "all",
          }}
        >
          <video
            ref={transitionVideoRef}
            src="/night.mp4"
            autoPlay
            playsInline
            preload="auto"
            onEnded={finishNightTransition}
            onError={finishNightTransition}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              background: "#000",
            }}
          />

          {/* Audio Indicator & Skip Button Header */}
          <div
            style={{
              position: "absolute",
              top: "24px",
              left: "24px",
              right: "24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              zIndex: 10,
              pointerEvents: "none",
            }}
          >
            

            <button
              onClick={finishNightTransition}
              style={{
                pointerEvents: "auto",
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.18em",
                color: "#ffffff",
                background: "rgba(10, 16, 32, 0.8)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid rgba(255, 255, 255, 0.35)",
                padding: "9px 20px",
                borderRadius: "24px",
                cursor: "pointer",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.6)",
                transition: "all 0.2s ease",
              }}
            >
              SKIP INTRO →
            </button>
          </div>
        </div>
      )}

      <canvas ref={bgCanvasRef} id="bgCanvas" aria-hidden="true" />

      {/* Title above the strip: KRROBIUS */}
      <header className="krrobius-header">
        <h1 className="krrobius-title">KRROBIUS</h1>
        <p className="krrobius-subtitle">TOPOLOGICAL MANIFOLD // PORTFOLIO</p>
      </header>

      {/* Hovering text box for the 3D glyph elements */}
      <div
        ref={tooltipRef}
        className="krrobius-tooltip"
        aria-hidden="true"
      >
        <div className="krrobius-tooltip-inner">
          <span ref={tooltipLabelRef} className="krrobius-tooltip-label"></span>
          <span ref={tooltipSubRef} className="krrobius-tooltip-sub">SECTION</span>
        </div>
        <div className="krrobius-tooltip-arrow" />
      </div>

      {/* Button below the strip: ENTER PORTFOLIO */}
      <div className="krrobius-bottom-cta">
        <a
          href="/portfolio"
          className="krrobius-enter-btn"
          onClick={(event) => {
            event.preventDefault();

            startNightTransition(() => {
              // /portfolio should be the Next.js route that renders StarryNight.jsx.
              window.location.href = "/portfolio";
            });
          }}
        >
          <span className="krrobius-enter-dot" />
          <span className="krrobius-enter-text">ENTER PORTFOLIO</span>
          <span className="krrobius-enter-arrow">→</span>
        </a>
      </div>

      <nav className="portfolio-sr-nav" aria-label="Portfolio sections">
        {PORTFOLIO_ITEMS.map((item) => (
          <a
            key={item.id}
            href={
              item.id === "playground"
                ? "/portfolio/playground.html"
                : `#${item.id}`
            }
            onClick={(event) => {
              event.preventDefault();
              navigateToPortfolioItem(item.id);
            }}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
