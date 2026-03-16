import { decode as decodePng } from 'fast-png';
import { decode as decodeJpeg } from 'jpeg-js';
import { readFileSync } from 'fs';

export interface DecodedImage {
  width: number;
  height: number;
  /** RGBA pixel data, 4 bytes per pixel */
  data: Uint8Array;
}

type ImageFormat = 'png' | 'jpeg';

function detectFormat(buffer: Uint8Array): ImageFormat {
  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return 'png';
  }
  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return 'jpeg';
  }
  throw new Error('Unsupported image format. Only PNG and JPEG are supported.');
}

function decodePngImage(buffer: Uint8Array): DecodedImage {
  const png = decodePng(buffer);
  const { width, height, data, channels } = png;

  if (channels === 4) {
    return { width, height, data: new Uint8Array(data.buffer, data.byteOffset, data.byteLength) };
  }

  // Convert RGB (3 channels) to RGBA
  const rgba = new Uint8Array(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    rgba[i * 4] = data[i * channels];
    rgba[i * 4 + 1] = data[i * channels + 1];
    rgba[i * 4 + 2] = data[i * channels + 2];
    rgba[i * 4 + 3] = channels >= 4 ? data[i * channels + 3] : 255;
  }
  return { width, height, data: rgba };
}

function decodeJpegImage(buffer: Uint8Array): DecodedImage {
  const jpg = decodeJpeg(buffer, { useTArray: true, formatAsRGBA: true });
  return { width: jpg.width, height: jpg.height, data: jpg.data };
}

export function decodeImage(filePath: string): DecodedImage {
  const buffer = new Uint8Array(readFileSync(filePath));
  const format = detectFormat(buffer);

  if (format === 'png') return decodePngImage(buffer);
  return decodeJpegImage(buffer);
}
