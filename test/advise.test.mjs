import test from 'node:test';
import assert from 'node:assert/strict';
import { adviseCapture } from '../src/advise.mjs';
test('tool advice preserves required coverage even when an insufficient profile is cheaper',()=>{
  const benchmark={verified:true,aggregates:[{profile:'network',samples:3,medianMs:1},{profile:'behavior',samples:3,medianMs:2},{profile:'full',samples:3,medianMs:3}]};
  assert.equal(adviseCapture(['targets','css'],benchmark).selected,'full');
  assert.equal(adviseCapture(['dom'],benchmark).selected,'behavior');
  assert.equal(adviseCapture(['binary-protocol'],benchmark).selected,null);
  assert.equal(adviseCapture(['http'],{verified:false,aggregates:benchmark.aggregates}).costs.length,0);
});
