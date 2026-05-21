/* ── Navbar scroll border ── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ── Mobile nav drawer ── */
const hamburger = document.getElementById('hamburger');
const navDrawer = document.getElementById('nav-drawer');

function openDrawer() {
  navDrawer.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}
function closeDrawer() {
  navDrawer.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}
hamburger.addEventListener('click', () =>
  navDrawer.classList.contains('open') ? closeDrawer() : openDrawer()
);
navDrawer.querySelectorAll('.drawer-link').forEach(l => l.addEventListener('click', closeDrawer));
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });

/* ── Active nav highlight on scroll ── */
const sections   = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a, .drawer-link');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const id = entry.target.id;
    navAnchors.forEach(a => {
      const match = a.getAttribute('href') === `#${id}`;
      a.classList.toggle('active', match);
    });
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => sectionObserver.observe(s));

/* ── Typing effect ── */
const phrases = [
  'Full-Stack Developer',
  'Frontend Craftsman',
  'Backend Engineer',
  'Open Source Contributor',
];
let pi = 0, ci = 0, deleting = false;
const typedEl = document.getElementById('typed');

function type() {
  const word = phrases[pi];
  typedEl.textContent = deleting ? word.slice(0, --ci) : word.slice(0, ++ci);
  if (!deleting && ci === word.length) { setTimeout(() => { deleting = true; type(); }, 1800); return; }
  if (deleting && ci === 0)           { deleting = false; pi = (pi + 1) % phrases.length; }
  setTimeout(type, deleting ? 45 : 85);
}
type();

/* ── Scroll reveal ── */
const revealObserver = new IntersectionObserver(
  entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
  { threshold: 0.1 }
);
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ── Back to top ── */
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  backToTop.classList.toggle('visible', window.scrollY > 400);
}, { passive: true });
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ── Contact form ── */
document.getElementById('contactForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const btn = this.querySelector('[type="submit"]');
  const orig = btn.textContent;
  btn.textContent = 'Sending…';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = 'Sent! ✅';
    this.reset();
    setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 3000);
  }, 1000);
});
