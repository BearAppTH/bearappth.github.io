/* ── Navbar scroll border ── */
const navbar = document.getElementById('navbar');
const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 40);
window.addEventListener('scroll', onScroll, { passive: true });

/* ── Mobile nav drawer ── */
const hamburger  = document.getElementById('hamburger');
const navDrawer  = document.getElementById('nav-drawer');

function openDrawer() {
  navDrawer.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden'; // prevent background scroll
}

function closeDrawer() {
  navDrawer.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', () => {
  navDrawer.classList.contains('open') ? closeDrawer() : openDrawer();
});

// Close when a link is tapped
navDrawer.querySelectorAll('.drawer-link').forEach(link => {
  link.addEventListener('click', closeDrawer);
});

// Close on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeDrawer();
});

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

  if (!deleting && ci === word.length) {
    setTimeout(() => { deleting = true; type(); }, 1800);
    return;
  }
  if (deleting && ci === 0) {
    deleting = false;
    pi = (pi + 1) % phrases.length;
  }
  setTimeout(type, deleting ? 45 : 85);
}
type();

/* ── Scroll reveal ── */
const observer = new IntersectionObserver(
  entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
  { threshold: 0.12 }
);
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

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
