// /src/js/ui.js
import { playClick, playHover, resumeAudioOnGesture, setMasterVolume, toggleEnabled, getPrefs } from './audio.js';
import { revealOnScroll, smoothScrollTo, typewriter } from './animations.js';
import { sendContact } from './communication.js';
import { savePref, loadPref } from './storage.js';

// Load JSON
async function loadJSON(path) {
  const res = await fetch(path, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load ' + path);
  return res.json();
}

export async function renderAbout() {
  try {
    const data = await loadJSON('/data/about.json');
    const container = document.getElementById('aboutContent');
    container.innerHTML = `
      <div class="pixel-portrait" aria-hidden="true">${data.portrait || '☺'}</div>
      <div>
        <p class="dialogue typewriter" data-text="${data.bio}"></p>
        <ul class="achievements">${(data.achievements||[]).map(a=>`<li>${a}</li>`).join('')}</ul>
      </div>
    `;
  } catch (e) {
    document.getElementById('aboutContent').innerHTML = '<p class="muted">Failed to load about.</p>';
    console.error(e);
  }
}

export async function renderExperience() {
  try {
    const data = await loadJSON('/data/experience.json');
    const el = document.getElementById('experienceList');
    el.innerHTML = data.map(item => `<article class="exp"><h3>${item.company}</h3><p>${item.role} — ${item.range}</p><p>${item.summary}</p></article>`).join('');
  } catch (e) { document.getElementById('experienceList').innerHTML = '<p class="muted">Failed to load experience.</p>'; console.error(e); }
}

export async function renderProjects() {
  try {
    const data = await loadJSON('/data/projects.json');
    const grid = document.getElementById('projectsGrid');
    grid.innerHTML = '';
    data.forEach(p => {
      const card = document.createElement('article');
      card.className = 'project-card'; card.tabIndex = 0;
      card.dataset.title = p.title; card.dataset.desc = p.desc;
      card.innerHTML = `<div class="thumb">${p.thumb||'PR'}</div><h3>${p.title}</h3><p class="muted">${p.short}</p>`;
      grid.appendChild(card);
    });
    attachProjectHandlers();
  } catch (e) { document.getElementById('projectsGrid').innerHTML = '<p class="muted">Failed to load projects.</p>'; console.error(e); }
}

export async function renderSkills() {
  try {
    const data = await loadJSON('/data/skills.json');
    const grid = document.getElementById('skillsGrid'); grid.innerHTML = '';
    data.forEach(cat => {
      const node = document.createElement('div'); node.className='inventory-category';
      node.innerHTML = `<h4>${cat.title}</h4><ul>${(cat.items||[]).map(i=>`<li>${i}</li>`).join('')}</ul>`;
      grid.appendChild(node);
    });
  } catch (e) { document.getElementById('skillsGrid').innerHTML = '<p class="muted">Failed to load skills.</p>'; console.error(e); }
}

export function attachProjectHandlers() {
  const cards = Array.from(document.querySelectorAll('.project-card'));
  const modal = document.getElementById('projectModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalLinks = document.getElementById('modalLinks');
  const modalClose = document.getElementById('modalClose');

  cards.forEach(card=>{
    card.addEventListener('mouseenter', ()=> { resumeAudioOnGesture(); playHover(); });
    card.addEventListener('click', () => {
      resumeAudioOnGesture(); playClick();
      modalTitle.textContent = card.dataset.title || '';
      modalDesc.textContent = card.dataset.desc || '';
      modalLinks.innerHTML = '';
      modal.setAttribute('aria-hidden','false');
    });
    card.addEventListener('keydown',(e)=>{ if (e.key==='Enter') card.click(); });
  });

  modalClose?.addEventListener('click', ()=> { modal.setAttribute('aria-hidden','true'); playClick(); });
  modal.addEventListener('click', (e)=>{ if (e.target===modal) modal.setAttribute('aria-hidden','true'); });
  document.addEventListener('keydown', (e)=>{ if (e.key==='Escape') modal.setAttribute('aria-hidden','true'); });
}

export function wireUi() {
  document.querySelectorAll('[data-scroll]').forEach(btn=>{
    btn.addEventListener('click', ()=> { resumeAudioOnGesture(); playClick(); smoothScrollTo(btn.getAttribute('data-scroll')); });
    btn.addEventListener('mouseenter', ()=> { resumeAudioOnGesture(); playHover(); });
  });

  document.querySelectorAll('.nav-link').forEach(a=>{
    a.addEventListener('click', (e)=>{ e.preventDefault(); resumeAudioOnGesture(); playClick(); smoothScrollTo(a.getAttribute('href')); });
    a.addEventListener('mouseenter', ()=> { resumeAudioOnGesture(); playHover(); });
  });

  // contact form
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      resumeAudioOnGesture(); playClick();
      const payload = { name: form.name.value, email: form.email.value, message: form.message.value, time: new Date().toISOString() };
      const btn = form.querySelector('button[type="submit"]'); const old = btn.textContent;
      btn.textContent = 'Sending…'; btn.disabled = true;
      try {
        await sendContact(payload);
        btn.textContent = 'Saved ✔'; form.reset();
      } catch (err) {
        console.error(err); btn.textContent = 'Failed';
        setTimeout(()=>{ btn.textContent = old; btn.disabled = false; },1200); return;
      }
      setTimeout(()=>{ btn.textContent = old; btn.disabled = false; },1200);
    });
  }

  // prefs
  const sfxBtn = document.getElementById('sfxToggle');
  const sfxVol = document.getElementById('sfxVolume');
  const prefs = getPrefs();
  sfxBtn.setAttribute('aria-pressed', prefs.enabled ? 'true' : 'false');
  sfxVol.value = prefs.masterVolume ?? 0.8;

  sfxBtn.addEventListener('click', ()=> {
    const v = toggleEnabled(); sfxBtn.setAttribute('aria-pressed', v ? 'true' : 'false'); savePref('sfxEnabled', v);
  });
  sfxVol.addEventListener('input', (e)=> { setMasterVolume(e.target.value); savePref('sfxVolume', e.target.value); });

  // unity load/unload
  document.getElementById('loadUnity').addEventListener('click', loadUnityIframe);
  document.getElementById('unloadUnity').addEventListener('click', unloadUnityIframe);

  revealOnScroll('.section');
  document.querySelectorAll('.typewriter').forEach(el => typewriter(el));
  updateActiveNav();
  window.addEventListener('scroll', throttle(updateActiveNav, 80));
}

// nav active update
function updateActiveNav() {
  const sections = Array.from(document.querySelectorAll('section'));
  const navlinks = Array.from(document.querySelectorAll('.nav-links a'));
  const offset = (document.querySelector('.navbar')?.offsetHeight || 64) + 12;
  let current = sections[0]?.id || '';
  for (const s of sections) {
    const top = s.getBoundingClientRect().top;
    if (top - offset <= 0) current = s.id;
  }
  navlinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${current}`));
}

// unity iframe loader
function loadUnityIframe() {
  const wrap = document.getElementById('unityFrameWrap');
  if (wrap.querySelector('iframe')) return;
  // path: /unityBuild/index.html (put Unity WebGL build into /public/unityBuild/)
  const iframe = document.createElement('iframe');
  iframe.src = '/unityBuild/index.html';
  iframe.loading = 'lazy';
  iframe.title = 'Unity Demo';
  wrap.innerHTML = '';
  wrap.appendChild(iframe);
  playClick();
}

function unloadUnityIframe() {
  const wrap = document.getElementById('unityFrameWrap');
  wrap.innerHTML = '';
  playClick();
}

// util
function throttle(fn, wait=100){
  let last = 0;
  return (...args)=> { const now = Date.now(); if (now - last > wait) { last = now; fn(...args); } };
}

export { renderAbout, renderExperience, renderProjects, renderSkills, attachProjectHandlers, wireUi };
