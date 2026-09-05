// ========== CONFIGURATION ==========
const canvas = document.getElementById('mobiusCanvas');
const ctx = canvas.getContext('2d');

// Canvas size
const W = 800;
const H = 600;
canvas.width = W;
canvas.height = H;

// Möbius strip parameters
const R = 120;            // radius of centre circle
const halfWidth = 40;     // half‑width of the strip
const tSegments = 60;     // number of segments along the loop
const sSegments = 8;      // number of segments across width

// Projection
const fov = 300;          // focal length (perspective)
const cx = W / 2;
const cy = H / 2;

// Rotation
let angle = 0;
const rotationSpeed = 0.01;

// ========== HELPER: 3D point rotation around Y axis ==========
function rotateY(point, angle) {
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  return {
    x: point.x * cosA + point.z * sinA,
    y: point.y,
    z: -point.x * sinA + point.z * cosA
  };
}

// ========== GENERATE MÖBIUS STRIP VERTICES ==========
// We'll store vertices as arrays [x, y, z] in world space (unrotated)
const vertices = [];
const normals = [];   // normals for each vertex (unrotated, but will be rotated later)

for (let i = 0; i <= tSegments; i++) {
  const t = (i / tSegments) * 2 * Math.PI;
  for (let j = 0; j <= sSegments; j++) {
    const s = -halfWidth + (j / sSegments) * 2 * halfWidth;

    // Position
    const x = (R + s * Math.cos(t / 2)) * Math.cos(t);
    const y = (R + s * Math.cos(t / 2)) * Math.sin(t);
    const z = s * Math.sin(t / 2);
    vertices.push({ x, y, z });

    // Analytical normal (derived from cross product of partial derivatives)
    // For simplicity, we compute numerically here
    const dt = 0.001;
    const t2 = t + dt;
    const x1 = (R + s * Math.cos(t / 2)) * Math.cos(t);
    const y1 = (R + s * Math.cos(t / 2)) * Math.sin(t);
    const z1 = s * Math.sin(t / 2);
    const x2 = (R + s * Math.cos(t2 / 2)) * Math.cos(t2);
    const y2 = (R + s * Math.cos(t2 / 2)) * Math.sin(t2);
    const z2 = s * Math.sin(t2 / 2);
    const dxdt = (x2 - x1) / dt;
    const dydt = (y2 - y1) / dt;
    const dzdt = (z2 - z1) / dt;

    const ds = 0.001;
    const s2 = s + ds;
    const x3 = (R + s2 * Math.cos(t / 2)) * Math.cos(t);
    const y3 = (R + s2 * Math.cos(t / 2)) * Math.sin(t);
    const z3 = s2 * Math.sin(t / 2);
    const dxds = (x3 - x1) / ds;
    const dyds = (y3 - y1) / ds;
    const dzds = (z3 - z1) / ds;

    const nx = dydt * dzds - dzdt * dyds;
    const ny = dzdt * dxds - dxdt * dzds;
    const nz = dxdt * dyds - dydt * dxds;
    // Normalize
    const len = Math.sqrt(nx*nx + ny*ny + nz*nz);
    normals.push({ x: nx/len, y: ny/len, z: nz/len });
  }
}

// ========== BUILD TRIANGLES ==========
const triangles = [];
for (let i = 0; i < tSegments; i++) {
  for (let j = 0; j < sSegments; j++) {
    const a = i * (sSegments + 1) + j;
    const b = a + 1;
    const c = (i + 1) * (sSegments + 1) + j;
    const d = c + 1;

    // Two triangles per quad (a-b-c and b-d-c)
    triangles.push([a, b, c]);
    triangles.push([b, d, c]);
  }
}

// ========== ANIMATION LOOP ==========
function draw() {
  // Clear canvas
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  // Rotate all vertices and normals around Y axis
  const rotatedVertices = vertices.map(v => rotateY(v, angle));
  const rotatedNormals = normals.map(n => rotateY(n, angle));

  // Project vertices to screen coordinates and store depth
  const projected = rotatedVertices.map((v, index) => {
    const scale = fov / (fov + v.z);  // perspective projection (camera at z = -fov)
    const sx = v.x * scale + cx;
    const sy = -v.y * scale + cy;      // flip y for canvas
    return { x: sx, y: sy, depth: v.z };
  });

  // For each triangle, compute face normal (average of vertex normals),
  // determine if facing camera (z-component > 0 after rotation),
  // and draw filled polygon with appropriate colour.
  const triangleData = triangles.map(tri => {
    const [i1, i2, i3] = tri;
    const v1 = rotatedVertices[i1];
    const v2 = rotatedVertices[i2];
    const v3 = rotatedVertices[i3];
    const n1 = rotatedNormals[i1];
    const n2 = rotatedNormals[i2];
    const n3 = rotatedNormals[i3];

    // Face normal = average of vertex normals
    const faceNormal = {
      x: (n1.x + n2.x + n3.x) / 3,
      y: (n1.y + n2.y + n3.y) / 3,
      z: (n1.z + n2.z + n3.z) / 3
    };

    // Compute centre depth for sorting
    const depth = (v1.z + v2.z + v3.z) / 3;

    // Determine facing: camera looks along +z (since vertices are in front of camera)
    // If faceNormal.z > 0, it faces the camera → white, else grey.
    const facingCamera = faceNormal.z > 0;

    return {
      indices: tri,
      depth,
      facingCamera,
      p1: projected[i1],
      p2: projected[i2],
      p3: projected[i3]
    };
  });

  // Sort triangles back‑to‑front (painter's algorithm)
  triangleData.sort((a, b) => b.depth - a.depth);

  // Draw triangles
  for (const tri of triangleData) {
    ctx.beginPath();
    ctx.moveTo(tri.p1.x, tri.p1.y);
    ctx.lineTo(tri.p2.x, tri.p2.y);
    ctx.lineTo(tri.p3.x, tri.p3.y);
    ctx.closePath();

    // Fill with white or grey
    ctx.fillStyle = tri.facingCamera ? '#ffffff' : '#808080';
    ctx.fill();

    // Optional: add thin stroke to hide gaps between triangles
    ctx.strokeStyle = tri.facingCamera ? '#ffffff' : '#606060';
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  // Increment rotation angle
  angle += rotationSpeed;

  requestAnimationFrame(draw);
}

// Start animation
draw();