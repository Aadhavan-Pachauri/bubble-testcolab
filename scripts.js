// Settings Modal Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize database first
    initDatabase();
    
    // Check authentication after
    if (!checkAuth()) return;

    // Initialize settings
    initSettings();

    // Initialize cart
    initCart();

    // Check if user is logged in and update UI accordingly
    updateAuthUI();

    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettings = document.getElementById('close-settings');
    
    if (settingsBtn && settingsModal && closeSettings) {
        settingsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            settingsModal.classList.remove('hidden');
        });
        
        closeSettings.addEventListener('click', function() {
            settingsModal.classList.add('hidden');
        });
        
        // Close modal when clicking outside the modal content
        settingsModal.addEventListener('click', function(e) {
            if (e.target === settingsModal) {
                settingsModal.classList.add('hidden');
            }
        });

        // Make settings toggles work
        const darkModeToggle = document.getElementById('darkModeToggle');
        const odooLikeToggle = document.getElementById('odooLikeToggle');
        const notificationsToggle = document.getElementById('notificationsToggle');
        const languageSelect = document.querySelector('#settings-modal select');
        const saveSettingsBtn = document.getElementById('saveSettingsBtn');

        if (saveSettingsBtn) {
            // Load saved settings
            const savedSettings = JSON.parse(localStorage.getItem('settings')) || {};
            if (darkModeToggle) darkModeToggle.checked = !!savedSettings.darkMode;
            if (odooLikeToggle) odooLikeToggle.checked = !!savedSettings.odooLike;
            if (notificationsToggle) notificationsToggle.checked = savedSettings.notifications !== false;
            if (languageSelect && savedSettings.language) languageSelect.value = savedSettings.language;

            saveSettingsBtn.addEventListener('click', function() {
                const settings = {
                    darkMode: darkModeToggle ? darkModeToggle.checked : false,
                    odooLike: odooLikeToggle ? odooLikeToggle.checked : false,
                    notifications: notificationsToggle ? notificationsToggle.checked : true,
                    language: languageSelect ? languageSelect.value : 'en'
                };
                
                localStorage.setItem('settings', JSON.stringify(settings));
                
                // Apply settings immediately
                applySettings();

                // Close modal after saving
                settingsModal.classList.add('hidden');

                // Show confirmation
                const confirmation = document.createElement('div');
                confirmation.className = 'fixed bottom-8 right-8 bg-green-500 text-white px-6 py-3 rounded-lg z-50';
                confirmation.textContent = 'Settings saved successfully!';
                document.body.appendChild(confirmation);
                
                if (typeof gsap !== 'undefined') {
                    gsap.fromTo(confirmation, 
                        {y: 50, opacity: 0}, 
                        {y: 0, opacity: 1, duration: 0.3, onComplete: function() {
                            setTimeout(() => {
                                gsap.to(confirmation, {y: 50, opacity: 0, duration: 0.3, onComplete: function() {
                                    confirmation.remove();
                                }});
                            }, 2000);
                        }}
                    );
                } else {
                    setTimeout(() => confirmation.remove(), 2000);
                }
            });
        }
    }
    
    // Contact Form Handling
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Collect form data
            const formData = {
                name: document.getElementById('name').value,
                phone: document.getElementById('phone').value,
                email: document.getElementById('email').value,
                company: document.getElementById('company').value,
                subject: document.getElementById('subject').value,
                question: document.getElementById('question').value
            };
            
            // Validate required fields
            if (!formData.name || !formData.email || !formData.subject || !formData.question) {
                alert('Please fill in all required fields.');
                return;
            }
            
            // Add to messages database
            const db = getDatabase();
            const message = {
                id: Date.now(),
                ...formData,
                date: new Date().toISOString(),
                status: 'unread'
            };
            
            // Initialize messages array if it doesn't exist
            if (!db.messages) {
                db.messages = [];
            }
            
            db.messages.push(message);
            saveDatabase(db);
            
            // Show success message and reset form
            alert('Thanks for contacting us! We will get back to you soon.');
            contactForm.reset();
        });
    }

    // Simplified background - no 3D spheres
    const threeCanvas = document.getElementById('three-canvas');
    if (threeCanvas) {
        // Create a gradient background instead of 3D spheres
        threeCanvas.style.background = 'linear-gradient(135deg, #0a1029 0%, #2a3f78 100%)';
        
        // Add subtle animation with GSAP if available
        if (typeof gsap !== 'undefined') {
            gsap.to(threeCanvas, {
                background: 'linear-gradient(225deg, #0a1029 0%, #2a3f78 100%)',
                duration: 8,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut'
            });
        }

        // GSAP Animations for hero content
        if (typeof gsap !== 'undefined') {
            const heroElements = document.querySelectorAll('.animate-hero');
            if (heroElements.length > 0) {
                heroElements.forEach((el, i) => {
                    gsap.from(el, { opacity: 0, y: 50, duration: 1, ease: 'power2.out', delay: i * 0.3 });
                });
            }
        }
    }

    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') !== '#') {
            // Do not add event listener to the settings button
            if (!link.id || link.id !== 'settings-btn') {
                link.addEventListener('click', (e) => {
                    // For regular links just allow them to work normally
                });
            }
        }
    });

    // Cart Functionality
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Update cart count on all pages
    function updateCartCount() {
        const cartCountElements = document.querySelectorAll('#cart-count');
        cartCountElements.forEach(element => {
            element.textContent = cart.length;
        });
    }
    
    // Initial cart count update
    updateCartCount();
    
    // Add to cart buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    if (addToCartButtons.length > 0) {
        addToCartButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const item = this.getAttribute('data-item');
                const price = parseFloat(this.getAttribute('data-price'));
                const productId = parseInt(this.getAttribute('data-id') || '0');
                
                // Add item to cart with proper product details
                addToCart({
                    productId,
                    item,
                    price
                });
                
                // Show notification
                alert(`${item} added to cart!`);
            });
        });
    }
    
    // Cart page functionality
    const cartItemsContainer = document.getElementById('cart-items');
    const cartEmptyMessage = document.getElementById('cart-empty');
    const cartTotalElement = document.getElementById('cart-total');
    
    if (cartItemsContainer && cartEmptyMessage && cartTotalElement) {
        function renderCart() {
            // Clear existing content
            cartItemsContainer.innerHTML = '';
            
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            
            if (cart.length === 0) {
                // Show empty cart message
                cartEmptyMessage.classList.remove('hidden');
                cartTotalElement.textContent = '0';
            } else {
                // Hide empty cart message
                cartEmptyMessage.classList.add('hidden');
                
                // Calculate total
                let total = 0;
                
                // Get product data if available
                const db = getDatabase();
                
                // Add each item to the cart display
                cart.forEach((item, index) => {
                    total += parseFloat(item.price);
                    
                    // If we have a product ID, try to get name from database
                    let productName = item.item || "Product";
                    if (item.productId && db?.products) {
                        const product = db.products.find(p => p.id === item.productId);
                        if (product) {
                            productName = product.name;
                        }
                    }
                    
                    const itemElement = document.createElement('div');
                    itemElement.className = 'flex justify-between mb-4';
                    itemElement.innerHTML = `
                        <span>${productName} - $${parseFloat(item.price).toFixed(2)}</span>
                        <button class="remove-item text-red-400 hover:text-red-600" data-index="${index}">Remove</button>
                    `;
                    
                    cartItemsContainer.appendChild(itemElement);
                });
                
                // Update total
                cartTotalElement.textContent = total.toFixed(2);
            }
        }
        
        // Initial render of cart
        renderCart();
        
        // Handle remove item clicks
        cartItemsContainer.addEventListener('click', function(e) {
            if (e.target.classList.contains('remove-item')) {
                const index = parseInt(e.target.getAttribute('data-index'));
                
                // Remove item from cart
                cart.splice(index, 1);
                
                // Save updated cart
                localStorage.setItem('cart', JSON.stringify(cart));
                
                // Re-render cart and update count
                renderCart();
                updateCartCount();
            }
        });
    }

    // Login functionality
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const feedback = document.getElementById('loginFeedback');
            
            if (!email || !password) {
                feedback.className = 'text-red-400 mt-4';
                feedback.textContent = 'Please enter email and password.';
                feedback.classList.remove('hidden');
                return;
            }
            
            const result = login(email, password);
            
            if (result.success) {
                feedback.className = 'text-green-400 mt-4';
                feedback.textContent = `Welcome back, ${result.user.name}!`;
                feedback.classList.remove('hidden');
                
                setTimeout(() => {
                    if (result.user.role === 'admin') {
                        window.location.href = 'admin.html';
                    } else {
                        window.location.href = 'index.html';
                    }
                }, 1000);
            } else {
                feedback.className = 'text-red-400 mt-4';
                feedback.textContent = result.message;
                feedback.classList.remove('hidden');
            }
        });
    }

    // Signup functionality
    const signupBtn = document.getElementById('signupBtn');
    if (signupBtn) {
        signupBtn.addEventListener('click', function() {
            const name = document.getElementById('signup-name').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const feedback = document.getElementById('signupFeedback');
            
            if (!name || !email || !password) {
                feedback.className = 'text-red-400 mt-4';
                feedback.textContent = 'Please fill in all fields.';
                feedback.classList.remove('hidden');
                return;
            }
            
            const result = register(name, email, password);
            
            if (result.success) {
                feedback.className = 'text-green-400 mt-4';
                feedback.textContent = 'Account created successfully!';
                feedback.classList.remove('hidden');
                
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } else {
                feedback.className = 'text-red-400 mt-4';
                feedback.textContent = result.message;
                feedback.classList.remove('hidden');
            }
        });
    }

    // Check if on admin page
    if (window.location.pathname.includes('admin.html')) {
        const currentUser = getCurrentUser();
        
        // Redirect if not admin
        if (!currentUser || currentUser.role !== 'admin') {
            window.location.href = 'login.html';
            return;
        }
        
        // Force reload admin dashboard
        loadAdminDashboard();
        
        // Make sure edit buttons are clickable by using event delegation
        document.getElementById('adminProducts').addEventListener('click', function(e) {
            const editButton = e.target.closest('.edit-product');
            if (editButton) {
                const productId = parseInt(editButton.getAttribute('data-id'));
                showProductEditModal(productId);
            }
        });
        
        // User management through event delegation
        document.getElementById('adminUsers').addEventListener('click', function(e) {
            const promoteButton = e.target.closest('.promote-user');
            const deleteButton = e.target.closest('.delete-user');
            
            if (promoteButton) {
                const userId = parseInt(promoteButton.getAttribute('data-id'));
                if (confirm('Are you sure you want to promote this user to admin?')) {
                    if (promoteUser(userId)) {
                        // Show success notification
                        const confirmation = document.createElement('div');
                        confirmation.className = 'fixed bottom-8 right-8 bg-green-500 text-white px-6 py-3 rounded-lg z-50';
                        confirmation.textContent = 'User promoted to admin!';
                        document.body.appendChild(confirmation);
                        setTimeout(() => confirmation.remove(), 2000);
                        
                        // Reload dashboard
                        loadAdminDashboard();
                    }
                }
            }
            
            if (deleteButton) {
                const userId = parseInt(deleteButton.getAttribute('data-id'));
                if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
                    const result = deleteUser(userId);
                    if (result.success) {
                        // Show success notification
                        const confirmation = document.createElement('div');
                        confirmation.className = 'fixed bottom-8 right-8 bg-green-500 text-white px-6 py-3 rounded-lg z-50';
                        confirmation.textContent = 'User deleted successfully!';
                        document.body.appendChild(confirmation);
                        setTimeout(() => confirmation.remove(), 2000);
                        
                        // Reload dashboard and update counts
                        loadAdminDashboard();
                        document.getElementById('user-count').textContent = getDatabase().users.length;
                    } else {
                        // Show error notification
                        const confirmation = document.createElement('div');
                        confirmation.className = 'fixed bottom-8 right-8 bg-red-500 text-white px-6 py-3 rounded-lg z-50';
                        confirmation.textContent = result.message || 'Error deleting user';
                        document.body.appendChild(confirmation);
                        setTimeout(() => confirmation.remove(), 2000);
                    }
                }
            }
        });
        
        // Add product form handler
        const addProductBtn = document.getElementById('addProduct');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', function() {
                const productName = document.getElementById('productName').value;
                const productPrice = document.getElementById('productPrice').value;
                const productDesc = document.getElementById('productDesc').value || 'New product';
                const productStock = document.getElementById('productStock').value || 10;
                const productImage = document.getElementById('productImage').value;
                const feedback = document.getElementById('adminFeedback');
                
                if (!productName || !productPrice) {
                    feedback.className = 'text-red-400 mt-4';
                    feedback.textContent = 'Please complete all required fields.';
                    feedback.classList.remove('hidden');
                    setTimeout(() => feedback.classList.add('hidden'), 3000);
                    return;
                }
                
                // Add product to database
                const db = getDatabase();
                const newProduct = {
                    id: Date.now(),
                    name: productName,
                    description: productDesc,
                    price: parseFloat(productPrice),
                    stock: parseInt(productStock),
                    dateAdded: new Date().toISOString(),
                    colors: ["#3B82F6", "#EC4899", "#10B981", "#F59E0B"],
                    materials: ["PLA", "ABS", "PETG", "Resin"],
                    image: productImage || `https://placehold.co/600x400/3B82F6/FFFFFF/svg?text=${encodeURIComponent(productName)}`
                };
                
                db.products.push(newProduct);
                saveDatabase(db);
                
                // Update UI
                feedback.className = 'text-green-400 mt-4';
                feedback.textContent = `Product "${productName}" added!`;
                feedback.classList.remove('hidden');
                document.getElementById('productName').value = '';
                document.getElementById('productPrice').value = '';
                document.getElementById('productDesc').value = '';
                document.getElementById('productStock').value = '';
                document.getElementById('productImage').value = '';
                
                // Update counts
                document.getElementById('product-count').textContent = db.products.length;
                
                // Reload dashboard
                loadAdminDashboard();
                
                setTimeout(() => feedback.classList.add('hidden'), 3000);
            });
        }
    }

    // Check if user is on the dashboard page and redirect properly
    const onDashboardPage = window.location.pathname.includes('dashboard.html');
    if (onDashboardPage) {
        const currentUser = getCurrentUser();
        
        // Redirect to login if not logged in
        if (!currentUser) {
            window.location.href = 'login.html';
            return;
        }
        
        // Redirect admins to admin dashboard
        if (currentUser.role === 'admin') {
            window.location.href = 'admin.html';
            return;
        }
    }
});

// Reset database (use this to force a reset if needed)
function resetDatabase() {
    localStorage.removeItem('bubbleDB');
    initDatabase();
    return getDatabase();
}

// Initialize database if it doesn't exist
function initDatabase() {
    if (!localStorage.getItem('bubbleDB')) {
        const demoData = {
            products: [
                {
                    id: 1,
                    name: "Custom Gear",
                    price: 29.99,
                    description: "Precision engineered custom gear for robotics and mechanical projects.",
                    stock: 15,
                    image: "https://placehold.co/600x400/3B82F6/FFFFFF/svg?text=Custom+Gear",
                    colors: ["#3B82F6", "#EC4899", "#10B981", "#F59E0B"],
                    materials: ["PLA", "ABS", "PETG", "Resin"]
                },
                {
                    id: 2,
                    name: "Drone Frame",
                    price: 49.99,
                    description: "Lightweight and durable drone frame for custom builds.",
                    stock: 8,
                    image: "https://placehold.co/600x400/3B82F6/FFFFFF/svg?text=Drone+Frame",
                    colors: ["#000000", "#FFFFFF", "#FF0000", "#00FF00"],
                    materials: ["Carbon Fiber", "Nylon", "Polycarbonate", "ABS"]
                },
                {
                    id: 3,
                    name: "Modular Bracket",
                    price: 19.99,
                    description: "Universal modular mounting bracket for various applications.",
                    stock: 24,
                    image: "https://placehold.co/600x400/3B82F6/FFFFFF/svg?text=Modular+Bracket",
                    colors: ["#777777", "#999999", "#BBBBBB", "#DDDDDD"],
                    materials: ["ABS", "PLA", "TPU", "Nylon"]
                },
                {
                    id: 4,
                    name: "AHR Headphones",
                    price: 89.99,
                    description: "Customizable over-ear headphone frames with acoustic optimization.",
                    stock: 5,
                    image: "https://placehold.co/600x400/3B82F6/FFFFFF/svg?text=AHR+Headphones",
                    colors: ["#000000", "#FFFFFF", "#FF0000", "#0000FF"],
                    materials: ["ABS", "Silicone", "Memory Foam", "Leather"]
                },
                {
                    id: 5,
                    name: "Smart Watch Case",
                    price: 24.99,
                    description: "Protective smart watch case with customizable design.",
                    stock: 18,
                    image: "https://placehold.co/600x400/3B82F6/FFFFFF/svg?text=Smart+Watch+Case",
                    colors: ["#3B82F6", "#EC4899", "#10B981", "#F59E0B"],
                    materials: ["TPU", "Silicone", "Nylon", "Resin"]
                },
                {
                    id: 6,
                    name: "Phone Stand Pro",
                    price: 15.99,
                    description: "Adjustable phone stand with cable management system.",
                    stock: 30,
                    image: "https://placehold.co/600x400/3B82F6/FFFFFF/svg?text=Phone+Stand+Pro",
                    colors: ["#000000", "#FFFFFF", "#FF6B6B", "#48DBFB"],
                    materials: ["PLA", "ABS", "PETG", "TPU"]
                }
            ],
            users: [
                {
                    id: 1,
                    email: "admin@bubble.com",
                    password: "admin123",
                    name: "Admin User",
                    role: "admin",
                    dateCreated: "2024-01-01T00:00:00.000Z",
                    orders: []
                },
                {
                    id: 2,
                    email: "test@example.com",
                    password: "password123",
                    name: "Test User",
                    role: "customer",
                    dateCreated: "2024-01-01T00:00:00.000Z",
                    orders: []
                }
            ],
            orders: [],
            messages: []
        };
        
        saveDatabase(demoData);
        console.log("Database initialized with demo data");
    }
}

// Get database from localStorage
function getDatabase() {
    const dbJson = localStorage.getItem('bubbleDB');
    if (!dbJson) {
        initDatabase();
        return getDatabase();
    }
    
    try {
        return JSON.parse(dbJson);
    } catch (error) {
        console.error('Error parsing database:', error);
        initDatabase();
        return getDatabase();
    }
}

// Save database to localStorage
function saveDatabase(db) {
    try {
        localStorage.setItem('bubbleDB', JSON.stringify(db));
        return true;
    } catch (error) {
        console.error('Error saving database:', error);
        return false;
    }
}

// Authentication functions
function login(email, password) {
    const db = getDatabase();
    const user = db.users.find(u => u.email === email);
    
    if (!user) {
        return { success: false, message: 'No account found with this email.' };
    }
    
    if (user.password !== password) {
        return { success: false, message: 'Incorrect password.' };
    }
    
    // Store logged in user in session
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    
    return { success: true, user };
}

function register(name, email, password) {
    const db = getDatabase();
    
    // Check if email is already in use
    if (db.users.some(u => u.email === email)) {
        return { success: false, message: 'Email already in use.' };
    }
    
    // Create new user
    const newUser = {
        id: db.users.length + 1,
        name,
        email,
        password,
        role: 'customer',
        dateCreated: new Date().toISOString()
    };
    
    // Add to database
    db.users.push(newUser);
    saveDatabase(db);
    
    // Also log the user in
    sessionStorage.setItem('currentUser', JSON.stringify(newUser));
    
    return { success: true, user: newUser };
}

function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

function getCurrentUser() {
    const userJson = sessionStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
}

function checkAuth() {
    const currentUser = getCurrentUser();
    const isAuthPage = window.location.pathname.includes('login.html');
    const isAdminPage = window.location.pathname.includes('admin.html');
    const isDashboardPage = window.location.pathname.includes('dashboard.html');

    if (!currentUser && (isAdminPage || isDashboardPage)) {
        window.location.href = 'login.html';
        return false;
    }

    if (currentUser && isAuthPage) {
        window.location.href = currentUser.role === 'admin' ? 'admin.html' : 'dashboard.html';
        return false;
    }

    if (isAdminPage && currentUser?.role !== 'admin') {
        window.location.href = 'dashboard.html';
        return false;
    }

    return true;
}

function updateAuthUI() {
    const currentUser = getCurrentUser();
    const loginNavItem = document.querySelector('a[href="login.html"]')?.parentElement;
    
    if (!loginNavItem) return;

    if (currentUser) {
        loginNavItem.innerHTML = `
            <div class="relative group">
                <a href="#" class="nav-link text-lg hover:holo-text flex items-center py-2">
                    ${currentUser.name}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 ml-1">
                        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                </a>
                <div class="absolute right-0 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg py-1 z-10 hidden group-hover:block" style="top: calc(100% - 5px);">
                    <div class="px-4 py-3 border-b border-gray-700">
                        <p class="text-sm text-gray-400">Signed in as</p>
                        <p class="text-sm font-medium text-blue-400 truncate">${currentUser.email}</p>
                    </div>
                    ${currentUser.role === 'admin' 
                        ? '<a href="admin.html" class="block px-4 py-2 text-sm text-white hover:bg-gray-700 w-full text-left">Admin Dashboard</a>'
                        : '<a href="dashboard.html" class="block px-4 py-2 text-sm text-white hover:bg-gray-700 w-full text-left">My Dashboard</a>'
                    }
                    <button id="logoutBtn" class="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700">Logout</button>
                </div>
            </div>
        `;

        // Add logout handler
        document.getElementById('logoutBtn')?.addEventListener('click', logout);
    } else {
        loginNavItem.innerHTML = '<a href="login.html" class="nav-link text-lg hover:holo-text">Login</a>';
    }
}

// Admin dashboard functionality
function loadAdminDashboard() {
    const db = getDatabase();
    
    // Update counts in sidebar
    const productCountEl = document.getElementById('product-count');
    const userCountEl = document.getElementById('user-count');
    const orderCountEl = document.getElementById('order-count');
    const messageCountEl = document.getElementById('message-count');
    
    if (productCountEl) productCountEl.textContent = db.products ? db.products.length : 0;
    if (userCountEl) userCountEl.textContent = db.users ? db.users.length : 0;
    if (orderCountEl) orderCountEl.textContent = db.orders ? db.orders.length : 0;
    if (messageCountEl) messageCountEl.textContent = db.messages ? db.messages.length : 0;
    
    // Load products
    const productsContainer = document.getElementById('adminProducts');
    if (productsContainer) {
        productsContainer.innerHTML = '';
        
        db.products.forEach(product => {
            const productEl = document.createElement('div');
            productEl.className = 'bg-gray-800 p-4 rounded-lg mb-4';
            
            // Get color swatches if they exist
            const colorSwatches = product.colors ? 
                product.colors.map(color => `<div class="w-4 h-4 rounded-full ml-1" style="background-color: ${color};"></div>`).join('') : '';
            
            // Get materials if they exist
            const materials = product.materials ? 
                `<div class="flex flex-wrap gap-1 mt-1">
                    ${product.materials.map(mat => `<span class="text-xs px-1 bg-gray-700 rounded">${mat}</span>`).join('')}
                </div>` : '';
            
            productEl.innerHTML = `
                <div class="flex justify-between">
                    <h3 class="text-lg font-semibold">${product.name}</h3>
                    <span class="text-blue-400">$${product.price.toFixed(2)}</span>
                </div>
                <p class="text-gray-400 text-sm mb-2">${product.description}</p>
                <div class="flex flex-col">
                    <div class="flex justify-between text-sm">
                        <span>Stock: ${product.stock}</span>
                        <button class="text-red-400 edit-product" data-id="${product.id}">Edit</button>
                    </div>
                    <div class="flex items-center mt-2">
                        <span class="text-xs text-gray-400">Colors:</span>
                        <div class="flex ml-2">${colorSwatches}</div>
                    </div>
                    ${materials}
                </div>
            `;
            productsContainer.appendChild(productEl);
        });
        
        // Add event listeners to edit buttons
        document.querySelectorAll('.edit-product').forEach(button => {
            button.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-id'));
                showProductEditModal(productId);
            });
        });
    }
    
    // Load users
    const usersContainer = document.getElementById('adminUsers');
    if (usersContainer) {
        usersContainer.innerHTML = '';
        
        db.users.forEach(user => {
            const userEl = document.createElement('div');
            userEl.className = 'bg-gray-800 p-4 rounded-lg mb-4';
            userEl.innerHTML = `
                <div class="flex justify-between">
                    <h3 class="text-lg font-semibold">${user.name}</h3>
                    <span class="${user.role === 'admin' ? 'text-purple-400' : 'text-blue-400'}">${user.role}</span>
                </div>
                <p class="text-gray-400 text-sm">${user.email}</p>
                <p class="text-gray-500 text-xs">Joined: ${new Date(user.dateCreated).toLocaleDateString()}</p>
                <div class="flex justify-end space-x-2 mt-3">
                    ${user.role === 'customer' ? 
                    `<button class="promote-user px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600" data-id="${user.id}">
                        Make Admin
                    </button>` : ''}
                    <button class="delete-user px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600" data-id="${user.id}">
                        Delete
                    </button>
                </div>
            `;
            usersContainer.appendChild(userEl);
        });
        
        // Event listeners are added through event delegation in the admin.html page
    }
    
    // Load messages
    const messagesContainer = document.getElementById('adminMessages');
    if (messagesContainer) {
        messagesContainer.innerHTML = '';
        
        const messages = db.messages || [];
        
        if (messages.length === 0) {
            messagesContainer.innerHTML = '<p class="text-gray-400">No messages yet.</p>';
        } else {
            messages.forEach(message => {
                const messageEl = document.createElement('div');
                messageEl.className = `bg-gray-800 p-4 rounded-lg mb-4 ${message.status === 'unread' ? 'border-l-4 border-blue-500' : ''}`;
                messageEl.innerHTML = `
                    <div class="flex justify-between">
                        <h3 class="text-lg font-semibold">${message.subject}</h3>
                        <span class="${message.status === 'unread' ? 'text-blue-400' : 'text-gray-400'}">${message.status}</span>
                    </div>
                    <p class="text-gray-400 text-sm">From: ${message.name} (${message.email})</p>
                    <p class="mt-2">${message.question}</p>
                    <div class="flex justify-between text-sm mt-3">
                        <span class="text-gray-500">${new Date(message.date).toLocaleString()}</span>
                        <button class="text-blue-400 mark-read" data-id="${message.id}">Mark as Read</button>
                    </div>
                `;
                messagesContainer.appendChild(messageEl);
            });
        }
    }
    
    // Load orders
    const ordersContainer = document.getElementById('adminOrders');
    if (ordersContainer) {
        ordersContainer.innerHTML = '';
        
        const orders = db.orders || [];
        
        if (orders.length === 0) {
            ordersContainer.innerHTML = '<p class="text-gray-400">No orders yet.</p>';
        } else {
            orders.forEach(order => {
                const orderEl = document.createElement('div');
                orderEl.className = 'bg-gray-800 p-4 rounded-lg mb-4';
                
                // Find user
                const user = db.users.find(u => u.id === order.userId);
                
                orderEl.innerHTML = `
                    <div class="flex justify-between">
                        <h3 class="text-lg font-semibold">Order #${order.id}</h3>
                        <span class="text-blue-400">$${order.total.toFixed(2)}</span>
                    </div>
                    <p class="text-gray-400 text-sm">Customer: ${user ? user.name : 'Unknown'}</p>
                    <p class="text-gray-500 text-xs">Date: ${new Date(order.date).toLocaleString()}</p>
                    <div class="mt-2">
                        <h4 class="text-sm font-semibold">Items:</h4>
                        <ul class="text-sm">
                            ${order.items.map(item => `<li>${item.item} - $${item.price.toFixed(2)}</li>`).join('')}
                        </ul>
                    </div>
                `;
                ordersContainer.appendChild(orderEl);
            });
        }
    }
}

// Show product edit modal
function showProductEditModal(productId) {
    // Get the product from database
    const db = getDatabase();
    const product = db.products.find(p => p.id === productId);
    
    if (!product) return;
    
    // Create modal if it doesn't exist
    let modal = document.getElementById('edit-product-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'edit-product-modal';
        modal.className = 'fixed inset-0 z-50 flex items-center justify-center';
        document.body.appendChild(modal);
    }
    
    // Generate color inputs
    const colorInputs = (product.colors || []).map((color, i) => `
        <div class="flex items-center mb-2">
            <input type="color" value="${color}" class="product-color w-8 h-8 rounded mr-2">
            <button type="button" class="remove-color text-red-400 text-sm">Remove</button>
        </div>
    `).join('');
    
    // Generate material inputs
    const materialInputs = (product.materials || []).map((material, i) => `
        <div class="flex items-center mb-2">
            <input type="text" value="${material}" class="product-material bg-gray-700 rounded p-2 w-full mr-2">
            <button type="button" class="remove-material text-red-400 text-sm">Remove</button>
        </div>
    `).join('');
    
    modal.innerHTML = `
        <div class="absolute inset-0 bg-black bg-opacity-50"></div>
        <div class="relative z-10 bg-gray-800 rounded-xl neon-glow p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-3xl font-bold holo-text">Edit Product</h2>
                <button id="close-product-edit" class="text-2xl hover:text-blue-400">×</button>
            </div>
            
            <form id="edit-product-form" class="space-y-6">
                <input type="hidden" id="edit-product-id" value="${product.id}">
                
                <div>
                    <label class="block text-lg mb-2">Product Name</label>
                    <input type="text" id="edit-product-name" value="${product.name}" 
                           class="w-full bg-gray-700 rounded-lg p-2 border border-gray-600 text-white">
                </div>
                
                <div>
                    <label class="block text-lg mb-2">Price</label>
                    <input type="number" id="edit-product-price" value="${product.price}" step="0.01" 
                           class="w-full bg-gray-700 rounded-lg p-2 border border-gray-600 text-white">
                </div>
                
                <div>
                    <label class="block text-lg mb-2">Description</label>
                    <textarea id="edit-product-desc" rows="3" 
                              class="w-full bg-gray-700 rounded-lg p-2 border border-gray-600 text-white">${product.description}</textarea>
                </div>
                
                <div>
                    <label class="block text-lg mb-2">Stock</label>
                    <input type="number" id="edit-product-stock" value="${product.stock}" 
                           class="w-full bg-gray-700 rounded-lg p-2 border border-gray-600 text-white">
                </div>
                
                <div>
                    <label class="block text-lg mb-2">Image URL</label>
                    <input type="text" id="edit-product-image" value="${product.image || ''}" 
                           class="w-full bg-gray-700 rounded-lg p-2 border border-gray-600 text-white">
                    <p class="text-sm text-gray-400 mt-1">Leave blank for default placeholder image</p>
                </div>
                
                <div>
                    <label class="block text-lg mb-2">Colors</label>
                    <div id="color-inputs">
                        ${colorInputs}
                    </div>
                    <button type="button" id="add-color" class="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg">
                        + Add Color
                    </button>
                </div>
                
                <div>
                    <label class="block text-lg mb-2">Materials</label>
                    <div id="material-inputs">
                        ${materialInputs}
                    </div>
                    <button type="button" id="add-material" class="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg">
                        + Add Material
                    </button>
                </div>
                
                <div class="flex space-x-4">
                    <button type="submit" class="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 flex-1">
                        Save Changes
                    </button>
                    <button type="button" id="delete-product" class="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600">
                        Delete
                    </button>
                </div>
            </form>
        </div>
    `;
    
    // Add event listeners
    document.getElementById('close-product-edit').addEventListener('click', function() {
        modal.remove();
    });
    
    // Add color button
    document.getElementById('add-color').addEventListener('click', function() {
        const colorInputs = document.getElementById('color-inputs');
        const newInput = document.createElement('div');
        newInput.className = 'flex items-center mb-2';
        newInput.innerHTML = `
            <input type="color" value="#3B82F6" class="product-color w-8 h-8 rounded mr-2">
            <button type="button" class="remove-color text-red-400 text-sm">Remove</button>
        `;
        colorInputs.appendChild(newInput);
        
        // Add event listener to the new remove button
        newInput.querySelector('.remove-color').addEventListener('click', function() {
            newInput.remove();
        });
    });
    
    // Add material button
    document.getElementById('add-material').addEventListener('click', function() {
        const materialInputs = document.getElementById('material-inputs');
        const newInput = document.createElement('div');
        newInput.className = 'flex items-center mb-2';
        newInput.innerHTML = `
            <input type="text" value="" placeholder="Enter material" class="product-material bg-gray-700 rounded p-2 w-full mr-2">
            <button type="button" class="remove-material text-red-400 text-sm">Remove</button>
        `;
        materialInputs.appendChild(newInput);
        
        // Add event listener to the new remove button
        newInput.querySelector('.remove-material').addEventListener('click', function() {
            newInput.remove();
        });
    });
    
    // Add event listeners to existing remove buttons
    document.querySelectorAll('.remove-color').forEach(btn => {
        btn.addEventListener('click', function() {
            this.parentElement.remove();
        });
    });
    
    document.querySelectorAll('.remove-material').forEach(btn => {
        btn.addEventListener('click', function() {
            this.parentElement.remove();
        });
    });
    
    // Form submission
    document.getElementById('edit-product-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Collect form data
        const formData = {
            id: parseInt(document.getElementById('edit-product-id').value),
            name: document.getElementById('edit-product-name').value,
            price: parseFloat(document.getElementById('edit-product-price').value),
            description: document.getElementById('edit-product-desc').value,
            stock: parseInt(document.getElementById('edit-product-stock').value),
            image: document.getElementById('edit-product-image').value,
            colors: Array.from(document.querySelectorAll('.product-color')).map(input => input.value),
            materials: Array.from(document.querySelectorAll('.product-material')).map(input => input.value)
        };
        
        // Update product in database
        updateProduct(formData);
        
        // Close modal
        modal.remove();
        
        // Show confirmation
        const confirmation = document.createElement('div');
        confirmation.className = 'fixed bottom-8 right-8 bg-green-500 text-white px-6 py-3 rounded-lg z-50';
        confirmation.textContent = 'Product updated successfully!';
        document.body.appendChild(confirmation);
        
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(confirmation, 
                {y: 50, opacity: 0}, 
                {y: 0, opacity: 1, duration: 0.3, onComplete: function() {
                    setTimeout(() => {
                        gsap.to(confirmation, {y: 50, opacity: 0, duration: 0.3, onComplete: function() {
                            confirmation.remove();
                        }});
                    }, 2000);
                }}
            );
        } else {
            setTimeout(() => confirmation.remove(), 2000);
        }
    });
    
    // Delete product button
    document.getElementById('delete-product').addEventListener('click', function() {
        if (confirm('Are you sure you want to delete this product?')) {
            const productId = parseInt(document.getElementById('edit-product-id').value);
            deleteProduct(productId);
            modal.remove();
            
            // Show confirmation
            const confirmation = document.createElement('div');
            confirmation.className = 'fixed bottom-8 right-8 bg-red-500 text-white px-6 py-3 rounded-lg z-50';
            confirmation.textContent = 'Product deleted!';
            document.body.appendChild(confirmation);
            
            if (typeof gsap !== 'undefined') {
                gsap.fromTo(confirmation, 
                    {y: 50, opacity: 0}, 
                    {y: 0, opacity: 1, duration: 0.3, onComplete: function() {
                        setTimeout(() => {
                            gsap.to(confirmation, {y: 50, opacity: 0, duration: 0.3, onComplete: function() {
                                confirmation.remove();
                            }});
                        }, 2000);
                    }}
                );
            } else {
                setTimeout(() => confirmation.remove(), 2000);
            }
        }
    });
}

// Update product in database
function updateProduct(productData) {
    const db = getDatabase();
    const index = db.products.findIndex(p => p.id === productData.id);
    
    if (index !== -1) {
        // If the image is empty, use placeholder
        if (!productData.image) {
            productData.image = `https://placehold.co/600x400/3B82F6/FFFFFF/svg?text=${encodeURIComponent(productData.name)}`;
        }
        
        // Update product
        db.products[index] = {
            ...db.products[index],
            ...productData
        };
        
        // Save to database
        saveDatabase(db);
        
        // Reload admin dashboard if on admin page
        if (window.location.pathname.includes('admin.html') && typeof loadAdminDashboard === 'function') {
            loadAdminDashboard();
        }
        
        return true;
    }
    
    return false;
}

// Delete product from database
function deleteProduct(productId) {
    const db = getDatabase();
    const index = db.products.findIndex(p => p.id === productId);
    
    if (index !== -1) {
        // Remove product
        db.products.splice(index, 1);
        
        // Save to database
        saveDatabase(db);
        
        // Reload admin dashboard if on admin page
        if (window.location.pathname.includes('admin.html') && typeof loadAdminDashboard === 'function') {
            loadAdminDashboard();
            
            // Update product count
            const productCountEl = document.getElementById('product-count');
            if (productCountEl) {
                productCountEl.textContent = db.products.length;
            }
        }
        
        return true;
    }
    
    return false;
}

// Settings functionality
function initSettings() {
    const settings = JSON.parse(localStorage.getItem('settings')) || {
        darkMode: false,
        odooLike: false,
        notifications: true,
        language: 'en'
    };
    localStorage.setItem('settings', JSON.stringify(settings));
    applySettings();
}

function applySettings() {
    const settings = JSON.parse(localStorage.getItem('settings')) || {};
    
    // Apply dark mode
    if (settings.darkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    
    // Apply Odoo-like theme
    if (settings.odooLike) {
        if (!document.getElementById('odoo-styles')) {
            const styleEl = document.createElement('style');
            styleEl.id = 'odoo-styles';
            styleEl.textContent = `
                body {
                    background: #f0f0f0 !important;
                    color: #212529 !important;
                }
                .holo-bg {
                    background: rgba(255, 255, 255, 0.8) !important;
                    backdrop-filter: blur(10px) !important;
                    box-shadow: 0 1px 3px rgba(0,0,0,.1) !important;
                }
                .dark-mode body {
                    background: #212529 !important;
                    color: #f0f0f0 !important;
                }
                .dark-mode .holo-bg {
                    background: rgba(33, 37, 41, 0.9) !important;
                }
                .neon-glow {
                    box-shadow: 0 1px 3px rgba(0,0,0,.1) !important;
                }
                nav a {
                    color: #4A5568 !important;
                }
                .dark-mode nav a {
                    color: #E2E8F0 !important;
                }
                .holo-text {
                    background: #714B67 !important;
                    -webkit-background-clip: text !important;
                    background-clip: text !important;
                }
                .dashboard-tab.active {
                    border-bottom-color: #714B67 !important;
                    color: #714B67 !important;
                }
                button.bg-gradient-to-r {
                    background: #714B67 !important;
                }
                .bg-gray-800 {
                    background-color: white !important;
                    color: #333 !important;
                    box-shadow: 0 1px 3px rgba(0,0,0,.1) !important;
                }
                .text-white {
                    color: #333 !important;
                }
                .bg-gray-700 {
                    background-color: #f5f5f5 !important;
                    color: #333 !important;
                }
                .text-gray-400 {
                    color: #666 !important;
                }
                input, select, textarea {
                    color: #333 !important;
                    background-color: #f5f5f5 !important;
                }
                .text-blue-400 {
                    color: #714B67 !important;
                }
                footer.bg-black {
                    background-color: #333 !important;
                }
                footer .text-white {
                    color: #fff !important;
                }
                /* Dark mode overrides */
                .dark-mode .bg-gray-800 {
                    background-color: #333 !important;
                    color: #f5f5f5 !important;
                }
                .dark-mode .text-white {
                    color: #f5f5f5 !important;
                }
                .dark-mode .bg-gray-700 {
                    background-color: #444 !important;
                    color: #f5f5f5 !important;
                }
                .dark-mode .text-gray-400 {
                    color: #aaa !important;
                }
                .dark-mode input, .dark-mode select, .dark-mode textarea {
                    color: #f5f5f5 !important;
                    background-color: #444 !important;
                }
            `;
            document.head.appendChild(styleEl);
        }
    } else {
        const styleEl = document.getElementById('odoo-styles');
        if (styleEl) {
            styleEl.remove();
        }
    }

    // Update settings UI if elements exist
    const darkModeToggle = document.getElementById('darkModeToggle');
    const odooLikeToggle = document.getElementById('odooLikeToggle');
    const notificationsToggle = document.getElementById('notificationsToggle');
    const languageSelect = document.querySelector('#settings-modal select');

    if (darkModeToggle) darkModeToggle.checked = !!settings.darkMode;
    if (odooLikeToggle) odooLikeToggle.checked = !!settings.odooLike;
    if (notificationsToggle) notificationsToggle.checked = settings.notifications !== false;
    if (languageSelect && settings.language) languageSelect.value = settings.language;
}

// Cart Functionality
function initCart() {
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }
    
    // Check for corrupted cart data (items with null names)
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const hasCorruptedItems = cart.some(item => !item.item || item.item === 'null' || !item.price);
    
    if (hasCorruptedItems) {
        // Reset corrupted cart
        clearCart();
    }
    
    updateCartCount();
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCountElements = document.querySelectorAll('#cart-count');
    cartCountElements.forEach(element => {
        element.textContent = cart.length;
    });
}

function addToCart(item) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(item);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function removeFromCart(index) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function clearCart() {
    localStorage.setItem('cart', JSON.stringify([]));
    updateCartCount();
}

// Promote user to admin
function promoteUser(userId) {
    const db = getDatabase();
    const userIndex = db.users.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
        db.users[userIndex].role = 'admin';
        saveDatabase(db);
        return true;
    }
    return false;
}

// Delete user account
function deleteUser(userId) {
    const db = getDatabase();
    const userIndex = db.users.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
        // Don't delete the last admin
        if (db.users[userIndex].role === 'admin' && db.users.filter(u => u.role === 'admin').length <= 1) {
            return { success: false, message: 'Cannot delete the last admin account' };
        }
        
        // Remove user
        db.users.splice(userIndex, 1);
        saveDatabase(db);
        
        return { success: true };
    }
    return { success: false, message: 'User not found' };
} 