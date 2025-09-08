(function () {
  'use strict';

    window.addEventListener("load", function() {
  // Hide loader after page is fully loaded
  document.getElementById("loader").style.display = "none";
  document.getElementById("content").style.display = "block";
});

  // --- Logo Carousel ---
  function initLogoCarousel() {
      const banner = document.querySelector('.logo-scroll-banner');
      if (!banner || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      
      const content = banner.querySelector('.logo-scroll-content');
      if (!content) return;
      
      const items = Array.from(content.children);
      items.forEach(item => {
          const clone = item.cloneNode(true);
          clone.setAttribute('aria-hidden', true);
          content.appendChild(clone);
      });
  }

  // --- Mobile Navigation ---
  function initMobileNav() {
    const toggle = document.getElementById('menuToggle');
    const mobileNav = document.getElementById('mobileNav');
    const header = document.querySelector('header');

    if (!toggle || !mobileNav || !header) return;

    function closeMenu() {
      document.body.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', () => {
      const isOpen = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    mobileNav.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') closeMenu();
    });

    document.addEventListener('click', (e) => {
      if (!header.contains(e.target)) closeMenu();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
  }

  // --- Scroll Reveal Animation ---
  // A shared observer for all scroll-reveal elements
  let scrollObserver;

  function initScrollReveal() {
    const staticEls = Array.from(document.querySelectorAll('.reveal-on-scroll'));
    
    if (!('IntersectionObserver' in window)) {
      staticEls.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          scrollObserver.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -10% 0px',
      threshold: prefersReduced ? 0.01 : 0.15
    });

    // Observe elements that are already in the HTML on page load
    staticEls.forEach(el => scrollObserver.observe(el));
  }
  
  // --- Generic Carousel Logic ---
  function initCarousel(carouselSelector) {
    const el = document.querySelector(carouselSelector);
    if (!el) return;

    const track = el.querySelector('.carousel-track');
    const slides = Array.from(el.querySelectorAll('.carousel-slide'));
    const prev = el.querySelector('.prev');
    const next = el.querySelector('.next');
    const dotsContainer = el.querySelector('.carousel-dots');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!track || slides.length === 0) return;

    let currentIndex = 0;

    function updateCarousel() {
        const slideWidth = slides[0].offsetWidth;
        const gap = parseInt(window.getComputedStyle(track).gap) || 16;
        track.scrollTo({
            left: currentIndex * (slideWidth + gap),
            behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });
        updateDots();
    }
    
    function updateDots() {
        if (!dotsContainer) return;
        const dots = Array.from(dotsContainer.children);
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }

    if (dotsContainer) {
        slides.forEach((_, i) => {
            const b = document.createElement('button');
            b.className = 'dot';
            b.setAttribute('aria-label', `Go to slide ${i + 1}`);
            b.addEventListener('click', () => {
                currentIndex = i;
                updateCarousel();
            });
            dotsContainer.appendChild(b);
        });
    }

    if (prev && next) {
        prev.addEventListener('click', () => {
            currentIndex = Math.max(currentIndex - 1, 0);
            updateCarousel();
        });

        next.addEventListener('click', () => {
            currentIndex = Math.min(currentIndex + 1, slides.length - 1);
            updateCarousel();
        });
    }
    
    const scrollHandler = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                const index = slides.indexOf(entry.target);
                currentIndex = index;
                updateDots();
            }
        });
    }, { root: track, threshold: 0.6 });

    slides.forEach(slide => scrollHandler.observe(slide));

    updateDots();
  }

  // --- Contact Form Handler ---
  function initContactForm() {
      const form = document.getElementById('contact-form');
      const formMessage = document.getElementById('form-message');
      if (!form || !formMessage) return;

      form.addEventListener('submit', function(event) {
          event.preventDefault();
          formMessage.textContent = 'Thank you! Your message has been sent.';
          formMessage.classList.add('visible');
          form.reset();
          setTimeout(() => {
              formMessage.classList.remove('visible');
          }, 4000);
      });
  }

  // --- Team Page Logic ---
  async function initTeamPage() {
    const mainGrid = document.getElementById('team-grid-main');
    const pageGrid = document.getElementById('team-page-grid');
    const viewTeamButtons = document.querySelectorAll('#view-team-btn-hero, #view-team-btn-main');
    const backButton = document.getElementById('back-to-main-btn');
    const teamPage = document.getElementById('team-page');

    if (!mainGrid || !pageGrid || !teamPage) return;

    try {
        const response = await fetch('team.json');
        if (!response.ok) throw new Error('Network response was not ok');
        const teamData = await response.json();

        // Populate Main Page Core Team
        const coreTeam = teamData.filter(member => member.isCoreTeam);
        mainGrid.innerHTML = coreTeam.map(member => `
            <article class="profile glass reveal-on-scroll" aria-label="Team member ${member.name}">
              <div class="avatar" aria-hidden="true">${member.initials}</div>
              <h4>${member.name}</h4>
              <div class="role">${member.title}</div>
              <p>${member.bio}</p>
            </article>
        `).join('');
        
        // **FIX:** Observe the newly created team cards
        mainGrid.querySelectorAll('.reveal-on-scroll').forEach(el => {
            if (scrollObserver) {
                scrollObserver.observe(el);
            } else {
                el.classList.add('is-visible'); // Fallback
            }
        });

        // Populate Full Team Page
        pageGrid.innerHTML = teamData.map(member => `
          <div class="team-card-flip">
              <div class="team-card-inner">
                  <div class="team-card-front glass">
                      <div class="avatar-large" style="background-image: url('${member.image}')"></div>
                      <h3>${member.name}</h3>
                      <p>${member.title}</p>
                      <div class="flip-indicator">Click to learn more</div>
                  </div>
                  <div class="team-card-back glass">
                      <h4>${member.name}</h4>
                      <p>${member.fullBio}</p>
                      <div class="team-socials">
                          ${member.socials.linkedin ? `<a href="${member.socials.linkedin}" aria-label="LinkedIn Profile"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor"/><path d="M8 10v7M8 7.5v.1M12 17v-4a3 3 0 0 1 6 0v4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></a>` : ''}
                          ${member.socials.publications ? `<a href="${member.socials.publications}" aria-label="Publication Profile"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20v2H6.5A2.5 2.5 0 0 1 4 17Z M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12H4V5Z" stroke="currentColor" stroke-width="1.6"/></svg></a>` : ''}
                          ${member.socials.github ? `<a href="${member.socials.github}" aria-label="GitHub Profile"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6.2 0-1.4-.5-2.5-1.3-3.4.1-.3.5-1.6 0-3.2 0 0-1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.5 3.1 5.5 3.1c-.5 1.6-.1 2.9 0 3.2C4.7 7.2 4.2 8.3 4.2 9.7c0 4.8 2.7 5.9 5.5 6.2-.6.5-.6 1.2-.6 2.2V21" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></a>` : ''}
                      </div>
                  </div>
              </div>
          </div>
        `).join('');

    } catch (error) {
        console.error('Failed to fetch or render team data:', error);
        mainGrid.innerHTML = `<p>Error loading team members.</p>`;
    }
    
    // Attach event listeners
    const showTeamPage = (event) => {
        event.preventDefault();
        document.body.classList.add('show-team', 'prevent-scroll');
        window.scrollTo(0, 0);
        teamPage.focus();
    };
    const hideTeamPage = () => {
        document.body.classList.remove('show-team', 'prevent-scroll');
    };
    viewTeamButtons.forEach(btn => btn.addEventListener('click', showTeamPage));
    backButton.addEventListener('click', hideTeamPage);
  }

  // --- Gallery Modal & Lightbox ---
  async function initGallery() {
    const mainGrid = document.getElementById('gallery-grid');
    const modal = document.getElementById('gallery-modal');
    const modalCloseBtn = document.getElementById('gallery-modal-close');
    const modalTitle = document.getElementById('gallery-modal-title');
    const modalGrid = document.getElementById('gallery-modal-grid');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCloseBtn = lightbox.querySelector('.lightbox-close');

    if (!mainGrid || !modal || !lightbox) return;

    let galleryData = {};

    try {
        const response = await fetch('gallery.json');
        if (!response.ok) throw new Error('Network response was not ok');
        galleryData = await response.json();

        // Populate main gallery grid
        mainGrid.innerHTML = Object.keys(galleryData).map(key => {
            const item = galleryData[key];
            return `
              <a href="#" class="gallery-item glass reveal-on-scroll" data-gallery-id="${key}" aria-label="View photos of ${item.title}">
                  <img src="${item.coverImage}" alt="${item.altText}">
                  <div class="gallery-caption">${item.title}</div>
              </a>
            `;
        }).join('');
        
        // **FIX:** Observe the newly created gallery cards
        mainGrid.querySelectorAll('.reveal-on-scroll').forEach(el => {
            if (scrollObserver) {
                scrollObserver.observe(el);
            } else {
                el.classList.add('is-visible'); // Fallback
            }
        });

    } catch(error) {
        console.error('Failed to fetch or render gallery data:', error);
        mainGrid.innerHTML = `<p>Error loading gallery.</p>`;
    }

    // Modal and Lightbox Logic
    function openModal(galleryId) {
        const data = galleryData[galleryId];
        if (!data) return;

        modalTitle.textContent = data.title;
        modalGrid.innerHTML = data.images.map(imgSrc => 
            `<img src="${imgSrc}" alt="${data.title} - Image" loading="lazy">`
        ).join('');
        
        modal.classList.add('is-visible');
        document.body.classList.add('prevent-scroll');
    }
    
    function closeModal() {
        modal.classList.remove('is-visible');
        document.body.classList.remove('prevent-scroll');
    }

    function openLightbox(imgSrc) {
        lightboxImg.src = imgSrc;
        lightbox.classList.add('is-visible');
    }

    function closeLightbox() {
        lightbox.classList.remove('is-visible');
    }
    
    mainGrid.addEventListener('click', (e) => {
        const galleryItem = e.target.closest('.gallery-item');
        if (galleryItem) {
            e.preventDefault();
            const galleryId = galleryItem.dataset.galleryId;
            openModal(galleryId);
        }
    });

    modalGrid.addEventListener('click', (e) => {
        if (e.target.tagName === 'IMG') {
            openLightbox(e.target.src);
        }
    });

    modalCloseBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    lightboxCloseBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (lightbox.classList.contains('is-visible')) closeLightbox();
        else if (modal.classList.contains('is-visible')) closeModal();
      }
    });
  }

  // --- Initialize all scripts on DOMContentLoaded ---
  document.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
    initScrollReveal();
    initLogoCarousel();
    initContactForm();
    initCarousel('.achievements-carousel');
    initTeamPage();
    initGallery();
  });

})();

