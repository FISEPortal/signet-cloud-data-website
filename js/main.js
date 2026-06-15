const currentYear = new Date().getFullYear();
const copyrightEl = document.getElementById('copyright-year');
if (copyrightEl) copyrightEl.textContent = currentYear;
const footerYearEl = document.getElementById('footer-year');
if (footerYearEl) footerYearEl.textContent = currentYear;

const hamburger = document.querySelector('.nav-hamburger');
const navEl = document.querySelector('nav');

if (hamburger && navEl) {
  hamburger.addEventListener('click', () => {
    const open = navEl.classList.toggle('nav-open');
    hamburger.setAttribute('aria-expanded', open);
  });
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      navEl.classList.remove('nav-open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
}

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
