export const profiles = Object.freeze({
  network: { rea: false, copy: false, visual: false, visualCheckpoints: 'final', purpose: 'Request/response investigation; cheapest browser pass.' },
  behavior: { rea: false, copy: false, visual: true, visualCheckpoints: 'final', purpose: 'Correlate network behavior with final DOM and viewport pixels.' },
  full: { rea: true, copy: true, copyMode: 'same-state', captureTargets: true, visual: true, visualCheckpoints: 'all', purpose: 'Broad script, worker/frame, same-state CSS/assets, layout and behavior evidence.' },
});

export function captureProfile(name) {
  if (!Object.hasOwn(profiles, name)) throw new Error(`Unknown profile; choose ${Object.keys(profiles).join(', ')}`);
  return { ...profiles[name] };
}
