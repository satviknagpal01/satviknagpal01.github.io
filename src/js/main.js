import { initUI, showSection } from './ui.js';
import { playClick } from './audio.js';
import './animations.js';

document.addEventListener('DOMContentLoaded', () => {
  initUI();

  const startBtn = document.getElementById('startBtn');
  startBtn.addEventListener('click', () => {
    playClick();
    showSection('about');
    document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
  });
});
