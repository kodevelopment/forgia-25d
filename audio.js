const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let musicaAttiva = true;
let stepMusica = 0;

function sbloccaAudio() {
  if (audioCtx.state === 'suspended') audioCtx.resume();
}
window.addEventListener('keydown', sbloccaAudio, { once: true });
window.addEventListener('click', sbloccaAudio, { once: true });

function suonaNota(freq, durata, tipo = "triangle", volume = 0.06, delay = 0) {
  if (!musicaAttiva || !freq) return;
  sbloccaAudio();
  const now = audioCtx.currentTime + delay;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = tipo;
  osc.frequency.setValueAtTime(freq, now);
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durata);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + durata);
}

const SFX = {
  piccone: () => {
    suonaNota(180, 0.08, "triangle", 0.14);
    suonaNota(110, 0.1, "square", 0.06, 0.03);
  },
  dropRaro: () => {
    suonaNota(587.33, 0.15, "triangle", 0.12, 0);
    suonaNota(739.99, 0.15, "triangle", 0.12, 0.1);
    suonaNota(880.00, 0.28, "triangle", 0.14, 0.2);
  },
  forgia: () => {
    suonaNota(880, 0.12, "triangle", 0.16, 0);
    suonaNota(1318.5, 0.35, "sine", 0.14, 0.05);
  },
  spada: () => {
    suonaNota(320, 0.09, "sawtooth", 0.1);
    suonaNota(160, 0.12, "triangle", 0.1, 0.04);
  },
  corsa: () => {
    if (!musicaAttiva) return;
    sbloccaAudio();
    const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.06, audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    const filter = audioCtx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(600, audioCtx.currentTime);
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.035, audioCtx.currentTime);
    src.connect(filter); filter.connect(gain); gain.connect(audioCtx.destination);
    src.start();
  },
  scatto: () => {
    if (!musicaAttiva) return;
    sbloccaAudio();
    const dur = 0.18;
    const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * dur, audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.sin((i / data.length) * Math.PI);
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    const filter = audioCtx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(300, audioCtx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(1400, audioCtx.currentTime + dur);
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.14, audioCtx.currentTime);
    src.connect(filter); filter.connect(gain); gain.connect(audioCtx.destination);
    src.start();
  },
  cura: () => {
    suonaNota(440, 0.18, "sine", 0.1, 0);
    suonaNota(554.37, 0.18, "sine", 0.1, 0.12);
    suonaNota(659.25, 0.3, "sine", 0.12, 0.24);
  },
  voceNPC: (lunghezzaTesto = 25) => {
    const caratteri = Math.min(28, Math.max(8, Math.floor(lunghezzaTesto / 3)));
    for (let i = 0; i < caratteri; i++) {
      const tono = 380 + (i % 4) * 45 + Math.random() * 30;
      suonaNota(tono, 0.035, "square", 0.035, i * 0.038);
    }
  }
};

// Melodie Medievali Villaggio (Scala Dorica Celtica)
const V1_VILLAGGIO = [
  587.33, 0, 659.25, 698.46, 783.99, 0, 698.46, 659.25,
  587.33, 523.25, 587.33, 0, 659.25, 0, 587.33, 0,
  880.00, 0, 783.99, 698.46, 659.25, 0, 698.46, 783.99,
  659.25, 587.33, 523.25, 0, 587.33, 0, 587.33, 0
];
const V2_VILLAGGIO = [
  0, 440.00, 0, 523.25, 0, 587.33, 523.25, 0,
  0, 392.00, 0, 440.00, 0, 493.88, 0, 440.00,
  0, 659.25, 0, 523.25, 0, 493.88, 523.25, 0,
  0, 440.00, 0, 392.00, 0, 329.63, 0, 440.00
];
const V3_VILLAGGIO = [
  146.83, 0, 0, 220.00, 174.61, 0, 0, 220.00,
  146.83, 0, 130.81, 0, 164.81, 0, 146.83, 0,
  220.00, 0, 0, 261.63, 174.61, 0, 0, 196.00,
  146.83, 0, 164.81, 0, 130.81, 0, 146.83, 0
];

// Tema Grotta Antica
const V1_GROTTA = [293.66, 0, 349.23, 329.63, 293.66, 0, 261.63, 0, 293.66, 392.00, 349.23, 329.63, 261.63, 0, 220.00, 0];
const V2_GROTTA = [0, 220.00, 0, 261.63, 0, 246.94, 0, 196.00, 0, 293.66, 0, 261.63, 0, 196.00, 0, 146.83];

// Tema Abisso Glaciale (Cristalli e Carillon Polare)
const V1_GLACIALE = [1046.50, 0, 1318.51, 0, 1174.66, 987.77, 1046.50, 0, 1567.98, 0, 1318.51, 0, 1174.66, 0, 987.77, 0];
const V2_GLACIALE = [261.63, 0, 329.63, 0, 293.66, 0, 246.94, 0, 392.00, 0, 329.63, 0, 293.66, 0, 246.94, 0];

// Tema Boss / Yeti Antico (Incalzante)
const V1_BOSS = [220.00, 220.00, 261.63, 220.00, 293.66, 277.18, 261.63, 246.94, 220.00, 220.00, 329.63, 293.66, 261.63, 246.94, 196.00, 220.00];

setInterval(() => {
  if (!musicaAttiva || audioCtx.state !== 'running') return;
  const px = typeof playerGroup !== 'undefined' ? playerGroup.position.x : 0;
  const pz = typeof playerGroup !== 'undefined' ? playerGroup.position.z : 0;

  if (px > 80 || (px < -100 && pz < -95)) {
    // Zona Boss Re Grotta o Boss Yeti Antico
    const i = stepMusica % V1_BOSS.length;
    suonaNota(V1_BOSS[i], 0.25, "sawtooth", 0.032);
    suonaNota(V1_BOSS[i] / 2, 0.28, "triangle", 0.05);
  } else if (px < -100) {
    // Abisso Glaciale
    const i = stepMusica % V1_GLACIALE.length;
    suonaNota(V1_GLACIALE[i], 0.55, "sine", 0.035);
    suonaNota(V2_GLACIALE[i], 0.65, "triangle", 0.04);
  } else if (pz < -12) {
    // Grotta Base
    const i = stepMusica % V1_GROTTA.length;
    suonaNota(V1_GROTTA[i], 0.45, "triangle", 0.04);
    suonaNota(V2_GROTTA[i], 0.50, "sine", 0.045);
  } else {
    // Villaggio Medievale
    const i = stepMusica % V1_VILLAGGIO.length;
    suonaNota(V1_VILLAGGIO[i], 0.36, "sine", 0.042);
    suonaNota(V2_VILLAGGIO[i], 0.26, "triangle", 0.048);
    suonaNota(V3_VILLAGGIO[i], 0.55, "sawtooth", 0.016);
  }
  stepMusica++;
}, 290);

function toggleMusica() {
  musicaAttiva = !musicaAttiva;
  const t = document.getElementById('toast');
  if (t) {
    t.innerText = musicaAttiva ? "🎵 Musica & Suoni: ON" : "🔇 Musica & Suoni: OFF";
    t.style.border = "2px solid #d4af37"; t.style.color = "#ffd54f"; t.style.opacity = 1;
    setTimeout(() => t.style.opacity = 0, 1400);
  }
}
