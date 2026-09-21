/**
 * Alessandro | Portfolio Landing Page Logic
 * Features:
 * 1. Count-up animation for Impact Numbers with IntersectionObserver
 * 2. Strict prefers-reduced-motion compliance
 * 3. Accessible mobile navigation toggle
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initImpactCounter();
  initVideoModal();
  initCampaignSlider();
  initWorkFilters();
  initCarouselSliders();
  initSectionSliders();
});

/**
 * Mobile Navigation Toggle & ARIA controls
 */
function initMobileNav() {
  const toggleBtn = document.querySelector('.menu-toggle-btn');
  const navWrapper = document.querySelector('.nav-links-wrapper');
  const navBackdrop = document.querySelector('.nav-backdrop');
  const navLinks = document.querySelectorAll('.nav-link-item, .btn-nav-cv');

  if (!toggleBtn || !navWrapper) return;

  function setMenuOpen(open) {
    toggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      navWrapper.classList.add('is-open');
      if (navBackdrop) navBackdrop.classList.add('is-active');
    } else {
      navWrapper.classList.remove('is-open');
      if (navBackdrop) navBackdrop.classList.remove('is-active');
    }
  }

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = toggleBtn.getAttribute('aria-expanded') === 'true';
    setMenuOpen(!isOpen);
  });

  if (navBackdrop) {
    navBackdrop.addEventListener('click', () => {
      setMenuOpen(false);
    });
  }

  // Close when clicking any nav link
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      setMenuOpen(false);
    });
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!navWrapper.contains(e.target) && !toggleBtn.contains(e.target)) {
      setMenuOpen(false);
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggleBtn.getAttribute('aria-expanded') === 'true') {
      setMenuOpen(false);
      toggleBtn.focus();
    }
  });
}

/**
 * Impact Numbers Count-Up Animation
 * Respects prefers-reduced-motion and animates over ~1.2s with ease-out curve
 */
function initImpactCounter() {
  const statElements = document.querySelectorAll('.impact-value[data-target]');
  if (!statElements.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // If user prefers reduced motion, set final values directly
  if (prefersReducedMotion) {
    statElements.forEach((el) => {
      el.textContent = el.getAttribute('data-final');
    });
    return;
  }

  // Animation configuration
  const DURATION = 1200; // ~1.2s as specified in PRD
  let hasAnimated = false;

  const easeOutQuad = (t) => t * (2 - t);

  function animateStats() {
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / DURATION, 1);
      const easedProgress = easeOutQuad(progress);

      statElements.forEach((el) => {
        const target = parseFloat(el.getAttribute('data-target'));
        const prefix = el.getAttribute('data-prefix') || '';
        const suffix = el.getAttribute('data-suffix') || '';
        const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
        const useComma = el.getAttribute('data-comma') === 'true';

        const currentValue = target * easedProgress;

        let formattedNumber;
        if (decimals > 0) {
          formattedNumber = currentValue.toFixed(decimals);
        } else {
          const rounded = Math.floor(currentValue);
          formattedNumber = useComma ? rounded.toLocaleString('en-US') : rounded.toString();
        }

        // When complete, render exact final value string
        if (progress >= 1) {
          el.textContent = el.getAttribute('data-final');
        } else {
          el.textContent = `${prefix}${formattedNumber}${suffix}`;
        }
      });

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  // Observer to trigger animation once when scrolled into view
  const impactSection = document.querySelector('.impact-section');
  if (impactSection && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            hasAnimated = true;
            animateStats();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(impactSection);
  } else {
    // Fallback if IntersectionObserver not available
    animateStats();
  }
}

/**
 * Accessible Video Modal for Playable Reels
 */
function initVideoModal() {
  const modal = document.getElementById('video-modal');
  const videoPlayer = document.getElementById('modal-video-player');
  const closeBtn = document.querySelector('.video-modal-close');
  const backdrop = document.querySelector('.video-modal-backdrop');
  const triggers = document.querySelectorAll('.video-trigger');

  if (!modal || !videoPlayer) return;

  function openModal(videoSrc) {
    videoPlayer.src = videoSrc;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    videoPlayer.play().catch(() => {});
  }

  function closeModal() {
    videoPlayer.pause();
    videoPlayer.currentTime = 0;
    videoPlayer.src = '';
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const src = trigger.getAttribute('data-video');
      if (src) openModal(src);
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  if (backdrop) {
    backdrop.addEventListener('click', closeModal);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });
}

/**
 * Filter Works by Brand / Company
 */
function initWorkFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const workCards = document.querySelectorAll('.work-card');

  if (!filterBtns.length || !workCards.length) return;

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');

      // Update button states
      filterBtns.forEach((b) => {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');

      // Filter cards
      workCards.forEach((card) => {
        const brand = card.getAttribute('data-brand');
        if (filter === 'all' || brand === filter) {
          card.classList.remove('is-hidden');
        } else {
          card.classList.add('is-hidden');
        }
      });

      // Toggle slider groups visibility and reset slider scroll
      const sliderGroups = document.querySelectorAll('.work-slider-group');
      sliderGroups.forEach((group) => {
        const visibleInGroup = group.querySelectorAll('.work-card:not(.is-hidden)');
        if (filter === 'all' || visibleInGroup.length > 0) {
          group.classList.remove('is-hidden');
          const track = group.querySelector('.work-slider-track');
          if (track) {
            track.scrollLeft = 0;
            if (typeof track._updateSliderState === 'function') {
              track._updateSliderState();
            }
          }
        } else {
          group.classList.add('is-hidden');
        }
      });
    });
  });
}

/**
 * Interactive Multi-Slide Carousel Flipper
 */
function initCarouselSliders() {
  const carousels = document.querySelectorAll('.work-card-carousel');

  carousels.forEach((card) => {
    const slider = card.querySelector('.carousel-slider');
    if (!slider) return;

    let slides = [];
    try {
      slides = JSON.parse(slider.getAttribute('data-slides') || '[]');
    } catch (e) {
      console.error('Failed to parse carousel slides JSON', e);
      return;
    }

    if (!slides.length) return;

    const img = slider.querySelector('.carousel-slide-img');
    const counter = card.querySelector('.carousel-counter');
    const prevBtn = card.querySelector('.carousel-arrow.prev');
    const nextBtn = card.querySelector('.carousel-arrow.next');

    let currentIndex = 0;

    function renderSlide(index) {
      if (!img) return;
      img.src = slides[index];
      if (counter) {
        counter.textContent = `Slide ${index + 1}/${slides.length}`;
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        renderSlide(currentIndex);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex + 1) % slides.length;
        renderSlide(currentIndex);
      });
    }
  });
}

/**
 * Interactive Featured Campaign Slider Switcher
 */
function initCampaignSlider() {
  const wrapper = document.querySelector('.campaign-slider-wrapper');
  if (!wrapper) return;

  const tabs = wrapper.querySelectorAll('.campaign-tab-btn');
  const slides = wrapper.querySelectorAll('.campaign-slide');
  const prevBtn = wrapper.querySelector('.campaign-prev-btn');
  const nextBtn = wrapper.querySelector('.campaign-next-btn');
  const counter = wrapper.querySelector('.campaign-counter');
  const totalSlides = slides.length;
  let activeIndex = 0;

  function goToSlide(index) {
    if (index < 0) index = 0;
    if (index >= totalSlides) index = totalSlides - 1;
    activeIndex = index;

    // Update active slide visibility
    slides.forEach((slide, idx) => {
      const isActive = idx === activeIndex;
      slide.classList.toggle('is-active', isActive);
    });

    // Update active tab buttons
    tabs.forEach((tab, idx) => {
      const isActive = idx === activeIndex;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    // Update counter
    if (counter) {
      counter.textContent = `${activeIndex + 1} / ${totalSlides}`;
    }

    // Update navigation button states
    if (prevBtn) {
      prevBtn.classList.toggle('is-disabled', activeIndex === 0);
      prevBtn.disabled = activeIndex === 0;
    }
    if (nextBtn) {
      nextBtn.classList.toggle('is-disabled', activeIndex === totalSlides - 1);
      nextBtn.disabled = activeIndex === totalSlides - 1;
    }
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const slideIdx = parseInt(tab.getAttribute('data-slide') || '0', 10);
      goToSlide(slideIdx);
    });
  });

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      goToSlide(activeIndex - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      goToSlide(activeIndex + 1);
    });
  }

  // Handle fullscreen preservation so Chrome never crops 9:16 portrait reels
  ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange'].forEach((evt) => {
    document.addEventListener(evt, () => {
      const fsElement = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement;
      if (fsElement && fsElement.tagName === 'VIDEO') {
        fsElement.style.setProperty('object-fit', 'contain', 'important');
      }
    });
  });

  // Set initial state
  goToSlide(0);
}

/**
 * Interactive Horizontal Sliders for Creative Execution Categories
 * Features:
 * - Smooth button navigation
 * - Responsive card peeking
 * - Progress bar indicator
 * - Live slide index counter
 * - Mouse drag-to-scroll & Touch swipe support
 * - Visual cue auto-hide on first scroll
 */
function initSectionSliders() {
  const groups = document.querySelectorAll('.work-slider-group');

  groups.forEach((group) => {
    const track = group.querySelector('.work-slider-track');
    const prevBtn = group.querySelector('.prev-btn');
    const nextBtn = group.querySelector('.next-btn');
    const counter = group.querySelector('.slider-counter');
    const progressBar = group.querySelector('.slider-progress-bar');
    const hintPill = group.querySelector('.slider-hint-pill');

    if (!track) return;

    function getVisibleCards() {
      return Array.from(track.querySelectorAll('.work-card')).filter(
        (card) => card.offsetParent !== null && !card.classList.contains('is-hidden')
      );
    }

    function updateSliderState() {
      const visibleCards = getVisibleCards();
      const total = visibleCards.length;
      if (total === 0) return;

      const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
      const currentScroll = track.scrollLeft;

      // Update progress bar
      if (progressBar) {
        const ratio = maxScroll > 0 ? (currentScroll / maxScroll) : 1;
        const widthPercent = Math.min(100, Math.max(15, Math.round(15 + ratio * 85)));
        progressBar.style.width = `${widthPercent}%`;
      }

      // Update button disabled states
      const isStart = currentScroll <= 6;
      const isEnd = currentScroll >= maxScroll - 6;

      if (prevBtn) {
        prevBtn.classList.toggle('is-disabled', isStart);
        prevBtn.disabled = isStart;
      }
      if (nextBtn) {
        nextBtn.classList.toggle('is-disabled', isEnd);
        nextBtn.disabled = isEnd;
      }

      // Calculate active card index
      if (counter && visibleCards.length > 0) {
        let activeIdx = 0;
        const trackLeft = track.getBoundingClientRect().left;
        visibleCards.forEach((card, idx) => {
          const cardLeft = card.getBoundingClientRect().left;
          if (cardLeft - trackLeft <= 40) {
            activeIdx = idx;
          }
        });
        counter.textContent = `${activeIdx + 1} / ${total}`;
      }

      // Hide animated hint once user has scrolled
      if (hintPill && currentScroll > 25) {
        hintPill.classList.add('is-hidden-hint');
      }
    }

    // Expose for filter refresh
    track._updateSliderState = updateSliderState;

    // Scroll by card width on arrow clicks
    function scrollTrack(direction) {
      const visibleCards = getVisibleCards();
      if (!visibleCards.length) return;

      const cardWidth = visibleCards[0].offsetWidth;
      const gap = 24;
      const scrollAmount = (cardWidth + gap) * direction;

      track.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => scrollTrack(-1));
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => scrollTrack(1));
    }

    // Passive scroll listener
    let scrollTicking = false;
    track.addEventListener('scroll', () => {
      if (!scrollTicking) {
        requestAnimationFrame(() => {
          updateSliderState();
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    }, { passive: true });

    // Desktop Drag-to-Scroll Support
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let isDragging = false;

    track.addEventListener('mousedown', (e) => {
      if (e.target.closest('button, a, .carousel-arrow')) return;
      isDown = true;
      isDragging = false;
      track.classList.add('is-dragging');
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
    });

    track.addEventListener('mouseleave', () => {
      if (!isDown) return;
      isDown = false;
      track.classList.remove('is-dragging');
    });

    track.addEventListener('mouseup', () => {
      isDown = false;
      track.classList.remove('is-dragging');
      setTimeout(() => {
        isDragging = false;
      }, 50);
    });

    track.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 1.35;
      if (Math.abs(walk) > 4) {
        isDragging = true;
      }
      track.scrollLeft = scrollLeft - walk;
    });

    track.addEventListener('click', (e) => {
      if (isDragging) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);

    // Run initial state
    updateSliderState();
  });
}



