import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPng(size: number, bgColor: [number, number, number], innerColor: [number, number, number]): Buffer {
  const width = size;
  const height = size;

  // Raw RGBA buffer
  const rgbaBuffer = Buffer.alloc(width * height * 4);

  const cx = width / 2;
  const cy = height / 2;
  const rOuter = width * 0.44;
  const rInner = width * 0.22;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= rInner) {
        // Inner amber dot
        rgbaBuffer[idx] = innerColor[0];
        rgbaBuffer[idx + 1] = innerColor[1];
        rgbaBuffer[idx + 2] = innerColor[2];
        rgbaBuffer[idx + 3] = 255;
      } else if (dist <= rOuter && dist >= rOuter - Math.max(1.5, size * 0.1)) {
        // Outer glowing ring
        rgbaBuffer[idx] = bgColor[0];
        rgbaBuffer[idx + 1] = bgColor[1];
        rgbaBuffer[idx + 2] = bgColor[2];
        rgbaBuffer[idx + 3] = 255;
      } else {
        // Transparent
        rgbaBuffer[idx] = 0;
        rgbaBuffer[idx + 1] = 0;
        rgbaBuffer[idx + 2] = 0;
        rgbaBuffer[idx + 3] = 0;
      }
    }
  }

  // Build PNG chunks
  // Scanlines with filter byte 0 (None)
  const scanlines = Buffer.alloc(height * (1 + width * 4));
  let scanlineOffset = 0;
  let rgbaOffset = 0;

  for (let y = 0; y < height; y++) {
    scanlines[scanlineOffset++] = 0; // Filter: None
    rgbaBuffer.copy(scanlines, scanlineOffset, rgbaOffset, rgbaOffset + width * 4);
    scanlineOffset += width * 4;
    rgbaOffset += width * 4;
  }

  const compressedData = zlib.deflateSync(scanlines);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // 8 bit depth
  ihdr.writeUInt8(6, 9); // RGBA color type
  ihdr.writeUInt8(0, 10); // Compression method
  ihdr.writeUInt8(0, 11); // Filter method
  ihdr.writeUInt8(0, 12); // Interlace method

  function createChunk(type: string, data: Buffer): Buffer {
    const chunkLen = data.length;
    const chunk = Buffer.alloc(4 + 4 + chunkLen + 4);
    chunk.writeUInt32BE(chunkLen, 0);
    chunk.write(type, 4);
    data.copy(chunk, 8);

    // CRC
    const crc = crc32(chunk.subarray(4, 8 + chunkLen));
    chunk.writeUInt32BE(crc, 8 + chunkLen);
    return chunk;
  }

  // CRC32 implementation
  function crc32(buf: Buffer): number {
    let c = -1;
    for (let i = 0; i < buf.length; i++) {
      c ^= buf[i];
      for (let k = 0; k < 8; k++) {
        c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
      }
    }
    return (c ^ -1) >>> 0;
  }

  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const iconsDir = path.resolve(process.cwd(), 'public/icons');
fs.mkdirSync(iconsDir, { recursive: true });

// Ring: #3B82F6 [59, 130, 246], Dot: #F59E0B [245, 158, 11]
const sizes = [16, 48, 128];
sizes.forEach((size) => {
  const pngBuf = createPng(size, [59, 130, 246], [245, 158, 11]);
  fs.writeFileSync(path.join(iconsDir, `icon${size}.png`), pngBuf);
  console.log(`Generated icon${size}.png (${pngBuf.length} bytes)`);
});
