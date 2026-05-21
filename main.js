// Navbar scroll effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// Mobile hamburger menu
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

// Typing effect
const phrases = [
  'Full-Stack Developer',
  'Frontend Craftsman',
  'Backend Engineer',
  'Open Source Contributor',
];
let phraseIndex = 0;
let charIndex = 0;
let deleting = false;
const typedEl = document.getElementById('typed');

function type() {
  const current = phrases[phraseIndex];
  if (deleting) {
    typedEl.textContent = current.slice(0, --charIndex);
  } else {
    typedEl.textContent = current.slice(0, ++charIndex);
  }

  if (!deleting && charIndex === current.length) {
    setTimeout(() => { deleting = true; type(); }, 1800);
    return;
  }
  if (deleting && charIndex === 0) {
    deleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
  }
  setTimeout(type, deleting ? 50 : 90);
}
type();

// Scroll reveal
const reveals = document.querySelectorAll('.section > .container, .section > .hero-content');
const observer = new IntersectionObserver(
  entries => entries.forEach(e => e.isIntersecting && e.target.classList.add('visible')),
  { threshold: 0.1 }
);

document.querySelectorAll('.skill-card, .project-card, .about-grid, .contact-grid, .section-title')
  .forEach(el => {
    el.classList.add('reveal');
    observer.observe(el);
  });

// Contact form (demo — shows alert since there's no backend)
document.getElementById('contactForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const btn = this.querySelector('button[type="submit"]');
  const original = btn.textContent;
  btn.textContent = 'Sending...';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = 'Message Sent! ✅';
    this.reset();
    setTimeout(() => {
      btn.textContent = original;
      btn.disabled = false;
    }, 3000);
  }, 1000);
});
