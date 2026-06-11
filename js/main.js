const currentYear = new Date().getFullYear();
const copyrightEl = document.getElementById('copyright-year');
if (copyrightEl) copyrightEl.textContent = currentYear;
const footerYearEl = document.getElementById('footer-year');
if (footerYearEl) footerYearEl.textContent = currentYear;

const btn = document.getElementById('hamburgerBtn');
const menu = document.getElementById('mobileMenu');

if (btn && menu) {
  btn.addEventListener('click', () => {
    menu.classList.toggle('open');
  });
}

function closeMenu() {
  if (menu) menu.classList.remove('open');
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
