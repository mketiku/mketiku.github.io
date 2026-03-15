document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize AOS (Animations)
    AOS.init({
        duration: 800,
        once: true,
        offset: 50
    });

    // 2. Theme Management
    const modeToggle = document.getElementById('modeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const html = document.documentElement;

    const setTheme = (theme) => {
        html.setAttribute('data-bs-theme', theme);
        localStorage.setItem('theme', theme);
        // Update icon
        if (themeIcon) {
            themeIcon.className = theme === 'dark' ? 'fas fa-sun fs-5' : 'fas fa-moon fs-5';
        }
    };

    // Initialize Theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);

    if (modeToggle) {
        modeToggle.addEventListener('click', () => {
            const current = html.getAttribute('data-bs-theme');
            setTheme(current === 'dark' ? 'light' : 'dark');
        });
    }

    // 3. Color Picker (Event Delegation)
    const savedColor = localStorage.getItem('themeColor');
    if (savedColor) document.documentElement.style.setProperty('--theme-color', savedColor);

    const colorMenu = document.querySelector('.dropdown-menu-colors');
    if (colorMenu) {
        colorMenu.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-color]');
            if (btn) {
                const color = btn.dataset.color;
                document.documentElement.style.setProperty('--theme-color', color);
                localStorage.setItem('themeColor', color);
            }
        });
    }

    // 4. Email Obfuscation
    document.querySelectorAll('.js-email-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const { u, d } = link.currentTarget.dataset;
            window.location.href = `mailto:${u}@${d}`;
        });
    });

    // 5. Tooltips
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    [...tooltipTriggerList].map(t => new bootstrap.Tooltip(t));

    // Initialize specific tooltip for color dropdown (avoids data-bs-toggle conflict)
    const colorDropdown = document.getElementById('colorDropdown');
    if (colorDropdown) {
        new bootstrap.Tooltip(colorDropdown, { title: "Change Theme", placement: "bottom" });
    }

    // 6. Hero Title Shuffle
    const heroTitle = document.getElementById('hero-title');
    const shuffleBtn = document.getElementById('shuffle-btn');
    const titles = [
        "Software Engineer", "Pythonista", "Java Developer", 
        "Product Owner", "TDD Enthusiast", "Photographer"
    ];

    if (heroTitle && shuffleBtn) {
        shuffleBtn.addEventListener('click', () => {
            heroTitle.style.opacity = '0';
            setTimeout(() => {
                let newTitle;
                const current = heroTitle.textContent.trim();
                do {
                    newTitle = titles[Math.floor(Math.random() * titles.length)];
                } while (newTitle === current);
                heroTitle.textContent = newTitle;
                heroTitle.style.opacity = '1';
            }, 200);
        });
    }
});