// =============================================
//  script.js – Khushveer N Portfolio
//  Handles:
//    · Particle background animation
//    · Mobile menu toggle
//    · Form validation & submit
//    · Scroll-reveal animations
// =============================================

'use strict';

/* ── Constants ── */
const API_URL = 'http://localhost:5000/contact';

// =============================================
//  PARTICLE BACKGROUND
// =============================================
const canvas = document.getElementById('particles');
const ctx    = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
}

function createParticles() {
    particles = [];
    const count = Math.floor((canvas.width * canvas.height) / 18000);
    for (let i = 0; i < count; i++) {
        particles.push({
            x : Math.random() * canvas.width,
            y : Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            r : Math.random() * 1.5 + 0.5,
            o : Math.random() * 0.4 + 0.1,
        });
    }
}

function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 212, 170, ${p.o})`;
        ctx.fill();
    });

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = `rgba(0, 212, 170, ${0.06 * (1 - dist / 120)})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }
    }

    requestAnimationFrame(drawParticles);
}

resizeCanvas();
createParticles();
drawParticles();

window.addEventListener('resize', () => {
    resizeCanvas();
    createParticles();
});

// =============================================
//  MOBILE MENU TOGGLE
// =============================================
const mobileBtn = document.getElementById('mobile-menu-btn');
const navMenu   = document.querySelector('nav');

if (mobileBtn && navMenu) {
    mobileBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    // Close menu when a nav link is clicked
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });
}

// =============================================
//  DOM REFERENCES
// =============================================
const form          = document.getElementById('contact-form');
const nameInput     = document.getElementById('name');
const emailInput    = document.getElementById('email');
const messageInput  = document.getElementById('message');
const submitBtn     = document.getElementById('submit-btn');
const responseMsg   = document.getElementById('response-message');

const nameHint      = document.getElementById('name-hint');
const emailHint     = document.getElementById('email-hint');
const messageHint   = document.getElementById('message-hint');

// =============================================
//  VALIDATION FUNCTIONS
// =============================================
function validateName(value) {
    const v = value.trim();
    if (!v)             return { valid: false, msg: 'Name is required.' };
    if (v.length < 2)   return { valid: false, msg: 'Name must be at least 2 characters.' };
    if (v.length > 100)  return { valid: false, msg: 'Name must be 100 characters or fewer.' };
    return { valid: true, msg: '✓ Looks good!' };
}

function validateEmail(value) {
    const v = value.trim();
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!v)        return { valid: false, msg: 'Email is required.' };
    if (!re.test(v)) return { valid: false, msg: 'Please enter a valid email address.' };
    if (v.length > 150) return { valid: false, msg: 'Email must be 150 characters or fewer.' };
    return { valid: true, msg: '✓ Valid email!' };
}

function validateMessage(value) {
    const v = value.trim();
    if (!v)           return { valid: false, msg: 'Message is required.' };
    if (v.length < 10) return { valid: false, msg: 'Message must be at least 10 characters.' };
    return { valid: true, msg: `✓ ${v.length} characters` };
}

// =============================================
//  LIVE FIELD VALIDATION
// =============================================
function applyValidation(input, hint, result) {
    input.classList.toggle('valid',   result.valid);
    input.classList.toggle('invalid', !result.valid);
    hint.textContent = result.msg;
    hint.className   = 'field-hint ' + (result.valid ? 'ok' : 'error');
}

nameInput.addEventListener('input', () => {
    applyValidation(nameInput, nameHint, validateName(nameInput.value));
});

emailInput.addEventListener('input', () => {
    applyValidation(emailInput, emailHint, validateEmail(emailInput.value));
});

messageInput.addEventListener('input', () => {
    applyValidation(messageInput, messageHint, validateMessage(messageInput.value));
});

// =============================================
//  RESPONSE HELPERS
// =============================================
function showResponse(text, type) {
    responseMsg.textContent = text;
    responseMsg.className   = type;
}

function hideResponse() {
    responseMsg.className   = '';
    responseMsg.textContent = '';
}

// =============================================
//  FORM SUBMIT
// =============================================
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideResponse();

    const name    = nameInput.value.trim();
    const email   = emailInput.value.trim();
    const message = messageInput.value.trim();

    const nResult = validateName(name);
    const eResult = validateEmail(email);
    const mResult = validateMessage(message);

    applyValidation(nameInput,    nameHint,    nResult);
    applyValidation(emailInput,   emailHint,   eResult);
    applyValidation(messageInput, messageHint, mResult);

    if (!nResult.valid || !eResult.valid || !mResult.valid) {
        showResponse('⚠️  Please fix the errors above before submitting.', 'error');
        return;
    }

    submitBtn.disabled  = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Sending…';

    const payload = { name, email, message };

    try {
        const response = await fetch(API_URL, {
            method : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body   : JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            showResponse('🎉  ' + data.message, 'success');
            form.reset();

            [nameInput, emailInput, messageInput].forEach(el => {
                el.classList.remove('valid', 'invalid');
            });
            [nameHint, emailHint, messageHint].forEach(el => {
                el.textContent = '';
                el.className   = 'field-hint';
            });
        } else {
            showResponse('❌  ' + (data.error || 'Something went wrong. Please try again.'), 'error');
        }

    } catch (networkError) {
        console.error('Network error:', networkError);
        showResponse(
            '🔌  Cannot connect to server. Make sure the backend is running on port 5000.',
            'error'
        );
    } finally {
        submitBtn.disabled  = false;
        submitBtn.innerHTML = 'Send Message 🚀';
    }
});

// =============================================
//  SCROLL-REVEAL ANIMATION
// =============================================
const revealObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, i * 80);
                revealObserver.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.12 }
);

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// =============================================
//  ACTIVE NAV HIGHLIGHT (Scroll Spy)
// =============================================
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('nav a');

const navObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinks.forEach(link => {
                    const isActive = link.getAttribute('href') === `#${id}`;
                    link.style.color = isActive ? 'var(--accent-light)' : '';
                    if (isActive) {
                        link.style.setProperty('--active', '1');
                    }
                });
            }
        });
    },
    { rootMargin: '-40% 0px -40% 0px' }
);

sections.forEach(sec => navObserver.observe(sec));

// =============================================
//  EXPORTS (for testing)
// =============================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { validateName, validateEmail, validateMessage };
}

console.log('%c💻 Khushveer N Portfolio loaded!', 'color:#00d4aa; font-weight:bold; font-size:14px;');
