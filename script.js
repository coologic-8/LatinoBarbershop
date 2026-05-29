/* ========================================
   Latino's Barbershop — Scripts
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ---------- AOS Init ----------
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 700,
      once: true,
      offset: 100,
      easing: 'ease-out-cubic'
    });
  }

  // ---------- Navbar Scroll Effect ----------
  const navbar = document.querySelector('.navbar');
  const handleNavScroll = () => {
    if (window.scrollY > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleNavScroll);
  handleNavScroll();

  // ---------- Active Nav Link Highlight ----------
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

  const highlightNav = () => {
    const scrollY = window.scrollY + 120;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  };
  window.addEventListener('scroll', highlightNav);

  // ---------- Mobile Hamburger ----------
  const hamburger = document.querySelector('.hamburger');
  const mobileDrawer = document.querySelector('.mobile-drawer');
  const drawerOverlay = document.querySelector('.drawer-overlay');
  const mobileLinks = document.querySelectorAll('.mobile-drawer a');

  const toggleDrawer = () => {
    hamburger.classList.toggle('active');
    mobileDrawer.classList.toggle('open');
    drawerOverlay.classList.toggle('open');
    document.body.style.overflow = mobileDrawer.classList.contains('open') ? 'hidden' : '';
  };

  hamburger.addEventListener('click', toggleDrawer);
  drawerOverlay.addEventListener('click', toggleDrawer);

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (mobileDrawer.classList.contains('open')) {
        toggleDrawer();
      }
    });
  });

  // ---------- Smooth Scroll ----------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ---------- Review Carousel (Mobile) ----------
  const reviewCards = document.querySelectorAll('.review-card');
  const dots = document.querySelectorAll('.review-dot');
  let currentReview = 0;
  let autoSlideInterval;

  const showReview = (index) => {
    if (window.innerWidth > 768) return;
    reviewCards.forEach((card, i) => {
      card.classList.toggle('carousel-active', i === index);
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
    currentReview = index;
  };

  const startAutoSlide = () => {
    autoSlideInterval = setInterval(() => {
      const next = (currentReview + 1) % reviewCards.length;
      showReview(next);
    }, 5000);
  };

  const resetAutoSlide = () => {
    clearInterval(autoSlideInterval);
    startAutoSlide();
  };

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      showReview(i);
      resetAutoSlide();
    });
  });

  const initCarousel = () => {
    if (window.innerWidth <= 768) {
      showReview(0);
      startAutoSlide();
    } else {
      clearInterval(autoSlideInterval);
      reviewCards.forEach(card => card.classList.remove('carousel-active'));
    }
  };

  initCarousel();
  window.addEventListener('resize', () => {
    clearInterval(autoSlideInterval);
    initCarousel();
  });

  // ---------- Touch Swipe for Carousel ----------
  const reviewsContainer = document.querySelector('.reviews-container');
  let touchStartX = 0;
  let touchEndX = 0;

  if (reviewsContainer) {
    reviewsContainer.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    reviewsContainer.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          showReview((currentReview + 1) % reviewCards.length);
        } else {
          showReview((currentReview - 1 + reviewCards.length) % reviewCards.length);
        }
        resetAutoSlide();
      }
    }, { passive: true });
  }

  // ---------- Parallax Hero (subtle) ----------
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      if (scrolled < window.innerHeight) {
        heroBg.style.transform = `translateY(${scrolled * 0.3}px)`;
      }
    });
  }

  // ---------- Counter Animation for Trust Bar ----------
  const animateCounters = () => {
    const counters = document.querySelectorAll('[data-count]');
    counters.forEach(counter => {
      const target = parseFloat(counter.dataset.count);
      const suffix = counter.dataset.suffix || '';
      const isDecimal = target % 1 !== 0;
      let current = 0;
      const increment = target / 40;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        counter.textContent = isDecimal ? current.toFixed(1) + suffix : Math.floor(current) + suffix;
      }, 30);
    });
  };

  const trustBar = document.querySelector('.trust-bar');
  if (trustBar) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounters();
          observer.disconnect();
        }
      });
    }, { threshold: 0.5 });
    observer.observe(trustBar);
  }

  // ============================================
  // BOOKING MODAL SYSTEM
  // ============================================

  const bookingOverlay = document.getElementById('bookingOverlay');
  const bookingModal = document.getElementById('bookingModal');
  const bookingClose = document.getElementById('bookingClose');

  const step1 = document.getElementById('bookingStep1');
  const step2 = document.getElementById('bookingStep2');
  const step3 = document.getElementById('bookingStep3');
  const successStep = document.getElementById('bookingSuccess');
  const loadingEl = document.getElementById('bookingLoading');

  const serviceSelect = document.getElementById('bookService');
  const dateInput = document.getElementById('bookDate');
  const timeSlotsContainer = document.getElementById('timeSlots');

  const nameInput = document.getElementById('bookName');
  const phoneInput = document.getElementById('bookPhone');
  const emailInput = document.getElementById('bookEmail');
  const notesInput = document.getElementById('bookNotes');

  const btnNext1 = document.getElementById('btnNext1');
  const btnNext2 = document.getElementById('btnNext2');
  const btnBack2 = document.getElementById('btnBack2');
  const btnBack3 = document.getElementById('btnBack3');
  const btnConfirm = document.getElementById('btnConfirm');

  const progressSteps = document.querySelectorAll('.progress-step');
  const progressFills = document.querySelectorAll('.progress-fill');

  let selectedTime = '';

  // --- Business Hours Config ---
  const businessHours = {
    0: { open: '9:00', close: '15:00' },  // Sunday
    1: { open: '9:00', close: '18:00' },  // Monday
    2: { open: '9:00', close: '18:00' },
    3: { open: '9:00', close: '18:00' },
    4: { open: '9:00', close: '18:00' },
    5: { open: '9:00', close: '18:00' },
    6: { open: '9:00', close: '18:00' },  // Saturday
  };

  // --- Open / Close Modal ---
  window.openBookingModal = function() {
    bookingOverlay.classList.add('open');
    bookingModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    resetBookingForm();
  };

  window.closeBookingModal = function() {
    bookingOverlay.classList.remove('open');
    bookingModal.classList.remove('open');
    document.body.style.overflow = '';
  };

  bookingClose.addEventListener('click', closeBookingModal);
  bookingOverlay.addEventListener('click', closeBookingModal);

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && bookingModal.classList.contains('open')) {
      closeBookingModal();
    }
  });

  // --- Reset form ---
  function resetBookingForm() {
    serviceSelect.value = '';
    dateInput.value = '';
    nameInput.value = '';
    phoneInput.value = '';
    emailInput.value = '';
    notesInput.value = '';
    selectedTime = '';
    timeSlotsContainer.innerHTML = '<p class="time-slots-hint">Select a date to see available times</p>';
    showStep(1);
    updateStep1Validation();
  }

  // --- Step navigation ---
  function showStep(num) {
    [step1, step2, step3, successStep].forEach(s => s.style.display = 'none');
    loadingEl.style.display = 'none';

    if (num === 1) step1.style.display = 'block';
    if (num === 2) step2.style.display = 'block';
    if (num === 3) step3.style.display = 'block';
    if (num === 4) successStep.style.display = 'block';

    // Update progress indicators
    progressSteps.forEach((ps, i) => {
      ps.classList.remove('active', 'completed');
      if (i + 1 < num) ps.classList.add('completed');
      if (i + 1 === num || (num === 4 && i + 1 === 3)) ps.classList.add('active');
    });

    progressFills.forEach((fill, i) => {
      fill.style.width = (i + 1 < num) ? '100%' : '0%';
    });

    // Scroll modal to top
    bookingModal.scrollTop = 0;
  }

  // --- Set min date to today ---
  function setMinDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    dateInput.min = `${yyyy}-${mm}-${dd}`;

    // Max = 30 days out
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 30);
    const maxYyyy = maxDate.getFullYear();
    const maxMm = String(maxDate.getMonth() + 1).padStart(2, '0');
    const maxDd = String(maxDate.getDate()).padStart(2, '0');
    dateInput.max = `${maxYyyy}-${maxMm}-${maxDd}`;
  }
  setMinDate();

  // --- Generate time slots ---
  function generateTimeSlots(date) {
    const dayOfWeek = new Date(date + 'T12:00:00').getDay();
    const hours = businessHours[dayOfWeek];

    if (!hours) {
      timeSlotsContainer.innerHTML = '<p class="time-slots-hint">Closed on this day</p>';
      return;
    }

    const [openH, openM] = hours.open.split(':').map(Number);
    const [closeH, closeM] = hours.close.split(':').map(Number);

    const slots = [];
    let h = openH, m = openM;

    while (h < closeH || (h === closeH && m < closeM)) {
      const period = h >= 12 ? 'PM' : 'AM';
      const displayH = h > 12 ? h - 12 : (h === 0 ? 12 : h);
      const displayM = String(m).padStart(2, '0');
      const timeStr = `${displayH}:${displayM} ${period}`;
      const rawTime = `${String(h).padStart(2, '0')}:${displayM}`;
      slots.push({ display: timeStr, raw: rawTime });

      m += 30;
      if (m >= 60) { m = 0; h++; }
    }

    return slots;
  }

  async function renderTimeSlots() {
    const date = dateInput.value;
    if (!date) return;

    const slots = generateTimeSlots(date);
    if (!slots) return;

    // Fetch booked slots from server
    let bookedSlots = [];
    try {
      const res = await fetch(`/api/booked-slots?date=${date}`);
      const data = await res.json();
      bookedSlots = data.slots || [];
    } catch (e) {
      // Server might not be running, continue without booked slots
    }

    // Check if date is today — disable past time slots
    const today = new Date();
    const isToday = date === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    timeSlotsContainer.innerHTML = '';
    selectedTime = '';
    updateStep1Validation();

    slots.forEach(slot => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'time-slot';
      btn.textContent = slot.display;
      btn.dataset.time = slot.display;

      const isBooked = bookedSlots.includes(slot.display);
      const [slotH, slotM] = slot.raw.split(':').map(Number);
      const isPast = isToday && (slotH < today.getHours() || (slotH === today.getHours() && slotM <= today.getMinutes()));

      if (isBooked || isPast) {
        btn.classList.add('booked');
        btn.disabled = true;
      } else {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.time-slot').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          selectedTime = slot.display;
          updateStep1Validation();
        });
      }

      timeSlotsContainer.appendChild(btn);
    });

    if (slots.length === 0) {
      timeSlotsContainer.innerHTML = '<p class="time-slots-hint">No available slots for this date</p>';
    }
  }

  dateInput.addEventListener('change', renderTimeSlots);

  // --- Validation ---
  function updateStep1Validation() {
    const valid = serviceSelect.value && dateInput.value && selectedTime;
    btnNext1.disabled = !valid;
  }

  serviceSelect.addEventListener('change', updateStep1Validation);
  dateInput.addEventListener('change', updateStep1Validation);

  // --- Step Navigation ---
  btnNext1.addEventListener('click', () => showStep(2));

  btnBack2.addEventListener('click', () => showStep(1));

  btnNext2.addEventListener('click', () => {
    // Validate step 2
    let valid = true;
    [nameInput, phoneInput].forEach(input => {
      input.classList.remove('error');
      if (!input.value.trim()) {
        input.classList.add('error');
        valid = false;
      }
    });

    if (!valid) return;

    // Build summary
    buildSummary('bookingSummary');
    showStep(3);
  });

  btnBack3.addEventListener('click', () => showStep(2));

  // --- Build summary HTML ---
  function buildSummary(containerId) {
    const container = document.getElementById(containerId);
    const rows = [
      { label: 'Service', value: serviceSelect.value, gold: true },
      { label: 'Date', value: formatDate(dateInput.value), gold: true },
      { label: 'Time', value: selectedTime, gold: true },
      { label: 'Name', value: nameInput.value },
      { label: 'Phone', value: phoneInput.value },
    ];

    if (emailInput.value.trim()) {
      rows.push({ label: 'Email', value: emailInput.value });
    }
    if (notesInput.value.trim()) {
      rows.push({ label: 'Notes', value: notesInput.value });
    }

    container.innerHTML = rows.map(r => `
      <div class="booking-summary-row">
        <span class="summary-label">${r.label}</span>
        <span class="summary-value${r.gold ? ' gold' : ''}">${r.value}</span>
      </div>
    `).join('');
  }

  function formatDate(dateStr) {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }
    return dateStr;
  }

  // --- Confirm Booking ---
  btnConfirm.addEventListener('click', async () => {
    loadingEl.style.display = 'flex';

    const bookingData = {
      customer_name: nameInput.value.trim(),
      customer_phone: phoneInput.value.trim(),
      customer_email: emailInput.value.trim(),
      service: serviceSelect.value,
      date: formatDate(dateInput.value),
      time: selectedTime,
      notes: notesInput.value.trim()
    };

    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });

      const data = await res.json();

      if (data.success) {
        buildSummary('successSummary');
        loadingEl.style.display = 'none';
        showStep(4);
      } else {
        loadingEl.style.display = 'none';
        alert(data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      loadingEl.style.display = 'none';
      alert('Unable to connect to the server. Please call us at (805) 497-9653 to book your appointment.');
    }
  });

});
