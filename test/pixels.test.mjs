import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { comparePixels } from '../src/pixels.mjs';

test('pixel comparison counts changed pixels, tolerates small channel differences and flags dimensions', async () => {
  const image = async (red, width = 2) => sharp({ create: { width, height: 1, channels: 4, background: { r: red, g: 0, b: 0, alpha: 1 } } }).png().toBuffer();
  const a = await image(0), close = await image(5), changed = await image(255);
  assert.equal((await comparePixels(a, a)).changedPixels, 0);
  assert.equal((await comparePixels(a, close)).changedPixels, 0);
  assert.equal((await comparePixels(a, changed)).changedPixels, 2);
  assert.equal((await comparePixels(a, await image(0, 3))).comparable, false);
});
