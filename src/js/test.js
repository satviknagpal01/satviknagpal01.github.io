const playBtn = document.getElementById('playBtn');
const freqInput = document.getElementById('freq');
const durInput = document.getElementById('dur');
const volInput = document.getElementById('vol');
const waveSelect = document.getElementById('wave');
const freqVal = document.getElementById('freqVal');
const durVal = document.getElementById('durVal');
const volVal = document.getElementById('volVal');

const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');

let audioCtx, analyser, dataArray, bufferLength;

[freqInput, durInput, volInput].forEach(input => {
  input.addEventListener('input', () => {
    freqVal.textContent = freqInput.value;
    durVal.textContent = durInput.value;
    volVal.textContent = volInput.value;
  });
});

function initAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    bufferLength = analyser.fftSize;
    dataArray = new Uint8Array(bufferLength);
  }
}

function playRetroSound() {
  initAudioContext();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = waveSelect.value;
  osc.frequency.setValueAtTime(Number(freqInput.value), audioCtx.currentTime);
  gain.gain.setValueAtTime(Number(volInput.value), audioCtx.currentTime);
  osc.connect(gain);
  gain.connect(analyser);
  analyser.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + Number(durInput.value));
  visualize();
  playBtn.textContent = 'Playing...';
  playBtn.disabled = true;
  setTimeout(()=>{ playBtn.textContent='Play'; playBtn.disabled=false; }, Number(durInput.value)*1000 + 50);
}

function visualize() {
  const WIDTH = canvas.width, HEIGHT = canvas.height;
  function draw() {
    requestAnimationFrame(draw);
    analyser.getByteTimeDomainData(dataArray);
    ctx.fillStyle = '#081025';
    ctx.fillRect(0,0,WIDTH,HEIGHT);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#00E0FF';
    ctx.beginPath();
    const sliceWidth = WIDTH * 1.0 / bufferLength;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = v * HEIGHT / 2;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      x += sliceWidth;
    }
    ctx.lineTo(WIDTH, HEIGHT/2);
    ctx.stroke();
  }
  draw();
}

playBtn.addEventListener('click', playRetroSound);
