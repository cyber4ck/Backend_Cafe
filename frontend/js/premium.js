// ==================== SCROLL ANIMATIONS ====================
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observe elements for scroll animation
document.querySelectorAll('.menu-card-premium, .feature-card-premium, .testimonial-card-premium').forEach(el => {
  el.classList.add('fade-in');
  observer.observe(el);
});

// ==================== SMOOTH SCROLL ==================== 
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// ==================== PARALLAX EFFECT ====================
window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const shapes = document.querySelectorAll('.floating-shape');
  
  shapes.forEach((shape, index) => {
    const parallaxValue = scrolled * (0.5 + index * 0.1);
    shape.style.transform = `translateY(${parallaxValue}px)`;
  });
});

// ==================== NAVBAR BLUR EFFECT ====================
const navbar = document.querySelector('.navbar-premium');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.style.background = 'rgba(11, 12, 16, 0.85)';
    navbar.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
  } else {
    navbar.style.background = 'rgba(11, 12, 16, 0.7)';
    navbar.style.boxShadow = 'none';
  }
});

// ==================== STAT COUNTER ANIMATION ====================
function animateCounter(element, target, duration = 2000) {
  let current = 0;
  const increment = target / (duration / 16);
  const isPercentage = element.textContent.includes('%');
  
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    element.textContent = isPercentage ? current.toFixed(1) + '%' : Math.floor(current) + 'K+';
  }, 16);
}

// Trigger counter animation when stats section is visible
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const statNumbers = document.querySelectorAll('.stat-number');
      animateCounter(statNumbers[0], 50);
      animateCounter(statNumbers[1], 99.9);
      animateCounter(statNumbers[2], 24);
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
  statsObserver.observe(heroStats);
}

// ==================== VANILLA TILT 3D EFFECT ====================
// The VanillaTilt library is loaded via CDN and handles 3D tilt automatically
// Just make sure elements have data-tilt attribute (already added in HTML)

// ==================== CURSOR GLOW EFFECT ====================
document.addEventListener('mousemove', (e) => {
  const glow = document.querySelector('.cursor-glow');
  if (!glow) {
    const cursorGlow = document.createElement('div');
    cursorGlow.className = 'cursor-glow';
    cursorGlow.style.cssText = `
      position: fixed;
      width: 300px;
      height: 300px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(226, 55, 68, 0.1), transparent);
      pointer-events: none;
      z-index: -1;
      filter: blur(40px);
    `;
    document.body.appendChild(cursorGlow);
  }
  
  const cursorGlow = document.querySelector('.cursor-glow');
  if (cursorGlow) {
    cursorGlow.style.left = (e.clientX - 150) + 'px';
    cursorGlow.style.top = (e.clientY - 150) + 'px';
  }
});

// ==================== RIPPLE EFFECT ON BUTTONS ====================
document.querySelectorAll('.btn-premium').forEach(button => {
  button.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: rgba(255, 255, 255, 0.5);
      border-radius: 50%;
      left: ${x}px;
      top: ${y}px;
      animation: rippleEffect 0.6s ease-out;
      pointer-events: none;
    `;
    
    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  });
});

// Add ripple animation to stylesheet if not already present
const style = document.createElement('style');
style.textContent = `
  @keyframes rippleEffect {
    from {
      transform: scale(0);
      opacity: 1;
    }
    to {
      transform: scale(1);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// ==================== SCROLL PROGRESS BAR ====================
const progressBar = document.createElement('div');
progressBar.style.cssText = `
  position: fixed;
  top: 0;
  left: 0;
  height: 3px;
  background: linear-gradient(90deg, #e23744, #d4a574);
  z-index: 2000;
  transition: width 0.1s ease;
`;
document.body.appendChild(progressBar);

window.addEventListener('scroll', () => {
  const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const scrolled = (window.scrollY / windowHeight) * 100;
  progressBar.style.width = scrolled + '%';
});

// ==================== LAZY LOAD IMAGES ====================
const images = document.querySelectorAll('img[src]');
const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.style.opacity = '0';
      img.onload = () => {
        img.style.transition = 'opacity 0.4s ease';
        img.style.opacity = '1';
      };
      imageObserver.unobserve(img);
    }
  });
});

images.forEach(img => imageObserver.observe(img));

// ==================== SECTION REVEAL ANIMATION ====================
const sections = document.querySelectorAll('section');
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

sections.forEach(section => {
  section.style.opacity = '0';
  section.style.transform = 'translateY(40px)';
  section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
  sectionObserver.observe(section);
});

console.log('✓ Premium Frontend Loaded!');
