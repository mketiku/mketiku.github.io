// 1. Initialize AOS (Animations)
AOS.init({
    duration: 800,
    once: true,
    offset: 50
});

// 2. Initialize Typed.js (Typing Effect)
new Typed('#typed-output', {
    strings: [
        "Senior Software Engineer", 
        "Pythonista", 
        "Java Developer", 
        "Product Owner", 
        "TDD Enthusiast",
        "Photographer"
    ],
    typeSpeed: 50,
    backSpeed: 30,
    loop: true,
    backDelay: 2000
});

// 3. Theme Toggle (Dark/Light) using Bootstrap's data-bs-theme
const modeToggle = document.getElementById('modeToggle');
const themeIcon = document.getElementById('themeIcon');

// Load saved theme or default to light
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-bs-theme', savedTheme);
updateThemeIcon(savedTheme);

modeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-bs-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-bs-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    if (theme === 'dark') {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    }
}

// 4. Color Picker Logic
function setThemeColor(color) {
    document.documentElement.style.setProperty('--theme-color', color);
    localStorage.setItem('themeColor', color);
}

// Load saved color
const savedColor = localStorage.getItem('themeColor');
if (savedColor) {
    setThemeColor(savedColor);
}

// 5. Email Obfuscation
function openMailer(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const user = element.getAttribute('data-u');
    const domain = element.getAttribute('data-d');
    window.location.href = `mailto:${user}@${domain}`;
}

// Initialize Tooltips
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));