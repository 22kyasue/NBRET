import sharp from 'sharp';

export async function comparePixels(before, after, { channelTolerance = 8 } = {}) {
  if (!Number.isInteger(channelTolerance) || channelTolerance < 0 || channelTolerance > 255) throw new Error('Pixel channel tolerance must be 0..255');
  const decode = input => sharp(input, { limitInputPixels: 20000000 }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const [a, b] = await Promise.all([decode(before), decode(after)]);
  if (a.info.width !== b.info.width || a.info.height !== b.info.height) return { comparable: false, reason: 'image-dimensions-differ', before: { width: a.info.width, height: a.info.height }, after: { width: b.info.width, height: b.info.height } };
  let changedPixels = 0;
  for (let i = 0; i < a.data.length; i += 4) {
    if ([0, 1, 2, 3].some(c => Math.abs(a.data[i + c] - b.data[i + c]) > channelTolerance)) changedPixels++;
  }
  const totalPixels = a.info.width * a.info.height;
  return { comparable: true, changedPixels, totalPixels, changedFraction: changedPixels / totalPixels, channelTolerance,
    limitation: 'Raw pixel difference, not a perceptual quality or reconstruction-fidelity score. Dynamic content and rendering environments affect results.' };
}
