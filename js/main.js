/**
 * VIPSpot 2025 - Main JavaScript File
 * Author: VIPSpot
 * Description: Interactive functionality for a futuristic developer portfolio
 */

// ==== DEV SW GUARD (localhost) + kill-switch ====
(function swDevGuard() {
  const isLocal =
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1";

  const params = new URLSearchParams(location.search);
  const kill = params.has("kill-sw");

  if (isLocal) {
    // On localhost: never register SW; also nuke any old one once.
    if ("serviceWorker" in navigator) {
      if (kill || !sessionStorage.getItem("vip_sw_cleared")) {
        navigator.serviceWorker.getRegistrations?.().then(regs => regs.forEach(r => r.unregister()));
        caches?.keys?.().then(keys => keys.forEach(k => caches.delete(k)));
        sessionStorage.setItem("vip_sw_cleared", "1");
        if (kill) console.log("🔧 SW + caches cleared (kill-sw)");
      }
    }
  } else {
    // Production only: register SW
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(()=>{});
    }
  }
})();

// ============================================
// CONFIGURATION & CONSTANTS
// ============================================
const CONFIG = {
    typewriter: {
        delay: 100,
        startDelay: 2000
    },
    form: {
        apiEndpoint: '/api/contact', // Replace with actual endpoint
        timeoutDuration: 10000
    },
    animations: {
        scrollOffset: 100
    }
};

// Project data for modals
const PROJECTS_DATA = {
    roblox: {
        title: 'Roblox Adventure Game',
        color: 'neon-purple',
        description: 'Created an immersive multiplayer game with custom Lua scripts, AI enemies, and interactive environments. This project showcased advanced game development skills and multiplayer synchronization.',
        features: [
            'Custom enemy AI behavior systems',
            'Multiplayer synchronization and networking',
            'Interactive game environment with physics',
            'Player progression and achievement system',
            'Custom GUI interfaces and HUD elements',
            'Advanced scripting with Lua and Roblox Studio'
        ],
        technologies: ['Lua', 'Roblox Studio', 'Multiplayer', 'Game AI', 'Physics'],
        links: {
            demo: '#demo-roblox',
            github: '#github-roblox'
        }
    },
    react: {
        title: 'React E-Commerce Platform',
        color: 'neon-green',
        description: 'Built a comprehensive e-commerce solution with React frontend, Node.js backend, and MongoDB database. Features include user authentication, payment processing, and admin dashboard.',
        features: [
            'User authentication and authorization',
            'Payment integration with Stripe API',
            'Advanced product search and filtering',
            'Admin dashboard for inventory management',
            'Responsive design for all devices',
            'Real-time order tracking and notifications'
        ],
        technologies: ['React', 'Node.js', 'MongoDB', 'Stripe API', 'JWT', 'Express'],
        links: {
            demo: '#demo-react',
            github: '#github-react'
        }
    },
    ai: {
        title: 'AI Prediction System',
        color: 'neon-blue',
        description: 'Developed a machine learning model for predictive analytics with Python, TensorFlow, and data visualization. The system processes large datasets to provide accurate predictions and insights.',
        features: [
            'Data preprocessing and feature engineering',
            'Neural network model training and optimization',
            'Real-time prediction API with FastAPI',
            'Interactive data visualization dashboard',
            'Automated model retraining pipeline',
            'Performance monitoring and alerting'
        ],
        technologies: ['Python', 'TensorFlow', 'FastAPI', 'Data Science', 'Pandas', 'Plotly'],
        links: {
            demo: '#demo-ai',
            github: '#github-ai'
        }
    }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================
const Utils = {
    /**
     * Debounce function to limit the rate of function calls
     */
    debounce(func, wait, immediate) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    },

    /**
     * Throttle function to limit function calls to once per interval
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Check if element is in viewport
     */
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    /**
     * Smooth scroll to element
     */
    smoothScrollTo(element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    },

    /**
     * Validate email format
     */
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Sanitize HTML content
     */
    sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    },

    /**
     * Generate unique ID
     */
    generateId() {
        return 'id_' + Math.random().toString(36).substr(2, 9);
    }
};


// ============================================
// TYPEWRITER EFFECT
// ============================================
class TypewriterEffect {
    constructor(element, text, delay = CONFIG.typewriter.delay) {
        this.element = element;
        this.text = text;
        this.delay = delay;
        this.index = 0;
        this.start();
    }

    start() {
        this.element.textContent = '';
        this.type();
    }

    type() {
        if (this.index < this.text.length) {
            this.element.textContent += this.text.charAt(this.index);
            this.index++;
            setTimeout(() => this.type(), this.delay);
        }
    }
}

// ============================================
// NAVIGATION SYSTEM
// ============================================
class Navigation {
    constructor() {
        this.mobileMenuButton = document.getElementById('mobile-menu-button');
        this.mobileMenu = document.getElementById('mobile-menu');
        this.navLinks = document.querySelectorAll('nav a[href^="#"]');
        this.isMenuOpen = false;
        this.init();
    }

    init() {
        this.setupMobileMenu();
        this.setupSmoothScrolling();
        this.setupActiveNavigation();
    }

    setupMobileMenu() {
        if (!this.mobileMenuButton || !this.mobileMenu) return;

        this.mobileMenuButton.addEventListener('click', () => {
            this.toggleMobileMenu();
        });

        // Close mobile menu when clicking on links
        this.mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        });

        // Close mobile menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMobileMenu();
            }
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isMenuOpen && 
                !this.mobileMenu.contains(e.target) && 
                !this.mobileMenuButton.contains(e.target)) {
                this.closeMobileMenu();
            }
        });
    }

    toggleMobileMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        this.mobileMenu.classList.toggle('hidden');
        this.mobileMenuButton.setAttribute('aria-expanded', this.isMenuOpen);
        
        // Change icon
        const icon = this.mobileMenuButton.querySelector('i');
        if (icon) {
            icon.className = this.isMenuOpen ? 'fas fa-times' : 'fas fa-bars';
        }
    }

    closeMobileMenu() {
        this.isMenuOpen = false;
        this.mobileMenu.classList.add('hidden');
        this.mobileMenuButton.setAttribute('aria-expanded', 'false');
        
        // Reset icon
        const icon = this.mobileMenuButton.querySelector('i');
        if (icon) {
            icon.className = 'fas fa-bars';
        }
    }

    setupSmoothScrolling() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    Utils.smoothScrollTo(targetElement);
                }
            });
        });
    }

    setupActiveNavigation() {
        const sections = document.querySelectorAll('section[id]');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.setActiveNavLink(entry.target.id);
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '-100px 0px -100px 0px'
        });

        sections.forEach(section => observer.observe(section));
    }

    setActiveNavLink(activeId) {
        this.navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${activeId}`) {
                link.classList.add('text-neonBlue');
            } else {
                link.classList.remove('text-neonBlue');
            }
        });
    }
}

// ============================================
// MODAL SYSTEM
// ============================================
class ModalSystem {
    constructor() {
        this.modal = document.getElementById('project-modal');
        this.modalTitle = document.getElementById('modal-title');
        this.modalBody = document.querySelector('.modal-body');
        this.closeButton = document.getElementById('modal-close');
        this.projectButtons = document.querySelectorAll('.project-btn');
        this.isOpen = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Project buttons
        this.projectButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const projectId = button.getAttribute('data-project');
                this.openModal(projectId);
            });

            // Keyboard accessibility
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const projectId = button.getAttribute('data-project');
                    this.openModal(projectId);
                }
            });
        });

        // Close button
        if (this.closeButton) {
            this.closeButton.addEventListener('click', () => {
                this.closeModal();
            });
        }

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeModal();
            }
        });

        // Close on backdrop click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
    }

    openModal(projectId) {
        const project = PROJECTS_DATA[projectId];
        if (!project) return;

        this.renderModalContent(project);
        this.modal.classList.remove('hidden');
        this.modal.setAttribute('aria-hidden', 'false');
        this.isOpen = true;

        // Focus management
        this.closeButton.focus();
        
        // Prevent body scroll
        document.body.classList.add('body-overflow-hidden');

        // Announce to screen readers
        this.announceModalOpen(project.title);
    }

    closeModal() {
        this.modal.classList.add('hidden');
        this.modal.setAttribute('aria-hidden', 'true');
        this.isOpen = false;

        // Restore body scroll
        document.body.classList.remove('body-overflow-hidden');
        document.body.classList.add('body-overflow-auto');

        // Return focus to trigger element
        const activeButton = document.activeElement;
        if (activeButton && activeButton.classList.contains('project-btn')) {
            activeButton.focus();
        }
    }

    renderModalContent(project) {
        // Set title
        this.modalTitle.textContent = project.title;
        this.modalTitle.className = `text-2xl font-orbitron modal-title text-${project.color}`;

        // Create content HTML
        const contentHTML = `
            <p class="mb-6 leading-relaxed">${Utils.sanitizeHTML(project.description)}</p>
            
            <h4 class="text-xl font-semibold mb-4 text-${project.color}">Key Features</h4>
            <ul class="mb-6">
                ${project.features.map(feature => `<li>${Utils.sanitizeHTML(feature)}</li>`).join('')}
            </ul>
            
            <div class="tech-tags mb-6">
                ${project.technologies.map(tech => 
                    `<span class="tech-tag">${Utils.sanitizeHTML(tech)}</span>`
                ).join('')}
            </div>
            
            <div class="project-links">
                <a href="${project.links.demo}" class="project-link" aria-label="View live demo of ${project.title}">
                    <i class="fas fa-external-link-alt mr-2" aria-hidden="true"></i>
                    Live Demo
                </a>
                <a href="${project.links.github}" class="project-link secondary" aria-label="View GitHub repository for ${project.title}">
                    <i class="fab fa-github mr-2" aria-hidden="true"></i>
                    GitHub
                </a>
            </div>
        `;

        this.modalBody.innerHTML = contentHTML;
    }

    announceModalOpen(title) {
        // Create a live region announcement for screen readers
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = `Modal opened: ${title}`;
        
        document.body.appendChild(announcement);
        
        // Remove after announcement
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }
}

// ============================================
// FORM VALIDATION & SUBMISSION
// ============================================
class ContactForm {
    constructor() {
        this.form = document.getElementById('contact-form');
        this.nameField = document.getElementById('name');
        this.emailField = document.getElementById('email');
        this.messageField = document.getElementById('message');
        this.submitButton = this.form.querySelector('button[type="submit"]');
        this.statusDiv = document.getElementById('form-status');
        this.isSubmitting = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupRealTimeValidation();
    }

    setupEventListeners() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Clear errors on input
        [this.nameField, this.emailField, this.messageField].forEach(field => {
            field.addEventListener('input', () => {
                this.clearFieldError(field);
            });

            field.addEventListener('blur', () => {
                this.validateField(field);
            });
        });
    }

    setupRealTimeValidation() {
        // Email validation on input
        this.emailField.addEventListener('input', Utils.debounce(() => {
            if (this.emailField.value.length > 0) {
                this.validateEmail();
            }
        }, 500));

        // Character count for message
        this.messageField.addEventListener('input', () => {
            this.updateCharacterCount();
        });
    }

    validateField(field) {
        let isValid = true;
        let errorMessage = '';

        switch (field.id) {
            case 'name':
                if (!field.value.trim()) {
                    errorMessage = 'Name is required';
                    isValid = false;
                } else if (field.value.trim().length < 2) {
                    errorMessage = 'Name must be at least 2 characters';
                    isValid = false;
                }
                break;

            case 'email':
                if (!field.value.trim()) {
                    errorMessage = 'Email is required';
                    isValid = false;
                } else if (!Utils.validateEmail(field.value)) {
                    errorMessage = 'Please enter a valid email address';
                    isValid = false;
                }
                break;

            case 'message':
                if (!field.value.trim()) {
                    errorMessage = 'Message is required';
                    isValid = false;
                } else if (field.value.trim().length < 10) {
                    errorMessage = 'Message must be at least 10 characters';
                    isValid = false;
                } else if (field.value.length > 2000) {
                    errorMessage = 'Message must be less than 2000 characters';
                    isValid = false;
                }
                break;
        }

        this.setFieldError(field, errorMessage);
        return isValid;
    }

    validateEmail() {
        return this.validateField(this.emailField);
    }

    validateForm() {
        const nameValid = this.validateField(this.nameField);
        const emailValid = this.validateField(this.emailField);
        const messageValid = this.validateField(this.messageField);

        return nameValid && emailValid && messageValid;
    }

    setFieldError(field, message) {
        const errorElement = document.getElementById(`${field.id}-error`);
        if (errorElement) {
            errorElement.textContent = message;
            if (message) {
                errorElement.classList.remove('element-hidden');
                errorElement.classList.add('element-block');
            } else {
                errorElement.classList.remove('element-block');
                errorElement.classList.add('element-hidden');
            }
        }

        // Visual feedback
        if (message) {
            field.classList.add('border-red-500');
            field.setAttribute('aria-invalid', 'true');
        } else {
            field.classList.remove('border-red-500');
            field.setAttribute('aria-invalid', 'false');
        }
    }

    clearFieldError(field) {
        this.setFieldError(field, '');
    }

    updateCharacterCount() {
        const current = this.messageField.value.length;
        const max = 2000;
        const remaining = max - current;

        // Update character count display if element exists
        let countElement = document.getElementById('char-count');
        if (!countElement) {
            countElement = document.createElement('small');
            countElement.id = 'char-count';
            countElement.className = 'text-gray-400 text-sm';
            this.messageField.parentNode.appendChild(countElement);
        }

        countElement.textContent = `${current}/${max} characters`;
        if (remaining < 100) {
            countElement.classList.remove('text-neutral');
            countElement.classList.add('text-warning');
        } else {
            countElement.classList.remove('text-warning');
            countElement.classList.add('text-neutral');
        }
    }

    async handleSubmit() {
        if (this.isSubmitting) return;

        // Validate form
        if (!this.validateForm()) {
            this.showStatus('Please correct the errors above.', 'error');
            return;
        }

        this.isSubmitting = true;
        this.setSubmitState(true);

        try {
            const formData = {
                name: this.nameField.value.trim(),
                email: this.emailField.value.trim(),
                message: this.messageField.value.trim(),
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent
            };

            // Simulate API call for now (replace with actual endpoint)
            await this.simulateFormSubmission(formData);

            this.showStatus('Message sent successfully! I\'ll get back to you soon.', 'success');
            this.form.reset();
            this.clearAllErrors();

        } catch (error) {
            console.error('Form submission error:', error);
            this.showStatus('Failed to send message. Please try again later.', 'error');
        } finally {
            this.isSubmitting = false;
            this.setSubmitState(false);
        }
    }

    async simulateFormSubmission(formData) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // For demo purposes, we'll just log the data
        // Replace this with actual API call:
        // const response = await fetch(CONFIG.form.apiEndpoint, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(formData)
        // });
        
        console.log('Form submitted:', formData);
        
        // Simulate occasional failures for testing
        if (Math.random() > 0.9) {
            throw new Error('Simulated network error');
        }
    }

    setSubmitState(isSubmitting) {
        const buttonText = this.submitButton.querySelector('.button-text');
        const spinner = this.submitButton.querySelector('.loading-spinner');

        if (isSubmitting) {
            buttonText.classList.add('element-hidden');
            spinner.classList.remove('element-hidden');
            spinner.classList.add('element-inline-block');
            spinner.classList.remove('hidden');
            this.submitButton.disabled = true;
            this.submitButton.setAttribute('aria-busy', 'true');
        } else {
            buttonText.classList.remove('element-hidden');
            buttonText.classList.add('element-inline-block');
            spinner.classList.remove('element-inline-block');
            spinner.classList.add('element-hidden');
            spinner.classList.add('hidden');
            this.submitButton.disabled = false;
            this.submitButton.setAttribute('aria-busy', 'false');
        }
    }

    showStatus(message, type) {
        this.statusDiv.textContent = message;
        this.statusDiv.className = `mt-4 text-center ${
            type === 'success' ? 'text-green-400' : 'text-red-400'
        }`;
        
        // Auto-clear status after 5 seconds
        setTimeout(() => {
            this.statusDiv.textContent = '';
            this.statusDiv.className = 'mt-4 text-center';
        }, 5000);
    }

    clearAllErrors() {
        [this.nameField, this.emailField, this.messageField].forEach(field => {
            this.clearFieldError(field);
        });
    }
}

// ============================================
// PERFORMANCE & LOADING OPTIMIZATIONS
// ============================================
class PerformanceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        this.setupLazyLoading();
        this.setupIntersectionObserver();
        this.preloadCriticalAssets();
    }

    setupLazyLoading() {
        // Native lazy loading support
        const images = document.querySelectorAll('img[loading="lazy"]');
        
        // Fallback for browsers that don't support native lazy loading
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        observer.unobserve(img);
                    }
                });
            });

            images.forEach(img => {
                if (img.dataset.src) {
                    imageObserver.observe(img);
                }
            });
        }
    }

    setupIntersectionObserver() {
        // Animate elements when they come into view
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        
        if ('IntersectionObserver' in window) {
            const animationObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                    }
                });
            }, {
                threshold: 0.1
            });

            animatedElements.forEach(el => {
                animationObserver.observe(el);
            });
        }
    }

    preloadCriticalAssets() {
        // Remove any existing preload tags that might cause warnings
        document.querySelectorAll('link[rel="preload"][href*="fonts.googleapis"]').forEach(n => n.remove());
        
        // Note: Fonts are already loaded via stylesheet in HTML head
        // No need for dynamic preloading which causes console warnings
    }
}

// ============================================
// ACCESSIBILITY ENHANCEMENTS
// ============================================
class AccessibilityEnhancer {
    constructor() {
        this.init();
    }

    init() {
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
        this.setupScreenReaderSupport();
        this.setupReducedMotion();
    }

    setupKeyboardNavigation() {
        // Enhanced keyboard navigation for interactive elements
        document.addEventListener('keydown', (e) => {
            // Skip links navigation
            if (e.key === 'Tab' && e.shiftKey && document.activeElement === document.body) {
                const skipLink = document.querySelector('.skip-link');
                if (skipLink) {
                    skipLink.focus();
                    e.preventDefault();
                }
            }
        });
    }

    setupFocusManagement() {
        // Visible focus indicators
        document.addEventListener('mousedown', () => {
            document.body.classList.add('using-mouse');
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.remove('using-mouse');
            }
        });
    }

    setupScreenReaderSupport() {
        // Dynamic content announcements
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.id = 'live-region';
        document.body.appendChild(liveRegion);
    }

    setupReducedMotion() {
        // Respect user's motion preferences
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.documentElement.classList.add('animation-duration-fast');
        }
    }

    announce(message, priority = 'polite') {
        const liveRegion = document.getElementById('live-region');
        if (liveRegion) {
            liveRegion.setAttribute('aria-live', priority);
            liveRegion.textContent = message;
            
            // Clear after announcement
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }
}

// ============================================
// APPLICATION INITIALIZATION
// ============================================
class VIPSpotApp {
    constructor() {
        this.components = {};
        this.init();
    }

    async init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
        } else {
            this.initializeComponents();
        }
    }

    initializeComponents() {
        try {
            // Initialize core components
            this.components.navigation = new Navigation();
            this.components.modal = new ModalSystem();
            this.components.form = new ContactForm();
            this.components.performance = new PerformanceOptimizer();
            this.components.accessibility = new AccessibilityEnhancer();

            // Initialize typewriter effect
            this.initTypewriterEffect();

            // Setup global event listeners
            this.setupGlobalEventListeners();

            console.log('VIPSpot 2025 initialized successfully');

        } catch (error) {
            console.error('Failed to initialize VIPSpot app:', error);
            this.handleInitializationError(error);
        }
    }

    initTypewriterEffect() {
        const typewriterElement = document.getElementById('typewriter-text');
        if (typewriterElement) {
            const text = typewriterElement.textContent;
            setTimeout(() => {
                new TypewriterEffect(typewriterElement, text);
            }, CONFIG.typewriter.startDelay);
        }
    }

    setupGlobalEventListeners() {
        // Global error handling
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
        });

        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
        });

        // Connection status
        window.addEventListener('online', () => {
            this.components.accessibility?.announce('Connection restored');
        });

        window.addEventListener('offline', () => {
            this.components.accessibility?.announce('Connection lost');
        });
    }

    handleInitializationError(error) {
        // Fallback functionality for critical errors
        const fallbackMessage = document.createElement('div');
        fallbackMessage.className = 'fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg z-50';
        fallbackMessage.textContent = 'Some features may not work properly. Please refresh the page.';
        document.body.appendChild(fallbackMessage);

        setTimeout(() => {
            if (document.body.contains(fallbackMessage)) {
                document.body.removeChild(fallbackMessage);
            }
        }, 5000);
    }
}

// ============================================
// APPLICATION STARTUP
// ============================================

// Initialize the application
const vipspotApp = new VIPSpotApp();

// ============================================
// BUILD STAMP FUNCTIONALITY
// ============================================
// Tiny visual build stamp (toggle-only; hidden by default)
document.addEventListener('DOMContentLoaded', () => {
    const stampHost = document.getElementById("build-stamp");
    if (stampHost && window.location.search.includes("stamp=1")) {
        fetch("assets/ok.json").then(r=>r.json()).then(j=>{
            stampHost.hidden = false;
            stampHost.textContent = `OK • ${j.generatedAt}`;
            stampHost.className = 'build-stamp';
        }).catch(()=>{});
    }
    
    // CSP violation debugging (dev only)
    if (location.search.includes('debug-csp=1')) {
        addEventListener('securitypolicyviolation', e => {
            console.warn('[CSP]', e.violatedDirective, '→', e.blockedURI);
        });
    }
    
    // Super-safe smooth scroll fallback (only when native isn't available)
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;

        const id = link.getAttribute('href');
        if (!id || id === '#') return;

        const target = document.querySelector(id);
        if (!target) return; // let default happen if target missing

        // If native smooth-scroll exists, don't interfere
        if ('scrollBehavior' in document.documentElement.style) return;

        // JS fallback for older browsers only
        e.preventDefault();
        try { 
            target.scrollIntoView({ behavior: 'smooth', block: 'start' }); 
        } catch { 
            location.hash = id; // last-resort fallback
        }
    });

    // Guard: ensure CTA has the right hash even if HTML was out of sync
    const cta = document.getElementById('cta-build');
    if (cta && cta.getAttribute('href') !== '#contact') cta.setAttribute('href', '#contact');
    
    // Register service worker for PWA functionality
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/sw.js").catch(()=>{});
    }
});

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { VIPSpotApp, Utils };
}