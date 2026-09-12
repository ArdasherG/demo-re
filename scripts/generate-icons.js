import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPNG(width, height, drawFn) {
  // RGBA buffer
  const rgba = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const pixel = drawFn(x, y, width, height);
      rgba[idx] = pixel.r;
      rgba[idx + 1] = pixel.g;
      rgba[idx + 2] = pixel.b;
      rgba[idx + 3] = pixel.a;
    }
  }

  // Scanlines with filter byte 0 (None)
  const rowBytes = width * 4 + 1;
  const rawData = Buffer.alloc(rowBytes * height);
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    rawData[rowOffset] = 0; // Filter None
    rgba.copy(rawData, rowOffset + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressedData = zlib.deflateSync(rawData);

  // PNG Header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth
  ihdr[9] = 6; // ColorType RGBA
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const crc = crc32(buf.subarray(4, 8 + len));
  buf.writeInt32BE(crc, 8 + len);
  return buf;
}

// Standard CRC32
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    const byte = buf[i];
    crc ^= byte;
    for (let j = 0; j < 8; j++) {
      const mask = -(crc & 1);
      crc = (crc >>> 1) ^ (0xedb88320 & mask);
    }
  }
  return (crc ^ 0xffffffff) | 0;
}

// Icon drawer: Smooth blue circle with white checkmark
function drawIcon(x, y, w, h, isMaskable = false) {
  const cx = w / 2;
  const cy = h / 2;
  const r = isMaskable ? w * 0.46 : w * 0.42;

  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Background gradient: Rich modern blue to indigo
  const bgT = y / h;
  const bgR = Math.round(59 + (79 - 59) * bgT);
  const bgG = Math.round(130 + (70 - 130) * bgT);
  const bgB = Math.round(246 + (229 - 246) * bgT);

  if (isMaskable) {
    // Full background
    // Checkmark in center
    if (inCheckmark(x, y, cx, cy, w * 0.28)) {
      return { r: 255, g: 255, b: 255, a: 255 };
    }
    return { r: bgR, g: bgG, b: bgB, a: 255 };
  }

  // Rounded squircle / circle
  if (dist <= r) {
    // Inside circle
    if (inCheckmark(x, y, cx, cy, w * 0.28)) {
      return { r: 255, g: 255, b: 255, a: 255 };
    }
    return { r: bgR, g: bgG, b: bgB, a: 255 };
  } else if (dist <= r + 1.2) {
    const alpha = Math.max(0, Math.min(255, Math.round((r + 1.2 - dist) * 255)));
    return { r: bgR, g: bgG, b: bgB, a: alpha };
  }

  return { r: 0, g: 0, b: 0, a: 0 };
}

function inCheckmark(x, y, cx, cy, size) {
  // Checkmark vertices: P1 (-0.7*s, -0.1*s), P2 (-0.1*s, 0.5*s), P3 (0.8*s, -0.5*s)
  const p1 = { x: cx - size * 0.65, y: cy - size * 0.05 };
  const p2 = { x: cx - size * 0.15, y: cy + size * 0.45 };
  const p3 = { x: cx + size * 0.65, y: cy - size * 0.45 };
  const thickness = size * 0.22;

  return distToSegment(x, y, p1.x, p1.y, p2.x, p2.y) < thickness / 2 ||
         distToSegment(x, y, p2.x, p2.y, p3.x, p3.y) < thickness / 2;
}

function distToSegment(px, py, x1, y1, x2, y2) {
  const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
}

const outDir = path.resolve('public');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(path.join(outDir, 'pwa-192x192.png'), createPNG(192, 192, (x, y, w, h) => drawIcon(x, y, w, h, false)));
fs.writeFileSync(path.join(outDir, 'pwa-512x512.png'), createPNG(512, 512, (x, y, w, h) => drawIcon(x, y, w, h, false)));
fs.writeFileSync(path.join(outDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, (x, y, w, h) => drawIcon(x, y, w, h, true)));
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), createPNG(180, 180, (x, y, w, h) => drawIcon(x, y, w, h, false)));

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
fs.writeFileSync(path.join(outDir, 'favicon.svg'), svgContent);
fs.writeFileSync(path.join(outDir, 'favicon.ico'), createPNG(32, 32, (x, y, w, h) => drawIcon(x, y, w, h, false)));

console.log('Icons generated successfully in public/');
