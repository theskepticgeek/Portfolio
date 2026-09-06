"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";

// ============================================================================
// ASTRONOMICAL CELESTIAL BODIES (ACCURATE TO VAN GOGH'S STAR MAP, JUNE 1889)
// ============================================================================

const CELESTIAL_STARS = [
  {
    id: "venus",
    title: "VENUS (MORNING STAR)",
    role: "FEATURED PROJECTS",
    summary: "Architecting interactive 3D manifolds, WebGL shaders, and high-performance immersive web systems.",
    xPct: 0.35,
    yPct: 0.48,
    radius: 17,
    twinkleFreq: 1.8,
    haloRings: 4,
    color: "#ffffff",
    glow: "#fef08a",
  },
  {
    id: "moon",
    title: "CRESCENT MOON",
    role: "ABOUT ME & PHILOSOPHY",
    summary: "Software engineer and creative technologist bridging computational topology, mathematics, and expressive art.",
    xPct: 0.85,
    yPct: 0.17,
    radius: 34,
    twinkleFreq: 0.8,
    haloRings: 5,
    color: "#fef08a",
    glow: "#f59e0b",
    isMoon: true,
  },
  {
    id: "vortex-star",
    title: "COSMIC CURRENT",
    role: "RESEARCH & MATHEMATICS",
    summary: "Exploring Navier-Stokes fluid turbulence, Kolmogorov energy cascades, and non-orientable Möbius geometry.",
    xPct: 0.48,
    yPct: 0.22,
    radius: 12,
    twinkleFreq: 2.3,
    haloRings: 3,
    color: "#ffffff",
    glow: "#93c5fd",
  },
  {
    id: "star-1",
    title: "ALPHA CYGNI",
    role: "TECH STACK",
    summary: "Proficient in Next.js, React, Three.js, WebGL/GLSL, Python, C++, and distributed backend architectures.",
    xPct: 0.12,
    yPct: 0.14,
    radius: 11,
    twinkleFreq: 2.1,
    haloRings: 3,
    color: "#fef9c3",
    glow: "#eab308",
  },
  {
    id: "star-2",
    title: "POLARIS",
    role: "EXPERIENCE",
    summary: "Proven track record designing scalable front-end systems, real-time graphics pipelines, and client architectures.",
    xPct: 0.42,
    yPct: 0.12,
    radius: 13,
    twinkleFreq: 1.5,
    haloRings: 3,
    color: "#ffffff",
    glow: "#60a5fa",
  },
  {
    id: "star-3",
    title: "CAPELLA",
    role: "ACHIEVEMENTS",
    summary: "Recognized for innovative creative engineering, open-source 3D contributions, and academic excellence.",
    xPct: 0.62,
    yPct: 0.15,
    radius: 14,
    twinkleFreq: 2.7,
    haloRings: 3,
    color: "#fef08a",
    glow: "#d97706",
  },
  {
    id: "star-4",
    title: "VEGA",
    role: "CURRENT WORK",
    summary: "Developing generative audio-visual procedural systems and browser-based WebGPU physical simulations.",
    xPct: 0.72,
    yPct: 0.26,
    radius: 12,
    twinkleFreq: 1.9,
    haloRings: 3,
    color: "#ffffff",
    glow: "#38bdf8",
  },
  {
    id: "star-5",
    title: "ALTAIR",
    role: "EDUCATION",
    summary: "Advanced Computer Science and Mathematics training with deep specialization in computational algorithms.",
    xPct: 0.93,
    yPct: 0.12,
    radius: 11,
    twinkleFreq: 2.4,
    haloRings: 3,
    color: "#fef08a",
    glow: "#f59e0b",
  },
  {
    id: "star-6",
    title: "ARCTURUS",
    role: "RESUME",
    summary: "Comprehensive experience in full-stack architecture, high-frequency graphics, and algorithmic optimizations.",
    xPct: 0.86,
    yPct: 0.38,
    radius: 13,
    twinkleFreq: 1.7,
    haloRings: 3,
    color: "#ffffff",
    glow: "#fde047",
  },
  {
    id: "star-7",
    title: "SPICA",
    role: "CONTACT",
    summary: "Open to cutting-edge technical collaborations, graphics engineering roles, and visionary interactive projects.",
    xPct: 0.74,
    yPct: 0.46,
    radius: 11,
    twinkleFreq: 2.2,
    haloRings: 3,
    color: "#fef9c3",
    glow: "#f97316",
  },
  {
    id: "star-8",
    title: "ANTARES",
    role: "PLAYGROUND 3D",
    summary: "Explore the standalone interactive 3D laboratory with particle vector dynamics and custom audio synths.",
    xPct: 0.58,
    yPct: 0.40,
    radius: 12,
    twinkleFreq: 2.0,
    haloRings: 3,
    color: "#fef08a",
    glow: "#ec4899",
  },
  {
    id: "star-9",
    title: "DENEB",
    role: "INTERACTIVE CODE",
    summary: "Click and drag across the sky to disturb the cosmic winds and swirl Van Gogh's paint in real time.",
    xPct: 0.18,
    yPct: 0.42,
    radius: 10,
    twinkleFreq: 1.6,
    haloRings: 3,
    color: "#ffffff",
    glow: "#38bdf8",
  },
];

export default function StarryNight() {
  const canvasRef = useRef(null);
  const [selectedStar, setSelectedStar] = useState(null);
  const [hoveredStar, setHoveredStar] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [windSpeedMode, setWindSpeedMode] = useState(1); // 0.5, 1.0, 1.6
  const [showPortfolioDrawer, setShowPortfolioDrawer] = useState(false);

  const audioCtxRef = useRef(null);
  const windGainRef = useRef(null);

  // Toggle ambient night wind audio synthesized purely via Web Audio API
  const toggleSound = useCallback(() => {
    if (!soundEnabled) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = audioCtxRef.current || new AudioCtx();
        audioCtxRef.current = ctx;
        if (ctx.state === "suspended") {
          ctx.resume();
        }

        // Generate 5 seconds of soft pink noise
        const bufferSize = ctx.sampleRate * 5;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
          b6 = white * 0.115926;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        // Bandpass filter centered on nocturnal whistling wind frequencies
        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(320, ctx.currentTime);
        filter.Q.setValueAtTime(2.5, ctx.currentTime);

        // Low-frequency oscillator to modulate wind gust intensity
        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.22, ctx.currentTime);
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(120, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
        windGainRef.current = gainNode;

        whiteNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        whiteNoise.start();
        lfo.start();
        setSoundEnabled(true);
      } catch (err) {
        console.warn("Web Audio initialization:", err);
      }
    } else {
      if (windGainRef.current && audioCtxRef.current) {
        windGainRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.2);
        setTimeout(() => {
          try {
            audioCtxRef.current?.suspend();
          } catch (e) {}
        }, 300);
      }
      setSoundEnabled(false);
    }
  }, [soundEnabled]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initBackgroundLayers();
    };
    window.addEventListener("resize", handleResize);

    // ========================================================================
    // INTERACTIVE FLUID MOUSE STATE
    // ========================================================================
    const mouse = {
      x: width * 0.5,
      y: height * 0.35,
      vx: 0,
      vy: 0,
      active: false,
      isDown: false,
      lastX: width * 0.5,
      lastY: height * 0.35,
    };

    const handlePointerMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const newX = e.clientX - rect.left;
      const newY = e.clientY - rect.top;
      mouse.vx = (newX - mouse.x) * 0.35;
      mouse.vy = (newY - mouse.y) * 0.35;
      mouse.x = newX;
      mouse.y = newY;
      mouse.active = true;

      // Check celestial star hit
      let hit = null;
      for (const s of CELESTIAL_STARS) {
        const sx = s.xPct * width;
        const sy = s.yPct * height;
        const r = s.isMoon ? s.radius * 1.5 : s.radius * 2.2;
        const dx = newX - sx;
        const dy = newY - sy;
        if (dx * dx + dy * dy <= r * r) {
          hit = s;
          break;
        }
      }
      setHoveredStar(hit);
    };

    const handlePointerDown = (e) => {
      mouse.isDown = true;
      // Inject stardust burst
      for (let i = 0; i < 28; i++) {
        spawnStardust(mouse.x, mouse.y, true);
      }

      // Check star click
      for (const s of CELESTIAL_STARS) {
        const sx = s.xPct * width;
        const sy = s.yPct * height;
        const r = s.isMoon ? s.radius * 1.8 : s.radius * 2.5;
        const dx = mouse.x - sx;
        const dy = mouse.y - sy;
        if (dx * dx + dy * dy <= r * r) {
          setSelectedStar((prev) => (prev?.id === s.id ? null : s));
          break;
        }
      }
    };

    const handlePointerUp = () => {
      mouse.isDown = false;
    };

    const handlePointerLeave = () => {
      mouse.active = false;
      mouse.isDown = false;
      setHoveredStar(null);
    };

    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointerleave", handlePointerLeave);

    // ========================================================================
    // VAN GOGH IMPASTO COLOR PALETTES
    // ========================================================================
    const SKY_STROKE_COLORS = [
      "rgba(18, 38, 88, 0.85)",   // Deep ultramarine
      "rgba(25, 55, 120, 0.85)",  // Cobalt night
      "rgba(35, 90, 160, 0.88)",  // Cerulean current
      "rgba(60, 130, 200, 0.82)", // Sky blue swirl
      "rgba(90, 175, 230, 0.78)", // Luminous cyan highlight
      "rgba(140, 210, 245, 0.75)",// Whirling frost wave
      "rgba(240, 230, 140, 0.80)",// Cosmic stardust filament
      "rgba(255, 245, 180, 0.85)",// Pure starlight trail
    ];

    // ========================================================================
    // MATHEMATICAL FLOW FIELD OF THE COSMIC WINDS
    // ========================================================================
    function getWindVelocity(x, y, time) {
      let vx = 0;
      let vy = 0;

      // 1. Primary Central Cyclone Vortex (Major Spiral)
      const v1x = width * 0.47;
      const v1y = height * 0.35;
      const dx1 = x - v1x;
      const dy1 = y - v1y;
      const r1 = Math.sqrt(dx1 * dx1 + dy1 * dy1) + 1.0;
      const swirl1 = Math.exp(-r1 / (width * 0.22));
      vx += ((-dy1 / r1) * 1.8 + (dx1 / r1) * 0.15) * swirl1 * 55;
      vy += ((dx1 / r1) * 1.8 + (dy1 / r1) * 0.15) * swirl1 * 55;

      // 2. Secondary Left-Center Vortex
      const v2x = width * 0.29;
      const v2y = height * 0.29;
      const dx2 = x - v2x;
      const dy2 = y - v2y;
      const r2 = Math.sqrt(dx2 * dx2 + dy2 * dy2) + 1.0;
      const swirl2 = Math.exp(-r2 / (width * 0.16));
      vx += ((dy2 / r2) * 1.4 - (dx2 / r2) * 0.20) * swirl2 * 45;
      vy += ((-dx2 / r2) * 1.4 - (dy2 / r2) * 0.20) * swirl2 * 45;

      // 3. Upper Stratospheric Wavy Jet Stream (Left to Right)
      const upperWindY = height * 0.18;
      const distFromJet = Math.abs(y - upperWindY);
      const jetStream = Math.exp(-distFromJet / (height * 0.14));
      const wave = Math.sin(x * 0.0055 + time * 0.8);
      vx += (1.4 + wave * 0.4) * jetStream * 38;
      vy += Math.cos(x * 0.0055 + time * 0.8) * jetStream * 18;

      // 4. Luminous Horizon Wave (above mountains)
      const horizonY = height * 0.56;
      const distFromHorizon = Math.abs(y - horizonY);
      const horizonWind = Math.exp(-distFromHorizon / (height * 0.09));
      vx += 1.8 * horizonWind * 42;
      vy += Math.sin(x * 0.008 - time * 1.1) * horizonWind * 16;

      // 5. General Eastward Cosmic Flow
      vx += 12;
      vy += Math.sin(x * 0.004 + y * 0.006 + time * 0.4) * 8;

      // 6. Interactive Mouse Swirl & Turbulence
      if (mouse.active) {
        const mdx = x - mouse.x;
        const mdy = y - mouse.y;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy) + 1.0;
        const mInfluence = Math.exp(-mDist / 140);
        if (mInfluence > 0.01) {
          vx += ((-mdy / mDist) * 85 + mouse.vx * 1.5) * mInfluence;
          vy += ((mdx / mDist) * 85 + mouse.vy * 1.5) * mInfluence;
        }
      }

      return { vx, vy };
    }

    // ========================================================================
    // BRUSHSTROKE PARTICLES (VAN GOGH IMPASTO DASHES)
    // ========================================================================
    const PARTICLE_COUNT = 2400;
    const particles = [];

    class BrushstrokeParticle {
      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        this.x = initial ? Math.random() * width : Math.random() * -60;
        this.y = Math.random() * (height * 0.68);
        this.age = 0;
        this.maxAge = 70 + Math.random() * 90;
        this.baseLength = 12 + Math.random() * 16;
        this.width = 2.4 + Math.random() * 2.2;
        this.speedMult = 0.75 + Math.random() * 0.55;
        this.colorIdx = Math.floor(Math.random() * SKY_STROKE_COLORS.length);
      }

      update(dt, time, speedFactor) {
        this.age += dt * 60;
        if (this.age >= this.maxAge || this.x > width + 70 || this.y > height * 0.72) {
          this.reset(false);
          return;
        }

        const wind = getWindVelocity(this.x, this.y, time);
        const speed = Math.sqrt(wind.vx * wind.vx + wind.vy * wind.vy) + 0.0001;
        this.angle = Math.atan2(wind.vy, wind.vx);
        this.speed = Math.min(speed, 95);

        this.x += (wind.vx / speed) * this.speed * this.speedMult * dt * speedFactor * 1.2;
        this.y += (wind.vy / speed) * this.speed * this.speedMult * dt * speedFactor * 1.2;
      }

      draw(targetCtx) {
        const lifeRatio = this.age / this.maxAge;
        const alpha = Math.sin(lifeRatio * Math.PI);
        if (alpha <= 0.01) return;

        targetCtx.save();
        targetCtx.translate(this.x, this.y);
        targetCtx.rotate(this.angle);

        targetCtx.globalAlpha = alpha * 0.85;
        targetCtx.fillStyle = SKY_STROKE_COLORS[this.colorIdx];

        const len = this.baseLength;
        const w = this.width;
        targetCtx.beginPath();
        targetCtx.moveTo(-len * 0.5, -w * 0.5);
        targetCtx.quadraticCurveTo(0, w * 0.4, len * 0.5, -w * 0.2);
        targetCtx.quadraticCurveTo(0, -w * 0.6, -len * 0.5, -w * 0.5);
        targetCtx.fill();

        targetCtx.restore();
      }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new BrushstrokeParticle());
    }

    // ========================================================================
    // STARDUST SPARKS (INTERACTIVE TOUCH RESPONSE)
    // ========================================================================
    const stardustArray = [];
    function spawnStardust(x, y, burst = false) {
      const angle = Math.random() * Math.PI * 2;
      const speed = burst ? 2 + Math.random() * 5 : 0.8 + Math.random() * 2;
      stardustArray.push({
        x: x + (Math.random() - 0.5) * 16,
        y: y + (Math.random() - 0.5) * 16,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 1.2 + Math.random() * 2.4,
        alpha: 1,
        decay: 0.016 + Math.random() * 0.02,
        color: Math.random() > 0.4 ? "#fef08a" : "#ffffff",
      });
    }

    // ========================================================================
    // STATIC / REUSABLE BACKGROUND OIL TEXTURE (HILLS & CYPRESS)
    // ========================================================================
    let bgCanvas = document.createElement("canvas");
    let bgLayerCtx = bgCanvas.getContext("2d");

    function initBackgroundLayers() {
      bgCanvas.width = width;
      bgCanvas.height = height;
      if (!bgLayerCtx) return;

      const grad = bgLayerCtx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, "#04091a");
      grad.addColorStop(0.35, "#0b1938");
      grad.addColorStop(0.65, "#0d1f42");
      grad.addColorStop(1, "#03060d");
      bgLayerCtx.fillStyle = grad;
      bgLayerCtx.fillRect(0, 0, width, height);

      drawMountains(bgLayerCtx);
      drawVillage(bgLayerCtx);
    }

    function drawMountains(targetCtx) {
      targetCtx.save();
      const mountainColors = [
        "#0c1a35",
        "#112347",
        "#182e5b",
        "#14264c",
      ];

      for (let ridge = 0; ridge < 3; ridge++) {
        targetCtx.fillStyle = mountainColors[ridge];
        targetCtx.beginPath();
        const baseHeight = height * (0.64 + ridge * 0.04);
        targetCtx.moveTo(0, height);
        targetCtx.lineTo(0, baseHeight);

        for (let x = 0; x <= width; x += 30) {
          const wave1 = Math.sin(x * 0.0035 + ridge * 1.5) * (height * 0.045);
          const wave2 = Math.cos(x * 0.008 - ridge * 0.9) * (height * 0.02);
          targetCtx.lineTo(x, baseHeight + wave1 + wave2);
        }
        targetCtx.lineTo(width, height);
        targetCtx.closePath();
        targetCtx.fill();

        targetCtx.strokeStyle = "rgba(70, 120, 185, 0.28)";
        targetCtx.lineWidth = 2.0;
        targetCtx.stroke();
      }
      targetCtx.restore();
    }

    function drawVillage(targetCtx) {
      targetCtx.save();
      const villageBaseY = height * 0.74;

      targetCtx.fillStyle = "#070c14";
      targetCtx.fillRect(0, villageBaseY, width, height - villageBaseY);

      for (let i = 0; i < 180; i++) {
        const gx = Math.random() * width;
        const gy = villageBaseY + Math.random() * (height - villageBaseY);
        targetCtx.fillStyle =
          Math.random() > 0.5 ? "rgba(18, 38, 30, 0.45)" : "rgba(10, 20, 38, 0.45)";
        targetCtx.fillRect(gx, gy, 20 + Math.random() * 30, 3 + Math.random() * 2);
      }

      // Saint-Rémy Church Steeple
      const steepleX = width * 0.31;
      const steepleTop = height * 0.47;
      const steepleBase = height * 0.76;

      targetCtx.fillStyle = "#09121d";
      targetCtx.strokeStyle = "rgba(35, 65, 100, 0.55)";
      targetCtx.lineWidth = 1.5;

      targetCtx.beginPath();
      targetCtx.moveTo(steepleX, steepleTop);
      targetCtx.lineTo(steepleX - 16, steepleTop + 90);
      targetCtx.lineTo(steepleX + 16, steepleTop + 90);
      targetCtx.closePath();
      targetCtx.fill();
      targetCtx.stroke();

      targetCtx.fillRect(steepleX - 22, steepleTop + 90, 44, steepleBase - (steepleTop + 90));
      targetCtx.strokeRect(steepleX - 22, steepleTop + 90, 44, steepleBase - (steepleTop + 90));

      // Village houses
      const buildings = [
        { x: width * 0.22, w: 46, h: 32 },
        { x: width * 0.26, w: 38, h: 26 },
        { x: width * 0.35, w: 52, h: 34 },
        { x: width * 0.40, w: 42, h: 28 },
        { x: width * 0.46, w: 60, h: 38 },
        { x: width * 0.53, w: 48, h: 30 },
        { x: width * 0.60, w: 56, h: 36 },
        { x: width * 0.68, w: 44, h: 25 },
        { x: width * 0.74, w: 58, h: 32 },
        { x: width * 0.82, w: 50, h: 28 },
      ];

      for (const b of buildings) {
        const by = villageBaseY + 6;
        targetCtx.fillStyle = "#0a131e";
        targetCtx.fillRect(b.x, by, b.w, b.h);
        targetCtx.strokeRect(b.x, by, b.w, b.h);

        targetCtx.beginPath();
        targetCtx.moveTo(b.x - 4, by);
        targetCtx.lineTo(b.x + b.w * 0.5, by - 14);
        targetCtx.lineTo(b.x + b.w + 4, by);
        targetCtx.closePath();
        targetCtx.fillStyle = "#0d1b2a";
        targetCtx.fill();
        targetCtx.stroke();
      }

      targetCtx.restore();
    }

    initBackgroundLayers();

    // ========================================================================
    // FOREGROUND DYNAMIC SWAYING CYPRESS TREE
    // ========================================================================
    function drawCypress(time) {
      ctx.save();
      const cx = width * 0.135;
      const cy = height;
      const treeHeight = height * 0.78;
      const sway = Math.sin(time * 1.3) * (width * 0.012);

      const branches = 48;
      for (let b = 0; b < branches; b++) {
        const frac = b / branches;
        const currentY = cy - frac * treeHeight;
        const currentX = cx + (frac * frac) * sway + Math.sin(frac * 12 + time) * 4;
        const currentWidth = (1 - frac * 0.88) * (width * 0.115);

        ctx.fillStyle = b % 3 === 0 ? "#05130b" : b % 3 === 1 ? "#081d11" : "#0c2818";
        ctx.beginPath();
        ctx.ellipse(
          currentX,
          currentY,
          currentWidth * (0.45 + Math.sin(b * 0.7) * 0.15),
          18 + frac * 10,
          Math.sin(b * 0.5 + time * 0.8) * 0.12,
          0,
          Math.PI * 2
        );
        ctx.fill();

        if (b % 4 === 0) {
          ctx.strokeStyle = "rgba(22, 60, 36, 0.45)";
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.moveTo(currentX - currentWidth * 0.4, currentY);
          ctx.quadraticCurveTo(
            currentX - currentWidth * 0.6,
            currentY - 14,
            currentX - currentWidth * 0.2,
            currentY - 24
          );
          ctx.stroke();
        }
      }

      ctx.restore();
    }

    // ========================================================================
    // WARM FLICKERING HEARTH WINDOWS (SAINT-RÉMY)
    // ========================================================================
    const windows = [
      { x: 0.24, y: 0.77, freq: 2.1 },
      { x: 0.28, y: 0.78, freq: 3.2 },
      { x: 0.36, y: 0.76, freq: 1.8 },
      { x: 0.42, y: 0.77, freq: 2.7 },
      { x: 0.48, y: 0.79, freq: 1.4 },
      { x: 0.55, y: 0.77, freq: 2.9 },
      { x: 0.62, y: 0.78, freq: 2.2 },
      { x: 0.71, y: 0.76, freq: 3.5 },
      { x: 0.76, y: 0.78, freq: 1.9 },
      { x: 0.84, y: 0.77, freq: 2.5 },
    ];

    function drawVillageWindows(time) {
      ctx.save();
      for (const w of windows) {
        const wx = w.x * width;
        const wy = w.y * height;
        const flicker = 0.65 + Math.sin(time * w.freq) * 0.25 + Math.cos(time * 4.8) * 0.1;
        ctx.fillStyle = `rgba(245, 158, 11, ${flicker})`;
        ctx.fillRect(wx, wy, 4.5, 4.5);

        ctx.beginPath();
        ctx.arc(wx + 2.2, wy + 2.2, 7.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251, 191, 36, ${flicker * 0.35})`;
        ctx.fill();
      }
      ctx.restore();
    }

    // ========================================================================
    // THE TWINKLING CELESTIAL STARS & ROTATING HALO RINGS
    // ========================================================================
    function drawStars(time) {
      for (const s of CELESTIAL_STARS) {
        const sx = s.xPct * width;
        const sy = s.yPct * height;
        const isHovered = hoveredStar?.id === s.id;
        const isSelected = selectedStar?.id === s.id;

        const twinkle = Math.sin(time * s.twinkleFreq * 2.5) * 0.25 + 0.95;
        const scale = isHovered || isSelected ? 1.25 : 1.0;
        const coreR = s.radius * scale;

        ctx.save();
        ctx.translate(sx, sy);

        if (s.isMoon) {
          for (let ring = 1; ring <= 5; ring++) {
            const ringR = coreR * (1.1 + ring * 0.42);
            const ringAngle = time * (0.2 + ring * 0.08) * (ring % 2 === 0 ? 1 : -1);
            const dashCount = 28 + ring * 8;

            ctx.save();
            ctx.rotate(ringAngle);
            ctx.strokeStyle = ring % 2 === 0 ? "rgba(254, 240, 138, 0.45)" : "rgba(245, 158, 11, 0.42)";
            ctx.lineWidth = 3.2;

            for (let d = 0; d < dashCount; d++) {
              if (d % 2 === 0) continue;
              const a = (d / dashCount) * Math.PI * 2;
              const x1 = Math.cos(a) * ringR;
              const y1 = Math.sin(a) * ringR;
              const x2 = Math.cos(a + 0.12) * ringR;
              const y2 = Math.sin(a + 0.12) * ringR;
              ctx.beginPath();
              ctx.moveTo(x1, y1);
              ctx.lineTo(x2, y2);
              ctx.stroke();
            }
            ctx.restore();
          }

          const moonGlow = ctx.createRadialGradient(0, 0, coreR * 0.2, 0, 0, coreR * 2.8);
          moonGlow.addColorStop(0, "rgba(255, 250, 200, 0.85)");
          moonGlow.addColorStop(0.45, "rgba(245, 158, 11, 0.55)");
          moonGlow.addColorStop(1, "rgba(245, 158, 11, 0)");
          ctx.fillStyle = moonGlow;
          ctx.beginPath();
          ctx.arc(0, 0, coreR * 2.8, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#fef08a";
          ctx.beginPath();
          ctx.arc(0, 0, coreR, -Math.PI * 0.45, Math.PI * 0.55);
          ctx.arc(coreR * 0.38, -coreR * 0.08, coreR * 0.88, Math.PI * 0.55, -Math.PI * 0.45, true);
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2.4;
          ctx.stroke();
        } else {
          const rings = s.haloRings;
          for (let r = 1; r <= rings; r++) {
            const ringR = coreR * (1.2 + r * 0.55) * twinkle;
            const rot = time * (0.35 + r * 0.12) * (r % 2 === 0 ? 1 : -1);
            const dashCount = 16 + r * 6;

            ctx.save();
            ctx.rotate(rot);
            ctx.strokeStyle =
              r === 1
                ? "rgba(255, 255, 255, 0.65)"
                : r % 2 === 0
                ? "rgba(254, 240, 138, 0.48)"
                : "rgba(245, 158, 11, 0.38)";
            ctx.lineWidth = 2.4;

            for (let d = 0; d < dashCount; d++) {
              if (d % 2 === 0) continue;
              const a = (d / dashCount) * Math.PI * 2;
              const x1 = Math.cos(a) * ringR;
              const y1 = Math.sin(a) * ringR;
              const x2 = Math.cos(a + 0.16) * ringR;
              const y2 = Math.sin(a + 0.16) * ringR;
              ctx.beginPath();
              ctx.moveTo(x1, y1);
              ctx.lineTo(x2, y2);
              ctx.stroke();
            }
            ctx.restore();
          }

          const starGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, coreR * 1.8);
          starGrad.addColorStop(0, "#ffffff");
          starGrad.addColorStop(0.35, s.glow);
          starGrad.addColorStop(1, "rgba(254, 240, 138, 0)");
          ctx.fillStyle = starGrad;
          ctx.beginPath();
          ctx.arc(0, 0, coreR * 1.8, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(0, 0, coreR * 0.48 * twinkle, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
          ctx.lineWidth = 1.4;
          const spikeLen = coreR * 1.6 * twinkle;
          ctx.beginPath();
          ctx.moveTo(-spikeLen, 0);
          ctx.lineTo(spikeLen, 0);
          ctx.moveTo(0, -spikeLen);
          ctx.lineTo(0, spikeLen);
          ctx.stroke();
        }

        if (isHovered || isSelected) {
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1.6;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.arc(0, 0, coreR * 2.8, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        ctx.restore();
      }
    }

    // ========================================================================
    // MAIN LIVE ANIMATION LOOP (60 FPS)
    // ========================================================================
    let lastTime = performance.now();
    let totalTime = 0;

    const render = (now) => {
      const dt = Math.min((now - lastTime) * 0.001, 0.033);
      lastTime = now;
      totalTime += dt;

      ctx.drawImage(bgCanvas, 0, 0);

      ctx.fillStyle = "rgba(6, 12, 28, 0.16)";
      ctx.fillRect(0, 0, width, height * 0.70);

      const speedFactor = windSpeedMode;
      for (const p of particles) {
        p.update(dt, totalTime, speedFactor);
        p.draw(ctx);
      }

      if (mouse.active && (Math.abs(mouse.vx) > 0.5 || Math.abs(mouse.vy) > 0.5)) {
        spawnStardust(mouse.x, mouse.y, false);
      }
      for (let i = stardustArray.length - 1; i >= 0; i--) {
        const s = stardustArray[i];
        s.x += s.vx;
        s.y += s.vy;
        s.alpha -= s.decay;
        if (s.alpha <= 0) {
          stardustArray.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = s.alpha;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      drawStars(totalTime);
      drawVillageWindows(totalTime);
      drawCypress(totalTime);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
      try {
        audioCtxRef.current?.close();
      } catch (e) {}
    };
  }, [windSpeedMode]);

  return (
    <div className="starry-night-root">
      <canvas ref={canvasRef} className="starry-canvas" />

      {/* Top Floating Glass Navigation Header */}
      <nav className="starry-nav-bar">
        <Link href="/" className="starry-back-btn">
          <span className="starry-back-arrow">←</span>
          <span className="starry-back-label">KRROBIUS (3D MANIFOLD)</span>
        </Link>

        <div className="starry-header-center">
          <span className="starry-badge">LIVE IMPASTO SIMULATION</span>
          <h1 className="starry-header-title">THE STARRY NIGHT</h1>
          <span className="starry-header-sub">VINCENT VAN GOGH // JUNE 1889</span>
        </div>

        <div className="starry-nav-actions">
          <button
            onClick={toggleSound}
            className={`starry-action-pill ${soundEnabled ? "active" : ""}`}
            title="Toggle nocturnal atmospheric breeze"
          >
            <span className="starry-action-icon">{soundEnabled ? "🔊" : "🔇"}</span>
            <span className="starry-action-text">{soundEnabled ? "WIND ON" : "WIND SOUND"}</span>
          </button>

          <button
            onClick={() => setWindSpeedMode((m) => (m === 1 ? 1.6 : m === 1.6 ? 0.6 : 1))}
            className="starry-action-pill"
            title="Cycle wind velocity"
          >
            <span className="starry-action-icon">💨</span>
            <span className="starry-action-text">
              {windSpeedMode === 1 ? "GALE: NORMAL" : windSpeedMode === 1.6 ? "GALE: FAST" : "GALE: CALM"}
            </span>
          </button>

          <button
            onClick={() => setShowPortfolioDrawer((v) => !v)}
            className="starry-action-pill highlight"
          >
            <span className="starry-action-icon">✦</span>
            <span className="starry-action-text">
              {showPortfolioDrawer ? "HIDE DOSSIER" : "PORTFOLIO DOSSIER"}
            </span>
          </button>
        </div>
      </nav>

      {/* Interactive Celestial Constellation Card (When Star Hovered/Selected) */}
      {(hoveredStar || selectedStar) && (
        <div className="starry-star-card">
          <div className="starry-card-header">
            <span className="starry-card-tag">{(selectedStar || hoveredStar).role}</span>
            <span className="starry-card-coord">
              [X: {Math.round((selectedStar || hoveredStar).xPct * 100)}% | Y: {Math.round((selectedStar || hoveredStar).yPct * 100)}%]
            </span>
          </div>
          <h3 className="starry-card-title">{(selectedStar || hoveredStar).title}</h3>
          <p className="starry-card-summary">{(selectedStar || hoveredStar).summary}</p>
          <div className="starry-card-footer">
            <span className="starry-card-hint">
              {selectedStar ? "CLICK ANYWHERE TO DISMISS" : "CLICK STAR TO LOCK FOCUS"}
            </span>
          </div>
        </div>
      )}

      {/* Bottom Subtle Interaction Guide */}
      <footer className="starry-bottom-guide">
        <p className="starry-guide-text">
          DRAG CURSOR TO SWIRL COSMIC WINDS // CLICK STARS TO EXPLORE PORTFOLIO // IMPASTO VECTOR DYNAMICS
        </p>
      </footer>

      {/* Comprehensive Portfolio Slide-Over Dossier */}
      {showPortfolioDrawer && (
        <aside className="starry-dossier-drawer">
          <div className="starry-dossier-inner">
            <div className="starry-dossier-head">
              <div>
                <span className="starry-badge">ENGINEERING & ARTISTRY</span>
                <h2 className="starry-dossier-title">KRRISH DUBEY</h2>
                <p className="starry-dossier-subtitle">FULL-STACK & CREATIVE 3D GRAPHICS ARCHITECT</p>
              </div>
              <button
                onClick={() => setShowPortfolioDrawer(false)}
                className="starry-dossier-close"
              >
                ✕
              </button>
            </div>

            <div className="starry-dossier-body">
              <section className="starry-dossier-section">
                <h4 className="starry-section-title">ABOUT // VISION</h4>
                <p className="starry-dossier-para">
                  Specialized in mathematical geometry, WebGL shader pipelines, real-time particle vector fields,
                  and scalable interactive web experiences. Driven by the confluence of computational topology
                  and expressive human art.
                </p>
              </section>

              <section className="starry-dossier-section">
                <h4 className="starry-section-title">SELECTED WORKS</h4>
                <div className="starry-project-grid">
                  <div className="starry-project-card">
                    <span className="starry-project-tag">TOPOLOGY</span>
                    <h5 className="starry-project-name">Krrobius Infinite Manifold</h5>
                    <p className="starry-project-desc">
                      Real-time parametric closed Möbius strip with dynamic longitudinal UV grid animation,
                      camera-facing glyph tokens, and 60 FPS batched vector curl fields.
                    </p>
                  </div>
                  <div className="starry-project-card">
                    <span className="starry-project-tag">PHYSICS SIM</span>
                    <h5 className="starry-project-name">The Starry Night Fluid Simulation</h5>
                    <p className="starry-project-desc">
                      Impasto brushstroke vector field recreating Van Gogh's Kolmogorov turbulence eddies,
                      pulsating celestial star halos, and interactive wind disturbance.
                    </p>
                  </div>
                  <div className="starry-project-card">
                    <span className="starry-project-tag">LABORATORY</span>
                    <h5 className="starry-project-name">Interactive 3D Playground</h5>
                    <p className="starry-project-desc">
                      Hardware-accelerated shader laboratory featuring procedural raymarching, audio-reactive
                      geometry, and custom canvas render passes.
                    </p>
                    <a
                      href="/portfolio/playground.html"
                      className="starry-project-link"
                    >
                      OPEN PLAYGROUND →
                    </a>
                  </div>
                </div>
              </section>

              <section className="starry-dossier-section">
                <h4 className="starry-section-title">CORE COMPETENCIES</h4>
                <div className="starry-chips">
                  <span>Three.js / WebGL</span>
                  <span>GLSL Shaders</span>
                  <span>Next.js (Turbopack)</span>
                  <span>React 19</span>
                  <span>Computational Geometry</span>
                  <span>Vector Fields</span>
                  <span>Web Audio API</span>
                  <span>TypeScript / JavaScript</span>
                  <span>Python & C++</span>
                  <span>Performance Optimization</span>
                </div>
              </section>

              <section className="starry-dossier-section">
                <h4 className="starry-section-title">CONNECT & COLLABORATE</h4>
                <div className="starry-contact-row">
                  <a
                    href="mailto:contact@theskepticgeek.com"
                    className="starry-contact-pill"
                  >
                    EMAIL ME
                  </a>
                  <a
                    href="https://github.com/theskepticgeek"
                    target="_blank"
                    rel="noreferrer"
                    className="starry-contact-pill"
                  >
                    GITHUB
                  </a>
                  <Link href="/" className="starry-contact-pill highlight">
                    RETURN TO KRROBIUS STRIP
                  </Link>
                </div>
              </section>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
