// /src/js/audio.js
let audioCtx = null;
let masterGain = null;
let enabled = true;
let masterVolume = 0.8;

export function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = masterVolume;
    masterGain.connect(audioCtx.destination);
  }
  return audioCtx;
}

export function setMasterVolume(v) {
  masterVolume = Math.max(0, Math.min(1, Number(v)));
  if (masterGain) masterGain.gain.value = masterVolume;
  try { localStorage.setItem('prefs.sfxVolume', masterVolume); } catch {}
}

export function toggleEnabled(val) {
  if (typeof val === 'boolean') enabled = val;
  else enabled = !enabled;
  try { localStorage.setItem('prefs.sfxEnabled', enabled ? '1' : '0'); } catch {}
  return enabled;
}

function makeNodes({ type = 'square', freq = 440, volume = 0.2 }) {
  initAudio();
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  g.gain.setValueAtTime(volume, audioCtx.currentTime);
  osc.connect(g);
  g.connect(masterGain);
  return { osc, g };
}

export function playBeep(freq = 440, duration = 0.12, type = 'square', volume = 0.2) {
  if (!enabled) return;
  initAudio();
  try {
    const now = audioCtx.currentTime;
    const { osc, g } = makeNodes({ type, freq, volume });
    osc.start(now);
    g.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.stop(now + duration + 0.02);
  } catch (e) { /* noop */ }
}

export function playClick() { playBeep(720, 0.08, 'sawtooth', 0.18); }
export function playHover() { playBeep(880, 0.06, 'triangle', 0.09); }

export function resumeAudioOnGesture() {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume().catch(()=>{});
}

export function getPrefs() {
  try {
    const v = localStorage.getItem('prefs.sfxVolume');
    const e = localStorage.getItem('prefs.sfxEnabled');
    if (v !== null) masterVolume = Number(v);
    if (e !== null) enabled = e === '1';
    if (masterGain) masterGain.gain.value = masterVolume;
  } catch {}
  return { enabled, masterVolume };
}
