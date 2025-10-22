/* main.js — single-file controller, modular-style but simple to drop in */

/* ----------------------
   Lightweight 8-bit SFX manager (lazy audio context)
   ---------------------- */
class SFXManager {
  constructor() {
    this.ctx = null
    this.sounds = {
      start: { wave: 'square', freq: 660, dur: 0.25, vol: 0.28 },
      hover: { wave: 'triangle', freq: 880, dur: 0.09, vol: 0.12 },
      click: { wave: 'sawtooth', freq: 520, dur: 0.12, vol: 0.22 },
      transition: { wave: 'square', freq: 330, dur: 0.22, vol: 0.22 }
    }
  }

  _ensureCtx() {
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)()
      } catch (e) {
        this.ctx = null
      }
    }
  }

  play(name) {
    this._ensureCtx()
    const s = this.sounds[name]
    if (!s || !this.ctx) return
    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    osc.type = s.wave
    osc.frequency.setValueAtTime(s.freq, now)
    gain.gain.setValueAtTime(s.vol, now)
    osc.connect(gain)
    gain.connect(this.ctx.destination)
    osc.start(now)
    // simple envelope
    gain.gain.exponentialRampToValueAtTime(0.001, now + s.dur)
    osc.stop(now + s.dur + 0.02)
    // close context after a while (not strictly necessary)
    setTimeout(() => {
      // do not close to allow immediate reuse — keep it open
    }, 1000)
  }
}

/* ----------------------
   Small helpers
   ---------------------- */
const $ = (sel, parent = document) => parent.querySelector(sel)
const $$ = (sel, parent = document) => Array.from(parent.querySelectorAll(sel))
const byId = id => document.getElementById(id)

/* ----------------------
   Elements
   ---------------------- */
const intro = byId('intro')
const pressStart = byId('pressStart')
const app = byId('app')
const navLinks = $$('.nav-link')

/* ----------------------
   Init SFX — created lazily on first user gesture
   ---------------------- */
const sfx = new SFXManager()
let audioInitialized = false
function primeAudio() {
  if (audioInitialized) return
  sfx._ensureCtx()
  audioInitialized = true
}

/* ----------------------
   Typewriter
   ---------------------- */
function typewriter(el, speed = 18) {
  const text = el.getAttribute('data-text') || el.textContent || ''
  el.textContent = ''
  let i = 0
  const step = () => {
    if (i <= text.length) {
      el.textContent = text.slice(0, i)
      i++
      setTimeout(step, speed + Math.random() * 25)
    }
  }
  step()
}

/* ----------------------
   Modal
   ---------------------- */
const modal = byId('projectModal')
const modalTitle = byId('modalTitle')
const modalDesc = byId('modalDesc')
const modalClose = byId('modalClose')

function openModal(title, desc) {
  modalTitle.textContent = title
  modalDesc.textContent = desc
  modal.setAttribute('aria-hidden', 'false')
  sfx.play('click')
}

function closeModal() {
  modal.setAttribute('aria-hidden', 'true')
  sfx.play('click')
}
modalClose?.addEventListener('click', closeModal)
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal() })
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal() })

/* ----------------------
   Scroll & Nav behavior
   ---------------------- */
function scrollToSection(id) {
  const el = document.querySelector(id)
  if (!el) return
  // account for fixed navbar height
  const navHeight = document.querySelector('.navbar')?.offsetHeight || 64
  const top = el.getBoundingClientRect().top + window.scrollY - navHeight - 8
  window.scrollTo({ top, behavior: 'smooth' })
}

navLinks.forEach(a => {
  a.addEventListener('click', (e) => {
    e.preventDefault()
    primeAudio()
    sfx.play('click')
    scrollToSection(a.getAttribute('href'))
  })
  a.addEventListener('mouseenter', () => { primeAudio(); sfx.play('hover') })
  a.addEventListener('focus', () => { primeAudio(); sfx.play('hover') })
})

/* Active nav highlighting */
function updateActiveNav() {
  const sections = Array.from(document.querySelectorAll('section'))
  const offset = (document.querySelector('.navbar')?.offsetHeight || 64) + 12
  let current = sections[0]?.id || ''
  for (const sec of sections) {
    const top = sec.getBoundingClientRect().top
    if (top - offset <= 0) current = sec.id
  }
  navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${current}`))
}

/* ----------------------
   Intersection reveal
   ---------------------- */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible')
      observer.unobserve(entry.target)
    }
  })
}, { threshold: 0.12 })

/* ----------------------
   Projects interactions
   ---------------------- */
function attachProjectHandlers() {
  const cards = $$('.project-card')
  cards.forEach(card => {
    // click / keyboard open
    card.addEventListener('click', () => {
      primeAudio(); sfx.play('click')
      openModal(card.dataset.title, card.dataset.desc)
    })
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter') { primeAudio(); sfx.play('click'); openModal(card.dataset.title, card.dataset.desc) } })
    card.addEventListener('mouseenter', () => { primeAudio(); sfx.play('hover') })
  })
}

/* ----------------------
   Contact form handler
   ---------------------- */
const contactForm = byId('contactForm')
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault()
    primeAudio(); sfx.play('click')
    const btn = contactForm.querySelector('button[type="submit"]')
    const old = btn.textContent
    btn.textContent = 'Saved ✔'
    btn.disabled = true
    setTimeout(() => { btn.textContent = old; btn.disabled = false; contactForm.reset() }, 1200)
  })
}

/* ----------------------
   Start experience (hide intro, show app)
   ---------------------- */
function startExperience() {
  primeAudio()
  sfx.play('start')
  // hide intro, reveal app
  if (intro) {
    intro.style.display = 'none'
    intro.setAttribute('aria-hidden', 'true')
  }
  if (app) app.style.display = 'block'

  // initialize UI behaviors
  // start typewriters
  $$('.typewriter').forEach(el => typewriter(el))
  // observe sections
  $$('.section').forEach(s => observer.observe(s))
  // attach projects
  attachProjectHandlers()
  // initial active nav update and scroll listener
  updateActiveNav()
  window.addEventListener('scroll', () => { updateActiveNav() })
  // play slight transition sound on entrance
  setTimeout(()=> sfx.play('transition'), 120)
}

/* Event bindings for Press Start */
pressStart?.addEventListener('click', () => startExperience())
pressStart?.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') startExperience() })
document.addEventListener('keydown', function autoStart(e) {
  // if intro visible and user presses a key, start (ignore modifiers)
  if (!intro || intro.style.display === 'none') return
  if (['Shift','Control','Alt','Meta'].includes(e.key)) return
  startExperience()
  document.removeEventListener('keydown', autoStart)
})

/* ----------------------
   Accessibility: focus outline for keyboard users
   ---------------------- */
document.addEventListener('keyup', (e) => {
  if (e.key === 'Tab') document.body.classList.add('user-is-tabbing')
})

/* ----------------------
   Init: keep app hidden until start
   ---------------------- */
app.style.display = 'none'
