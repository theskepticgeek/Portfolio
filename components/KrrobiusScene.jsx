"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function KrrobiusScene() {
  const rootRef = useRef(null);
  const bgCanvasRef = useRef(null);

  useEffect(() => {
    const rootElement = rootRef.current;
    const bgCanvas = bgCanvasRef.current;

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
            fieldRadius: 300,


            // Swirling / rotational component
            curlStrength: 1.00,


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

                    vy: 0

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
            // UPDATE PARTICLES
            // ======================================================

            function updateVectorField(dt) {


            // ----------------------------------------------------
            // SMOOTH DOT ↔ ARROW TRANSITION
            // ----------------------------------------------------

            const target =
                mouse.active
                ? 1
                : 0;


            const response =
                1 -
                Math.exp(
                -dt *
                7.0
                );


            interactionStrength +=
                (
                target -
                interactionStrength
                ) *
                response;



            // ----------------------------------------------------
            // PARTICLE PHYSICS
            // ----------------------------------------------------

            for (
                const particle
                of particles
            ) {


                const field =
                getVectorField(
                    particle.x,
                    particle.y
                );



                if (
                interactionStrength >
                0.001
                ) {


                particle.vx +=
                    field.x *
                    fieldConfig.forceStrength *
                    interactionStrength *
                    dt;


                particle.vy +=
                    field.y *
                    fieldConfig.forceStrength *
                    interactionStrength *
                    dt;

                }



                // --------------------------------------------------
                // SPRING BACK TO ORIGINAL POSITION
                // --------------------------------------------------

                particle.vx +=

                (
                    particle.homeX -
                    particle.x
                ) *

                fieldConfig.springStrength *
                dt;



                particle.vy +=

                (
                    particle.homeY -
                    particle.y
                ) *

                fieldConfig.springStrength *
                dt;



                // --------------------------------------------------
                // FRAME-RATE INDEPENDENT DAMPING
                // --------------------------------------------------

                const damping =
                Math.pow(

                    fieldConfig.damping,

                    dt *
                    60

                );


                particle.vx *=
                damping;


                particle.vy *=
                damping;



                // --------------------------------------------------
                // SPEED LIMIT
                // --------------------------------------------------

                const speed =
                Math.sqrt(

                    particle.vx *
                    particle.vx +

                    particle.vy *
                    particle.vy

                );


                if (
                speed >
                fieldConfig.maxSpeed
                ) {


                const scale =
                    fieldConfig.maxSpeed /
                    speed;


                particle.vx *=
                    scale;


                particle.vy *=
                    scale;

                }



                // --------------------------------------------------
                // INTEGRATE
                // --------------------------------------------------

                particle.x +=
                particle.vx *
                dt;


                particle.y +=
                particle.vy *
                dt;



                // --------------------------------------------------
                // VANISH ONLY WHEN THE ARROW REACHES THE CURSOR
                // --------------------------------------------------
                //
                // All motion up to this point is the ORIGINAL motion:
                // curl + attraction + spring + damping + speed limit.
                //
                // We only remove/reset a particle after it reaches
                // the tiny cursor core, preventing arrows from sitting
                // on top of the cursor once they arrive.
                if (
                mouse.active &&
                interactionStrength >
                0.05
                ) {


                const cursorDx =
                    mouse.x -
                    particle.x;


                const cursorDy =
                    mouse.y -
                    particle.y;


                const cursorDistanceSq =
                    cursorDx * cursorDx +
                    cursorDy * cursorDy;


                if (
                    cursorDistanceSq <=
                    fieldConfig.consumeRadius *
                    fieldConfig.consumeRadius
                ) {


                    particle.x =
                        particle.homeX;


                    particle.y =
                        particle.homeY;


                    particle.vx =
                        0;


                    particle.vy =
                        0;
                }
                }
            }
            }



            // ======================================================
            // DRAW DOT
            // ======================================================

            function drawDot(
            x,
            y,
            alpha
            ) {


            if (
                alpha <=
                0.001
            ) {
                return;
            }


            bgCtx.globalAlpha =
                alpha;


            bgCtx.fillStyle =
                "#ffffff";


            bgCtx.beginPath();


            bgCtx.arc(

                x,

                y,

                fieldConfig.dotRadius,

                0,

                TAU

            );


            bgCtx.fill();
            }



            // ======================================================
            // DRAW VECTOR ARROW
            // ======================================================

            function drawArrow(
            x,
            y,
            directionX,
            directionY,
            length,
            alpha
            ) {


            if (
                alpha <=
                0.001
            ) {
                return;
            }



            const magnitude =
                Math.sqrt(

                directionX *
                directionX +

                directionY *
                directionY

                );


            if (
                magnitude <
                0.0001
            ) {
                return;
            }



            const nx =
                directionX /
                magnitude;


            const ny =
                directionY /
                magnitude;



            // Center the arrow around the particle.
            //
            // More length is placed in front,
            // so it still visually "points".
            const startX =
                x -
                nx *
                length *
                0.30;


            const startY =
                y -
                ny *
                length *
                0.30;



            const endX =
                x +
                nx *
                length *
                0.70;


            const endY =
                y +
                ny *
                length *
                0.70;



            bgCtx.globalAlpha =
                alpha;


            bgCtx.strokeStyle =
                "#ffffff";


            bgCtx.fillStyle =
                "#ffffff";


            bgCtx.lineWidth =
                0.9;


            bgCtx.lineCap =
                "round";


            bgCtx.lineJoin =
                "round";



            // ----------------------------------------------------
            // SHAFT
            // ----------------------------------------------------

            bgCtx.beginPath();


            bgCtx.moveTo(
                startX,
                startY
            );


            bgCtx.lineTo(
                endX,
                endY
            );


            bgCtx.stroke();



            // ----------------------------------------------------
            // ARROW HEAD
            // ----------------------------------------------------

            const headLength =
                Math.max(
                2.3,
                length *
                0.26
                );


            const angle =
                Math.atan2(
                ny,
                nx
                );


            const spread =
                Math.PI /
                6;



            bgCtx.beginPath();


            bgCtx.moveTo(
                endX,
                endY
            );


            bgCtx.lineTo(

                endX -
                Math.cos(
                angle -
                spread
                ) *
                headLength,

                endY -
                Math.sin(
                angle -
                spread
                ) *
                headLength

            );


            bgCtx.moveTo(
                endX,
                endY
            );


            bgCtx.lineTo(

                endX -
                Math.cos(
                angle +
                spread
                ) *
                headLength,

                endY -
                Math.sin(
                angle +
                spread
                ) *
                headLength

            );


            bgCtx.stroke();
            }



            // ======================================================
            // RENDER VECTOR FIELD
            // ======================================================

            function renderVectorField() {


            const width =
                window.innerWidth;


            const height =
                window.innerHeight;



            // Clear canvas
            bgCtx.clearRect(
                0,
                0,
                width,
                height
            );



            const arrowMorph =
                interactionStrength;


            const dotMorph =
                1 -
                interactionStrength;



            for (
                const particle
                of particles
            ) {


                const field =
                getVectorField(
                    particle.x,
                    particle.y
                );



                // --------------------------------------------------
                // DOT
                // --------------------------------------------------
                //
                // As cursor interaction increases,
                // the dots softly fade out.
                // --------------------------------------------------

                const dotAlpha =
                fieldConfig.dotOpacity *
                dotMorph;



                drawDot(

                particle.x,

                particle.y,

                dotAlpha

                );



                // --------------------------------------------------
                // ARROW
                // --------------------------------------------------

                if (
                arrowMorph >
                0.001
                ) {


                // Closer arrows become a little longer.
                const length =

                    fieldConfig.arrowLength *

                    (
                    0.70 +

                    field.influence *
                    0.85
                    ) *

                    (
                    0.75 +

                    arrowMorph *
                    0.25
                    );



                // All particles become arrows,
                // but those closer to the cursor are brighter.
                //
                // This is the ORIGINAL alpha formula.
                let arrowAlpha =

                    fieldConfig.arrowOpacity *

                    arrowMorph *

                    (
                    0.42 +

                    field.influence *
                    0.58
                    );



                // --------------------------------------------------
                // TINY VANISH ZONE AT THE CURSOR
                // --------------------------------------------------
                //
                // This does not influence particle movement.
                // It only fades the arrow during its final few pixels.
                const cursorDx =
                    mouse.x -
                    particle.x;


                const cursorDy =
                    mouse.y -
                    particle.y;


                const cursorDistance =
                    Math.sqrt(
                    cursorDx * cursorDx +
                    cursorDy * cursorDy
                    );


                if (
                    cursorDistance <
                    fieldConfig.vanishFadeRadius
                ) {


                    const vanishT =
                        Math.max(
                        0,
                        Math.min(
                            1,
                            (
                            cursorDistance -
                            fieldConfig.consumeRadius
                            ) /
                            (
                            fieldConfig.vanishFadeRadius -
                            fieldConfig.consumeRadius
                            )
                        )
                        );


                    // Smoothstep: 0 at consumeRadius, 1 outside fade zone.
                    const vanishFade =
                        vanishT *
                        vanishT *
                        (
                        3 -
                        2 *
                        vanishT
                        );


                    arrowAlpha *=
                        vanishFade;
                }



                drawArrow(

                    particle.x,

                    particle.y,

                    field.x,

                    field.y,

                    length,

                    arrowAlpha

                );
                }
            }



            // Restore full alpha for next frame
            bgCtx.globalAlpha =
                1;
            }



            // ======================================================
            // MOUSE / POINTER INTERACTION
            // ======================================================

            const handlePointerMove = (event) => {
                mouse.x = event.clientX;
                mouse.y = event.clientY;
                mouse.active = true;
            };

            const handlePointerLeave = () => {
                mouse.active = false;
            };

            const handleWindowBlur = () => {
                mouse.active = false;
            };

            window.addEventListener("pointermove", handlePointerMove);
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



            // Möbius
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
      document.documentElement.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("resize", handleResize);

      geometry.dispose();
      material.dispose();
      renderer.dispose();

      if (renderer.domElement.parentNode === rootElement) {
        rootElement.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div ref={rootRef} className="krrobius-root" aria-hidden="true">
      <canvas ref={bgCanvasRef} id="bgCanvas" />
    </div>
  );
}
