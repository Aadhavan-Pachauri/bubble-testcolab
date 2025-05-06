// Navigation state management
let navigationData = null;

// Default navigation as fallback
const defaultNavigation = [
    { name: "Home", url: "index.html" },
    { name: "Shop", url: "shop.html" },
    { name: "About", url: "about.html" },
    { name: "Support", url: "support.html" },
    { name: "Contact Us", url: "contact.html" },
    { name: "Cart", url: "cart.html" },
    { name: "Login", url: "login.html", hideWhenLoggedIn: true },
    { name: "Dashboard", url: "dashboard.html", requiresAuth: true },
    { name: "Settings", url: "#", id: "settings-btn" },
    { name: "Logout", url: "#", id: "logout-btn", requiresAuth: true }
];

// Load and cache navigation
async function loadNavigation() {
    console.log('[Debug] Loading navigation');
    if (navigationData) return navigationData;

    try {
        const response = await fetch('pages.json');
        if (!response.ok) return defaultNavigation;
        
        const data = await response.json();
        navigationData = data.navigation || defaultNavigation;
        return navigationData;
    } catch (error) {
        console.error('[Debug] Navigation load error:', error);
        return defaultNavigation;
    }
}

// Initialize mobile menu
function initMobileMenu() {
    console.log('[Debug] Setting up mobile menu');
    const hamburgerBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const body = document.body;

    if (!hamburgerBtn || !navLinks) return;

    // Set initial states
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    hamburgerBtn.setAttribute('aria-label', 'Open main menu');
    navLinks.setAttribute('aria-hidden', 'true');

    // Toggle menu
    hamburgerBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('[Debug] Hamburger clicked');
        
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        this.classList.toggle('active');
        navLinks.classList.toggle('active');
        body.classList.toggle('menu-open');
        
        this.setAttribute('aria-expanded', !isExpanded);
        navLinks.setAttribute('aria-hidden', isExpanded);

        // Animate menu items
        if (!isExpanded) {
            navLinks.querySelectorAll('li').forEach((item, index) => {
                item.style.setProperty('--delay', index + 1);
            });
        }
    });

    // Close menu on outside click
    document.addEventListener('click', function(e) {
        if (navLinks.classList.contains('active') && 
            !hamburgerBtn.contains(e.target) && 
            !navLinks.contains(e.target)) {
            hamburgerBtn.click();
        }
    });

    // Close menu on escape
    document.addEventListener('keyup', function(e) {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            hamburgerBtn.click();
        }
    });
}

// Update navigation UI
async function updateNavigationUI() {
    console.log('[Debug] Updating navigation UI');
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;

    const navigation = await loadNavigation();
    const isLoggedIn = !!localStorage.getItem('currentUser');
    
    // Filter navigation items based on auth state
    const filteredNav = navigation.filter(item => {
        if (item.hideWhenLoggedIn && isLoggedIn) return false;
        if (item.requiresAuth && !isLoggedIn) return false;
        return true;
    });

    // Generate navigation HTML
    navLinks.innerHTML = filteredNav.map(item => {
        if (item.url === 'cart.html') {
            return `<li><a href="${item.url}" class="nav-link text-lg hover:rainbow-text">${item.name} (<span id="cart-count">0</span>)</a></li>`;
        }
        return `<li><a href="${item.url}" ${item.id ? `id="${item.id}"` : ''} class="nav-link text-lg hover:rainbow-text">${item.name}</a></li>`;
    }).join('');

    // Initialize mobile menu
    initMobileMenu();
    
    // Setup settings button
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const settingsModal = document.getElementById('settings-modal');
            if (settingsModal) {
                settingsModal.classList.remove('hidden');
            }
        });
    }

    // Setup logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        });
    }
}

// Initialize navigation when DOM loads
document.addEventListener('DOMContentLoaded', updateNavigationUI);