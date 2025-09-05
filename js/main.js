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

  // Handle kill-sw parameter on any domain
  if (kill && "serviceWorker" in navigator) {
    (async () => {
      try {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r => r.unregister()));
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
        console.log("SW + caches cleared (kill-sw)");
        // Redirect to clean URL
        location.replace(location.pathname);
      } catch (e) {
        console.warn("Failed to clear SW/caches:", e);
      }
    })();
    return; // Don't register new SW
  }

  if (isLocal) {
    // On localhost: never register SW; also nuke any old one once.
    if ("serviceWorker" in navigator && !sessionStorage.getItem("vip_sw_cleared")) {
      navigator.serviceWorker.getRegistrations?.().then(regs => regs.forEach(r => r.unregister()));
      caches?.keys?.().then(keys => keys.forEach(k => caches.delete(k)));
      sessionStorage.setItem("vip_sw_cleared", "1");
    }
  } else {
    // Production only: register SW with auto-update and controllerchange handling
    if ("serviceWorker" in navigator && !params.has("no-sw")) {
      window.addEventListener('load', async () => {
        try {
          const reg = await navigator.serviceWorker.register("/sw.js?v=__BUILD_VER__");
          
          // Periodically check for updates
          document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') reg.update();
          });
          
          // When a new SW takes control, reload to ensure fresh HTML/CSS
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            // avoid reload loops
            if (!window.__reloadedForSW) {
              window.__reloadedForSW = true;
              location.reload();
            }
          });
        } catch (e) {
          console.warn('SW registration failed', e);
        }
      });
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

// Contact fallback email
const CONTACT_FALLBACK_EMAIL = 'contact@vipspot.net';

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

        // Store reference to the triggering button for focus return
        this.triggeringButton = document.querySelector(`[data-project="${projectId}"]`);

        this.renderModalContent(project);
        this.modal.classList.remove('hidden');
        this.modal.setAttribute('aria-hidden', 'false');
        this.isOpen = true;

        // Update aria-expanded on the triggering button
        if (this.triggeringButton) {
            this.triggeringButton.setAttribute('aria-expanded', 'true');
        }

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

        // Update aria-expanded on the triggering button
        if (this.triggeringButton) {
            this.triggeringButton.setAttribute('aria-expanded', 'false');
        }

        // Restore body scroll
        document.body.classList.remove('body-overflow-hidden');
        document.body.classList.add('body-overflow-auto');

        // Return focus to the triggering button
        if (this.triggeringButton) {
            this.triggeringButton.focus();
        }
        
        // Clear reference
        this.triggeringButton = null;
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
    
});

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { VIPSpotApp, Utils };
}

// --- CONTACT FORM (bulletproof + debug) ---
(() => {
  // If already registered (defensive), do nothing.
  if (window.VIPSpot?.Contact) return;

  // === Debug toggle ===
  const DEBUG =
    /(^|[?&])debug=1(&|$)/.test(location.search) ||
    localStorage.getItem('vipspot:debug') === '1';

  const dlog = (...a) => DEBUG && console.log('[contact]', ...a);
  const dwarn = (...a) => DEBUG && console.warn('[contact]', ...a);
  const derr = (...a) => DEBUG && console.error('[contact]', ...a);

  // === Request ID (correlation id) ===
  const rid = () =>
    (crypto && crypto.randomUUID ? crypto.randomUUID() : (Date.now() + '-' + Math.random().toString(36).slice(2)));

  // === Minimal DOM helpers (safe) ===
  const $ = (sel, root = document) => root.querySelector(sel);
  const text = (el, t) => { if (el) el.textContent = String(t ?? ''); };

  // === Debug overlay (optional) ===
  const ensureDebugPanel = () => {
    if (!DEBUG) return null;
    let p = $('#contact-debug-panel');
    if (!p) {
      const css = 'position:fixed;bottom:8px;left:8px;max-width:min(95vw,700px);max-height:35vh;overflow:auto;padding:8px 10px;border-radius:8px;background:#0b1324;color:#9fe8a8;font:12px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace;box-shadow:0 6px 30px rgba(0,0,0,.4);z-index:999999;opacity:.95;';
      p = document.createElement('pre');
      p.id = 'contact-debug-panel';
      p.setAttribute('style', css);
      document.body.appendChild(p);
    }
    return p;
  };
  const debugOut = (lines, title='') => {
    const p = ensureDebugPanel();
    if (!p) return;
    p.textContent = (title ? `# ${title}\n` : '') + (Array.isArray(lines) ? lines.join('\n') : String(lines));
  };

  // === Button + status handling (safe) ===
  const getForm = () => $('#contact-form');
  const getSubmitBtn = () => $('#contact-submit') || $('[data-role="contact-submit"]') || (getForm() && getForm().querySelector('button[type="submit"]'));
  const getStatusEl = () => {
    let el = $('#contact-status') || $('[data-contact-status]') || (getForm() && getForm().querySelector('[role="status"]'));
    
    if (el) return el;

    // Lazily create if missing
    const form = getForm();
    if (!form) return null;
    el = document.createElement('div');
    el.id = 'contact-status';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.setAttribute('aria-atomic', 'true');
    el.className = 'contact-status';
    form.appendChild(el);
    return el;
  };

  const setBusy = (busy) => {
    const btn = getSubmitBtn();
    if (!btn) return;
    try {
      if (busy) {
        btn.dataset.orig = btn.textContent || btn.value || 'Send Message';
        (btn.classList && btn.classList.add('is-loading'));
        btn.disabled = true;
        text(btn, 'Sending...');
      } else {
        text(btn, btn.dataset.orig || 'Send Message');
        (btn.classList && btn.classList.remove('is-loading'));
        btn.disabled = false;
      }
    } catch (e) { dwarn('btn state warn', e); }
  };

  const say = (msg, kind='info') => {
    const el = getStatusEl();
    if (!el) return dlog('status:', kind, msg);
    el.setAttribute('data-kind', kind);
    text(el, msg);
    try {
      el.classList.remove('ok', 'error', 'info');
      el.classList.add(kind);
    } catch (e) { dwarn('status class warn', e); }
  };

  // === Client cooldown (prevents 429 spam) ===
  const COOLDOWN_MS = 30_000;
  const cdKey = 'contact:lastSent';
  
  // Safe localStorage wrapper
  const storage = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} },
    remove(k) { try { localStorage.removeItem(k); } catch {} },
  };
  
  const tooSoon = () => {
    const last = +(storage.get(cdKey) || 0);
    const remain = COOLDOWN_MS - (Date.now() - last);
    return remain > 0 ? remain : 0;
  };

  // === API base (keep in one place) ===
  const API = (window.VIPSpot && VIPSpot.API_BASE) ||
             'https://vipspot-api-a7ce781e1397.herokuapp.com';
  const PATH = '/contact'; // Single source of truth

  // === Hardened fetch with timeout + correlation id ===
  const postJSON = async (path, body, requestId) => {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 15000); // 15s
    const headers = {
      'Content-Type': 'application/json',
      'X-Request-ID': requestId,
      'X-From-Origin': location.origin
    };
    try {
      const res = await fetch(API + path, {
        method: 'POST',
        mode: 'cors',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal
      });
      const textBody = await res.text();
      let json = {};
      try { json = textBody ? JSON.parse(textBody) : {}; } catch{ /* keep text in json._ */ json._ = textBody; }

      return { res, json, textBody };
    } finally {
      clearTimeout(t);
    }
  };

  // === Submit handler ===
  const onSubmit = async (ev) => {
    ev?.preventDefault?.();

    const remain = tooSoon();
    if (remain > 0) {
      say(`You're doing that too fast. Please wait ${Math.ceil(remain/1000)} seconds and try again.`, 'error');
      return;
    }

    const form = getForm();
    if (!form) {
      say('Form not found on page.', 'error');
      return;
    }

    const id = rid();
    const payload = {
      requestId: id,
      name: $('#name')?.value?.trim() || '',
      email: $('#email')?.value?.trim() || '',
      message: $('#message')?.value?.trim() || '',
      company: $('#company')?.value || '',
      timestamp: Date.now(),
      source: 'vipspot.net/contact'
    };

    dlog(`#${id} submitting`, payload);
    debugOut(JSON.stringify({ rid: id, payload }, null, 2), 'Contact: request');

    try {
      setBusy(true);
      say('Sending...', 'info');

      const { res, json, textBody } = await postJSON(PATH, payload, id);
      dlog(`#${id} response`, res.status, json || textBody);
      debugOut(JSON.stringify({ rid: id, status: res.status, body: json || textBody }, null, 2), 'Contact: response');

      if (res.status === 429) {
        const retry = +(res.headers.get('Retry-After') || json?.retryAfter || 30);
        say(`You're doing that too fast. Please wait ${retry} seconds and try again.`, 'error');
        return;
      }
      if (!res.ok || !json?.ok) {
        say(json?.message || `Error: ${res.status}`, 'error');
        return;
      }

      // success
      storage.set(cdKey, String(Date.now())); // start cooldown
      say('Message sent successfully! I will get back to you shortly.', 'ok');
      form.reset?.();
      
      // Reset timestamp
      const timestampField = $('input[name="timestamp"]');
      if (timestampField) timestampField.value = Date.now();

    } catch (e) {
      derr('network error', e);
      say('Network error. Please check your connection and try again.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const init = () => {
    const form = getForm();
    const btn = getSubmitBtn();
    
    if (form) form.addEventListener('submit', onSubmit);
    if (btn && !form) btn.addEventListener('click', onSubmit); // fallback
    
    // Initialize timestamp
    const timestampField = $('input[name="timestamp"]');
    if (timestampField) timestampField.value = Date.now();
    
    // Character counter for message field
    const messageField = $('textarea[name="message"]');
    if (messageField) {
      const maxChars = 4000;
      let counter = $('#msg-count') || messageField.parentElement?.querySelector('.char-counter');
      
      if (!counter && messageField.parentElement) {
        counter = document.createElement('div');
        counter.className = 'char-counter';
        counter.id = 'msg-count';
        messageField.parentElement.appendChild(counter);
      }

      const updateCounter = () => {
        if (!counter) return;
        try {
          const current = messageField.value?.length || 0;
          counter.textContent = `${current} / ${maxChars}`;
          
          if (current > maxChars * 0.9) {
            counter.classList.add('warning');
          } else {
            counter.classList.remove('warning');
          }
          
          if (current > maxChars) {
            counter.classList.add('error');
            messageField.setCustomValidity?.('Message too long');
          } else {
            counter.classList.remove('error');
            messageField.setCustomValidity?.('');
          }
        } catch (e) {
          console.warn('[contact] counter update failed', e);
        }
      };

      if (messageField) messageField.addEventListener('input', updateCounter);
      updateCounter(); // Initial count
    }

    dlog('contact init: form=', !!form, 'btn=', !!btn, 'API=', API);
  };

  // Export on global namespace to avoid re-declaring consts
  window.VIPSpot = window.VIPSpot || {};
  window.VIPSpot.Contact = { init };

  document.addEventListener('DOMContentLoaded', () => {
    try { window.VIPSpot.Contact.init(); } catch (e) { console.warn('[contact] init', e); }
  });
})();