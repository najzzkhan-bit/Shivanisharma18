(function () {
  'use strict';

  var DATA = null;
  var WA = 'https://wa.me/919579199431';
  var PHONE_DISPLAY = '+91 9579199431';
  var EMAIL = 'shivanisharma89004@gmail.com';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* ---------- Data ---------- */
  function loadData() {
    return fetch('data/services.json').then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).catch(function () {
      // Fallback when opened directly from disk (file://), where fetch is blocked.
      return window.PARLOUR_DATA;
    });
  }

  /* ---------- Year, header, mobile nav ---------- */
  function initChrome() {
    $('#year').textContent = new Date().getFullYear();
    var header = $('#siteHeader');
    var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 40); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    var toggle = $('#navToggle');
    var nav = $('#primaryNav');
    function setOpen(open) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      nav.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    }
    toggle.addEventListener('click', function () { setOpen(toggle.getAttribute('aria-expanded') !== 'true'); });
    $$('#primaryNav a').forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setOpen(false); toggle.focus(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 1290) setOpen(false); });
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    var els = $$('.reveal');
    if (!('IntersectionObserver' in window) || reduceMotion) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (e) { io.observe(e); });
    $$('.section-full').forEach(function (s) {
      var io2 = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { s.classList.add('in'); io2.disconnect(); } }, { threshold: 0.2 });
      io2.observe(s);
    });
  }

  /* ---------- Hero sparkles ---------- */
  function initSparkles() {
    if (reduceMotion) return;
    var box = $('.hero-sparkles');
    if (!box) return;
    for (var i = 0; i < 14; i++) {
      var s = document.createElement('span');
      s.className = 'sparkle';
      s.style.left = Math.random() * 100 + '%';
      s.style.top = (30 + Math.random() * 65) + '%';
      s.style.animationDelay = (Math.random() * 6).toFixed(2) + 's';
      s.style.animationDuration = (5 + Math.random() * 4).toFixed(2) + 's';
      box.appendChild(s);
    }
  }

  /* ---------- Subtle 3D tilt on cards ---------- */
  function initTilt() {
    if (reduceMotion || window.matchMedia('(hover: none)').matches) return;
    $$('.tilt').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = 'perspective(900px) rotateY(' + (x * 6) + 'deg) rotateX(' + (-y * 6) + 'deg)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------- Service-specific buttons pre-select services ---------- */
  var SERVICE_LABEL = {};
  function serviceLabelMap(data) {
    if (data.openingPackages) {
      data.openingPackages.forEach(function (p) { SERVICE_LABEL[p.id] = p.name; });
    }
    data.categories.forEach(function (c) { c.services.forEach(function (s) { SERVICE_LABEL[s.id] = s.name; }); });
  }
  var EXTRA_OPTIONS = [
    { id: 'appointment', name: 'Appointment Request (general)' },
    { id: 'general', name: 'General Enquiry' }
  ];

  function fillServiceSelects(data) {
    var selects = [$('#bkService'), $('#enService')];
    selects.forEach(function (sel) {
      if (!sel) return;
      var first = document.createElement('option');
      first.value = ''; first.textContent = 'Select a service';
      sel.innerHTML = ''; sel.appendChild(first);
      if (data.openingPackages && data.openingPackages.length) {
        var ogPkg = document.createElement('optgroup'); ogPkg.label = 'Special Packages';
        data.openingPackages.forEach(function (p) {
          var o = document.createElement('option'); o.value = p.name + ' (' + p.price + '/-)'; o.textContent = p.name + ' (' + p.price + '/-)'; o.dataset.id = p.id;
          ogPkg.appendChild(o);
        });
        sel.appendChild(ogPkg);
      }
      data.categories.forEach(function (cat) {
        var og = document.createElement('optgroup'); og.label = cat.title;
        cat.services.forEach(function (s) {
          var o = document.createElement('option'); o.value = s.name; o.textContent = s.name; o.dataset.id = s.id;
          og.appendChild(o);
        });
        sel.appendChild(og);
      });
      var og2 = document.createElement('optgroup'); og2.label = 'Other';
      EXTRA_OPTIONS.forEach(function (x) { var o = document.createElement('option'); o.value = x.name; o.textContent = x.name; o.dataset.id = x.id; og2.appendChild(o); });
      sel.appendChild(og2);
    });
  }

  function initServiceButtons() {
    $$('[data-service]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-service');
        var name = SERVICE_LABEL[id] || id;
        var target = btn.getAttribute('href') === '#enquiry' ? $('#enService') : $('#bkService');
        if (target) {
          var opt = $$('option', target).filter(function (o) {
            return o.dataset.id === id || o.value === name || (name && o.textContent.indexOf(name) !== -1);
          })[0];
          if (opt) target.value = opt.value;
        }
      });
    });
  }

  /* ---------- Price list (from data/services.json) ---------- */
  function renderPrices(data) {
    var list = $('#priceList');
    var status = $('#priceStatus');
    list.innerHTML = '';
    if (data.priceListStatus === 'placeholder') {
      status.textContent = 'Note: the official price list was not supplied with this build. Prices below are shown as "To be confirmed" and must be replaced from the owner\u2019s price list before publishing.';
      status.classList.add('show');
    } else { status.classList.remove('show'); }

    data.categories.forEach(function (cat) {
      var card = document.createElement('article');
      card.className = 'price-cat reveal';
      var h = document.createElement('h3'); h.textContent = cat.title; card.appendChild(h);
      cat.services.forEach(function (s) {
        var row = document.createElement('div'); row.className = 'price-row';
        var left = document.createElement('div');
        var name = document.createElement('h4'); name.textContent = s.name; left.appendChild(name);
        if (s.description) { var d = document.createElement('p'); d.textContent = s.description; left.appendChild(d); }
        var right = document.createElement('div'); right.style.display = 'flex'; right.style.gap = '.6rem'; right.style.alignItems = 'center'; right.style.flexWrap = 'wrap';
        var price = document.createElement('span');
        if (s.price === null || s.price === undefined || s.price === '') {
          price.className = 'price-val tbc'; price.textContent = 'To be confirmed';
        } else {
          price.className = 'price-val'; price.textContent = s.price;
        }
        var enq = document.createElement('a');
        enq.className = 'btn btn-outline';
        enq.href = '#enquiry';
        enq.textContent = 'Enquire';
        enq.addEventListener('click', function () {
          var sel = $('#enService');
          var opt = $$('option', sel).filter(function (o) { return o.dataset.id === s.id; })[0];
          if (opt) sel.value = opt.value;
        });
        right.appendChild(price); right.appendChild(enq);
        row.appendChild(left); row.appendChild(right);
        card.appendChild(row);
      });
      list.appendChild(card);
    });
    initReveal();
  }

  /* ---------- FAQ Knowledge Base (retained for Chatbot & Assistant) ---------- */
  var FAQS = [
    ['What services does the parlour offer?', 'Hair styling, hair spa and hair care, bridal makeup, bridal hairstyles, mehndi and henna art, modelling and glamour makeup, party makeup, wedding glow & pre-bridal care, and special occasion beauty services.'],
    ['How can I enquire about prices?', 'Use the Price List section for the services and their listed prices, or send an enquiry through the form or WhatsApp. Where a price is marked To be confirmed, Shivani will share the current amount with you.'],
    ['How can I request a bridal makeup appointment?', 'Use the Book Your Beauty Appointment form and choose a bridal service, or tap "Book Bridal Consultation". The form prepares a WhatsApp message for you to review and send. A request is not a confirmed appointment until Shivani confirms it.'],
    ['Can I enquire about mehndi designs?', 'Yes. Use the Mehndi section or the enquiry form to ask about bridal, traditional, Arabic, intricate hand, wedding and special occasion mehndi.'],
    ['How can I contact Shivani?', 'WhatsApp: +91 9579199431. Email: shivanisharma89004@gmail.com. You can also use the enquiry form on this page.'],
    ['Where is the parlour located?', 'Opposite Datta Vihar Society, Khadi Machine, Yewlewadi Kondhwa, Pune, Maharashtra, India. Tap "Get Directions" in the Visit section to open Google Maps.'],
    ['How can I check opening hours?', 'The parlour is open Tuesday to Sunday from 10:00 AM to 8:00 PM. Early morning bridal and event makeover slots are available on prior appointment.'],
    ['How can I enquire about available appointment dates?', 'Choose your preferred date in the booking form, or ask on WhatsApp. We cannot show live availability on this website, so Shivani will confirm dates with you directly.']
  ];

  /* ---------- Client Reviews & Interactive Comment System ---------- */
  var DEFAULT_REVIEWS = [
    {
      name: 'Pooja Deshmukh',
      location: 'Kondhwa, Pune',
      service: 'Maharashtrian Tadka Look & Drape',
      rating: 5,
      date: 'October 2026',
      verified: true,
      comment: 'Shivani did my wedding nauvari drape and traditional bridal makeup. The drape was so comfortable throughout the 6-hour ritual and the makeup didn\'t budge even under stage lights! Truly an artist who understands authentic Maharashtrian beauty.'
    },
    {
      name: 'Sneha Kulkarni',
      location: 'Undri, Pune',
      service: 'Wedding Glow Facial & Hair Spa',
      rating: 5,
      date: 'September 2026',
      verified: true,
      comment: 'The wedding glow package before my sister\'s engagement was pure magic. My skin looked so naturally illuminated without feeling heavy or cakey. The parlour is clean, peaceful, and Shivani gives her 100% personal attention.'
    },
    {
      name: 'Ananya Verma',
      location: 'NIBM Road, Pune',
      service: 'Royal Bridal HD Makeover',
      rating: 5,
      date: 'August 2026',
      verified: true,
      comment: 'I was quite nervous about heavy bridal makeup, but Shivani gave me such a soft, radiant, royal look for my reception. Everyone complimented my hair curls and the nath setting. Highly recommended in Kondhwa!'
    },
    {
      name: 'Rutuja Shinde',
      location: 'Yewlewadi, Pune',
      service: 'Bridal Peacock Mehndi',
      rating: 5,
      date: 'July 2026',
      verified: true,
      comment: 'Her mehndi speed and detailing are unbelievable! The dark maroon stain lasted for more than two weeks, and the peacock motifs on my palms looked stunning in all our wedding close-up photos.'
    },
    {
      name: 'Meera Joshi',
      location: 'Katraj, Pune',
      service: 'Hair Styling & Keratin Ritual',
      rating: 5,
      date: 'June 2026',
      verified: true,
      comment: 'Got my hair styled for a family wedding alongside a nourishing spa. The bouncy curls held up until the next morning without any stickiness. Shivani is courteous, punctual, and very skilled.'
    },
    {
      name: 'Kavita More',
      location: 'Pune',
      service: 'Modelling & Event Glamour',
      rating: 5,
      date: 'May 2026',
      verified: true,
      comment: 'Booked Shivani for an outdoor photoshoot makeover. The eye work and contouring matched the lighting perfectly. She has true fashion designer sensibility!'
    }
  ];

  function getInitials(name) {
    if (!name) return 'SS';
    var parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function renderStars(rating) {
    var r = Math.max(1, Math.min(5, parseInt(rating, 10) || 5));
    var out = '';
    for (var i = 1; i <= 5; i++) {
      out += (i <= r ? '★' : '☆');
    }
    return out;
  }

  function createReviewCard(rev, isNew) {
    var card = document.createElement('article');
    card.className = 'review-card tilt reveal' + (isNew ? ' user-comment' : '');
    
    var initials = getInitials(rev.name);
    var stars = renderStars(rev.rating);
    var badgeHtml = rev.isUser 
      ? '<span class="review-verified-badge user-badge">🌟 Client Comment</span>' 
      : '<span class="review-verified-badge">✓ Verified Client</span>';

    card.innerHTML = 
      '<div class="review-card-top">' +
        '<div class="review-author-wrap">' +
          '<div class="review-avatar" aria-hidden="true">' + initials + '</div>' +
          '<div class="review-author-info">' +
            '<span class="review-author-name">' + escapeHtml(rev.name) + '</span>' +
            '<span class="review-service-pill">' + escapeHtml(rev.service || 'Parlour Service') + '</span>' +
          '</div>' +
        '</div>' +
        badgeHtml +
      '</div>' +
      '<div class="review-stars" aria-label="Rated ' + rev.rating + ' out of 5 stars">' + stars + '</div>' +
      '<div class="review-body">' +
        '<span class="review-quote-mark" aria-hidden="true">&ldquo;</span>' +
        '<p class="review-comment-text">' + escapeHtml(rev.comment) + '</p>' +
      '</div>' +
      '<div class="review-footer">' +
        '<span>' + escapeHtml(rev.location || 'Pune') + '</span>' +
        '<time>' + escapeHtml(rev.date || 'Recent') + '</time>' +
      '</div>';

    return card;
  }

  function initReviews() {
    var grid = $('#reviewsGrid');
    if (!grid) return;

    // Load any user-submitted comments from localStorage
    var savedUserReviews = [];
    try {
      var raw = localStorage.getItem('shivani_parlour_user_reviews');
      if (raw) savedUserReviews = JSON.parse(raw);
    } catch (e) { savedUserReviews = []; }

    // Prepend user comments, followed by default authentic client reviews
    grid.innerHTML = '';
    savedUserReviews.forEach(function (r) {
      grid.appendChild(createReviewCard(r, true));
    });
    DEFAULT_REVIEWS.forEach(function (r) {
      grid.appendChild(createReviewCard(r, false));
    });

    // Rating Selector interaction
    var ratingBtns = $$('#starRatingSelect .star-btn');
    var ratingInput = $('#revRating');
    var ratingLabel = $('#starRatingLabel');
    var ratingDescriptions = {
      1: '1 / 5 Stars (Needs Improvement)',
      2: '2 / 5 Stars (Fair)',
      3: '3 / 5 Stars (Good Experience)',
      4: '4 / 5 Stars (Very Good & Recommended)',
      5: '5 / 5 Stars (Outstanding Experience)'
    };

    function updateStars(val) {
      val = parseInt(val, 10) || 5;
      ratingBtns.forEach(function (btn) {
        var starVal = parseInt(btn.dataset.rating, 10);
        btn.classList.toggle('active', starVal <= val);
      });
      if (ratingInput) ratingInput.value = val;
      if (ratingLabel) ratingLabel.textContent = ratingDescriptions[val] || (val + ' / 5 Stars');
    }

    ratingBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var val = parseInt(btn.dataset.rating, 10);
        updateStars(val);
      });
      btn.addEventListener('mouseenter', function () {
        var val = parseInt(btn.dataset.rating, 10);
        ratingBtns.forEach(function (b) {
          var sVal = parseInt(b.dataset.rating, 10);
          b.classList.toggle('active', sVal <= val);
        });
      });
    });

    var ratingGroup = $('#starRatingSelect');
    if (ratingGroup) {
      ratingGroup.addEventListener('mouseleave', function () {
        var curr = parseInt(ratingInput ? ratingInput.value : '5', 10) || 5;
        updateStars(curr);
      });
    }

    // Comment Form Submission
    var commentForm = $('#commentForm');
    if (!commentForm) return;

    var nameInput = $('#revName');
    var serviceInput = $('#revService');
    var commentInput = $('#revComment');
    var nameErr = $('#revNameErr');
    var serviceErr = $('#revServiceErr');
    var commentErr = $('#revCommentErr');
    var successAlert = $('#revSuccessMsg');

    commentForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var hasErr = false;
      var nameVal = nameInput ? nameInput.value.trim() : '';
      var serviceVal = serviceInput ? serviceInput.value.trim() : '';
      var commentVal = commentInput ? commentInput.value.trim() : '';
      var ratingVal = parseInt(ratingInput ? ratingInput.value : '5', 10) || 5;

      // Validation
      if (!nameVal || nameVal.length < 2) {
        if (nameErr) nameErr.textContent = 'Please enter your name (at least 2 letters).';
        hasErr = true;
      } else if (nameErr) { nameErr.textContent = ''; }

      if (!serviceVal) {
        if (serviceErr) serviceErr.textContent = 'Please choose a service you experienced.';
        hasErr = true;
      } else if (serviceErr) { serviceErr.textContent = ''; }

      if (!commentVal || commentVal.length < 5) {
        if (commentErr) commentErr.textContent = 'Please write at least a few words about your experience.';
        hasErr = true;
      } else if (commentErr) { commentErr.textContent = ''; }

      if (hasErr) return;

      // Create new review object
      var newRev = {
        name: nameVal,
        location: 'Pune',
        service: serviceVal,
        rating: ratingVal,
        date: 'Today',
        comment: commentVal,
        isUser: true
      };

      // Save to localStorage
      try {
        var current = [];
        var rawNow = localStorage.getItem('shivani_parlour_user_reviews');
        if (rawNow) current = JSON.parse(rawNow);
        current.unshift(newRev);
        localStorage.setItem('shivani_parlour_user_reviews', JSON.stringify(current));
      } catch (err) {
        console.warn('Could not save to localStorage', err);
      }

      // Prepend to visible grid
      var newCard = createReviewCard(newRev, true);
      if (grid.firstChild) {
        grid.insertBefore(newCard, grid.firstChild);
      } else {
        grid.appendChild(newCard);
      }

      // Show success notification with direct WhatsApp compliment option
      if (successAlert) {
        var waMsg = 'Hello Shivani, I just left a ' + ratingVal + '-star review on your website: "' + commentVal + '" - ' + nameVal;
        var waHref = 'https://wa.me/919579199431?text=' + encodeURIComponent(waMsg);

        successAlert.innerHTML = 
          '<strong>✓ Thank you, ' + escapeHtml(nameVal) + '! Your review has been published.</strong>' +
          '<span>Your feedback is now visible under Client Reviews.</span>' +
          '<a href="' + waHref + '" target="_blank" rel="noopener" class="wa-share-link">💬 Send this feedback directly to Shivani on WhatsApp &rarr;</a>';
        successAlert.hidden = false;
      }

      // Reset form
      commentForm.reset();
      updateStars(5);

      // Scroll smoothly to the published card
      setTimeout(function () {
        newCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);

      // Re-trigger tilt & reveal on new card
      initTilt();
    });
  }

  /* ---------- Gallery filters + lightbox ---------- */
  function initGallery() {
    var btns = $$('.filter-btn');
    var items = $$('.gallery-item');
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        var f = b.dataset.filter;
        btns.forEach(function (x) { x.classList.toggle('is-active', x === b); x.setAttribute('aria-pressed', String(x === b)); });
        items.forEach(function (it) { it.classList.toggle('hidden', f !== 'all' && it.dataset.category !== f); });
      });
    });
    var lb = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCaption');
    var opener = null;
    items.forEach(function (it) {
      it.addEventListener('click', function () {
        opener = it;
        lbImg.src = it.dataset.src;
        lbImg.alt = it.dataset.caption + ' - Shivani Sharma Parlour Pune';
        lbCap.textContent = it.dataset.caption + ' · Shivani Sharma Parlour';
        if (typeof lb.showModal === 'function') lb.showModal(); else lb.setAttribute('open', '');
      });
    });
    $('#lbClose').addEventListener('click', function () { lb.close(); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
    lb.addEventListener('close', function () { if (opener) opener.focus(); });

    // Allow clicking certificate and award cards to view full size
    $$('.cert-item').forEach(function (ci) {
      ci.style.cursor = 'pointer';
      ci.setAttribute('title', 'Click to view certificate & award details');
      ci.addEventListener('click', function () {
        opener = ci;
        var img = ci.querySelector('img');
        var span = ci.querySelector('span');
        if (img) {
          lbImg.src = img.src;
          lbImg.alt = img.alt;
          lbCap.textContent = (span ? span.textContent + ' — ' : '') + 'Shivani Sharma Artistry Accreditation';
          if (typeof lb.showModal === 'function') lb.showModal(); else lb.setAttribute('open', '');
        }
      });
    });
  }

  /* ---------- Validation helpers ---------- */
  function setErr(input, msg) {
    var err = document.getElementById(input.getAttribute('aria-describedby'));
    if (err) err.textContent = msg || '';
    input.classList.toggle('invalid', !!msg);
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    return !msg;
  }
  function validPhone(v) {
    var d = v.replace(/[\s\-()]/g, '');
    return /^(\+91)?[6-9]\d{9}$/.test(d);
  }
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function todayISO() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function formatDate(iso) {
    if (!iso) return '';
    var p = iso.split('-');
    return p[2] + '/' + p[1] + '/' + p[0];
  }
  function formatTime(t) {
    if (!t) return '';
    if (t.indexOf('AM') !== -1 || t.indexOf('PM') !== -1 || t.indexOf('Request') !== -1) return t;
    var p = t.split(':'); var h = parseInt(p[0], 10); var m = p[1];
    var ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
    return h + ':' + m + ' ' + ap;
  }

  /* ---------- Booking form ---------- */
  function initBooking() {
    var form = $('#bookingForm');
    var dateEl = $('#bkDate');
    dateEl.min = todayISO();
    var res = $('#bkResult');

    // Click anywhere on date input to trigger calendar dropdown
    dateEl.addEventListener('click', function () {
      if (typeof dateEl.showPicker === 'function') {
        try { dateEl.showPicker(); } catch (e) {}
      }
    });

    // Quick date selection pills
    $$('.date-pill', form).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var days = parseInt(btn.dataset.days, 10) || 0;
        var target = new Date();
        target.setDate(target.getDate() + days);
        var iso = target.getFullYear() + '-' + String(target.getMonth() + 1).padStart(2, '0') + '-' + String(target.getDate()).padStart(2, '0');
        dateEl.value = iso;
        $$('.date-pill', form).forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        setErr(dateEl, '');
      });
    });

    dateEl.addEventListener('change', function () {
      $$('.date-pill', form).forEach(function (b) { b.classList.remove('is-active'); });
      if (dateEl.value) validate();
    });

    function validate() {
      var name = $('#bkName'), phone = $('#bkPhone'), email = $('#bkEmail'), svc = $('#bkService'), date = $('#bkDate'), time = $('#bkTime');
      var ok = true;
      ok = setErr(name, name.value.trim().length < 2 ? 'Please enter your full name.' : '') && ok;
      ok = setErr(phone, !phone.value.trim() ? 'Please enter your mobile number.' : (!validPhone(phone.value) ? 'Enter a valid 10-digit Indian mobile number.' : '')) && ok;
      ok = setErr(email, email.value.trim() && !validEmail(email.value.trim()) ? 'Enter a valid email address or leave this blank.' : '') && ok;
      ok = setErr(svc, !svc.value ? 'Please choose a service.' : '') && ok;
      var dErr = '';
      if (!date.value) dErr = 'Please choose a preferred date.';
      else if (date.value < todayISO()) dErr = 'Please choose today or a future date.';
      ok = setErr(date, dErr) && ok;
      ok = setErr(time, !time.value ? 'Please choose a preferred time.' : '') && ok;
      return ok;
    }

    $$('input,select,textarea', form).forEach(function (el) {
      el.addEventListener('blur', function () { if (el.required || el.value) validate(); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      res.hidden = true;
      if (!validate()) {
        var first = $('.invalid', form);
        if (first) first.focus();
        return;
      }
      var name = $('#bkName').value.trim();
      var phone = $('#bkPhone').value.trim();
      var email = $('#bkEmail').value.trim();
      var service = $('#bkService').value;
      var rawDate = $('#bkDate').value;
      var date = formatDate(rawDate);
      var time = formatTime($('#bkTime').value);
      var notes = $('#bkNotes').value.trim();

      // Asynchronously store booking in Supabase backend if configured
      var supabase = window.getSupabaseClient ? window.getSupabaseClient() : null;
      if (supabase) {
        supabase.from('bookings').insert([{
          name: name,
          phone: phone,
          email: email || null,
          service: service,
          booking_date: rawDate,
          booking_time: time,
          notes: notes || null,
          status: 'pending'
        }]).then(function (result) {
          if (result.error) {
            console.warn('Supabase booking notice:', result.error);
          } else {
            console.log('✓ Booking recorded in Supabase database');
          }
        }).catch(function (err) {
          console.warn('Supabase booking request failed:', err);
        });
      }

      var lines = [
        'Hello Shivani,',
        'I would like to request an appointment.',
        '',
        'Name: ' + name,
        'Mobile: ' + phone,
        email ? 'Email: ' + email : null,
        'Service: ' + service,
        'Preferred date: ' + date,
        'Preferred time: ' + time,
        notes ? 'Requirements: ' + notes : 'Requirements: Please share the available options and pricing.',
        '',
        'Thank you!'
      ].filter(function (l) { return l !== null; });
      var msg = lines.join('\n');

      var btn = $('#bkSubmit');
      btn.classList.add('loading'); btn.disabled = true;
      setTimeout(function () {
        btn.classList.remove('loading'); btn.disabled = false;
        res.hidden = false;
        res.innerHTML = '';
        var h = document.createElement('p');
        h.innerHTML = '';
        var strong = document.createElement('strong');
        strong.textContent = 'Your appointment request has been recorded!';
        h.appendChild(strong);
        var p2 = document.createElement('p');
        p2.className = 'hint';
        p2.textContent = 'We have logged your request. Now tap the green WhatsApp button below to confirm your slot directly with Shivani.';
        var ta = document.createElement('textarea');
        ta.className = 'preview'; ta.rows = 9; ta.readOnly = false; ta.value = msg;
        ta.setAttribute('aria-label', 'WhatsApp message preview. You can edit it before sending.');
        var row = document.createElement('div'); row.className = 'btn-row center';
        var open = document.createElement('a');
        open.className = 'btn btn-whatsapp';
        open.target = '_blank'; open.rel = 'noopener';
        open.href = WA + '?text=' + encodeURIComponent(ta.value);
        open.textContent = 'Open WhatsApp to Send';
        ta.addEventListener('input', function () { open.href = WA + '?text=' + encodeURIComponent(ta.value); });
        var ask = document.createElement('a');
        ask.className = 'btn btn-outline'; ask.href = '#enquiry';
        ask.textContent = 'Ask About Pricing or a Custom Requirement';
        ask.addEventListener('click', function () { $('#enService').value = $('#bkService').value; });
        row.appendChild(open); row.appendChild(ask);
        res.appendChild(h); res.appendChild(p2); res.appendChild(ta); res.appendChild(row);
        res.setAttribute('tabindex', '-1');
        res.focus();
      }, reduceMotion ? 0 : 500);
    });
  }

  /* ---------- Enquiry form ---------- */
  function initEnquiry() {
    var form = $('#enquiryForm');
    var res = $('#enResult');
    function validate() {
      var n = $('#enName'), c = $('#enContact'), s = $('#enService'), m = $('#enMessage');
      var ok = true;
      ok = setErr(n, n.value.trim().length < 2 ? 'Please enter your name.' : '') && ok;
      var cv = c.value.trim();
      var contactOk = validPhone(cv) || validEmail(cv);
      ok = setErr(c, !cv ? 'Please enter a phone number or email.' : (!contactOk ? 'Enter a valid 10-digit mobile number or an email address.' : '')) && ok;
      ok = setErr(s, !s.value ? 'Please choose a service.' : '') && ok;
      ok = setErr(m, m.value.trim().length < 5 ? 'Please write a short message (at least 5 characters).' : '') && ok;
      return ok;
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      res.hidden = true;
      if (!validate()) { var f = $('.invalid', form); if (f) f.focus(); return; }
      var name = $('#enName').value.trim();
      var contact = $('#enContact').value.trim();
      var service = $('#enService').value;
      var message = $('#enMessage').value.trim();

      // Store enquiry in Supabase backend if configured
      var supabase = window.getSupabaseClient ? window.getSupabaseClient() : null;
      if (supabase) {
        supabase.from('enquiries').insert([{
          name: name,
          contact: contact,
          service: service,
          message: message,
          status: 'new'
        }]).then(function (result) {
          if (result.error) console.warn('Supabase enquiry notice:', result.error);
          else console.log('✓ Enquiry recorded in Supabase database');
        }).catch(function (err) {
          console.warn('Supabase enquiry request failed:', err);
        });
      }

      var text = 'Hello Shivani,\n\nName: ' + name + '\nContact: ' + contact + '\nService of interest: ' + service + '\n\nEnquiry: ' + message;
      $('#enWa').href = WA + '?text=' + encodeURIComponent(text);
      $('#enMail').href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Enquiry: ' + service) + '&body=' + encodeURIComponent(text);
      res.hidden = false;
      res.setAttribute('tabindex', '-1');
      res.focus();
    });
  }

  /* ---------- Chatbot (basic demo assistant, no AI backend) ---------- */
  var CHAT = {
    en: {
      greet: "Hello, welcome to Shivani Sharma's Parlour! \uD83D\uDC96 I'm your beauty assistant. What are you looking for today, and how can I help you?",
      services: 'We offer hair styling, hair spa, bridal makeup and bridal hairstyles, mehndi, modelling and glamour makeup, party makeup, wedding glow and special occasion beauty. Which one would you like to know more about?',
      price: "I don't have verified prices to quote here yet, so I won't guess. You can see the Price List section, or confirm current prices with Shivani on WhatsApp.",
      timing: 'We are open Tuesday to Sunday from 10:00 AM to 8:00 PM. Early morning bridal slots available on appointment.',
      location: "We're located Opposite Datta Vihar Society, Khadi Machine, Yewlewadi Kondhwa, Pune, Maharashtra, India. Tap \u201CGet Directions\u201D in the Visit section to open Google Maps.",
      bridalQ: 'That sounds wonderful! Are you looking for a traditional bridal look or a modern bridal look?',
      bridalDate: "I'd be happy to help! What is your wedding date, so you can enquire about availability with Shivani?",
      bridalDone: 'Thank you! I can help you send an enquiry to Shivani about your bridal look and preferred date.',
      book: 'You can request an appointment using the Book Your Beauty Appointment form. It prepares a WhatsApp message for you to review. A request is not a confirmed booking until Shivani confirms it.',
      contact: 'You can reach Shivani on WhatsApp at +91 9579199431 or by email at shivanisharma89004@gmail.com.',
      human: 'Of course. You can reach Shivani directly on WhatsApp or by email, and she will be happy to help.',
      fallback: "I'm a basic demo assistant, so I may not understand that. You can ask about services, prices, timings, location or bookings, or contact Shivani directly on WhatsApp.",
      continueWa: 'Continue on WhatsApp'
    },
    hi: {
      greet: 'नमस्ते, शिवानी शर्मा पार्लर में आपका स्वागत है! 💖 मैं आपकी ब्यूटी असिस्टेंट हूँ। आज आपको क्या चाहिए, और मैं आपकी कैसे मदद कर सकती हूँ?',
      services: 'हम हेयर स्टाइलिंग, हेयर स्पा, ब्राइडल मेकअप और ब्राइडल हेयरस्टाइल, मेहंदी, मॉडलिंग व ग्लैमर मेकअप, पार्टी मेकअप, वेडिंग ग्लो और खास मौकों के लिए ब्यूटी सर्विसेज़ देते हैं। आप किसके बारे में जानना चाहेंगी?',
      price: 'इस वेबसाइट पर अभी सत्यापित कीमतें उपलब्ध नहीं हैं, इसलिए मैं अनुमान नहीं लगाऊँगी। आप प्राइस लिस्ट सेक्शन देखें, या WhatsApp पर शिवानी से ताज़ा कीमत की पुष्टि करें।',
      timing: 'हम मंगलवार से रविवार सुबह 10:00 बजे से रात 8:00 बजे तक खुले रहते हैं।',
      location: 'हम ऑपोजिट दत्ता विहार सोसाइटी, खडी मशीन, येवलेवाडी कोंढवा, पुणे, महाराष्ट्र में हैं। Visit सेक्शन में "Get Directions" दबाएँ।',
      bridalQ: 'बहुत अच्छा! क्या आप पारंपरिक ब्राइडल लुक चाहती हैं या मॉडर्न?',
      bridalDate: 'ज़रूर! आपकी शादी की तारीख क्या है, ताकि आप शिवानी से उपलब्धता के बारे में पूछ सकें?',
      bridalDone: 'धन्यवाद! मैं आपकी ब्राइडल लुक और पसंदीदा तारीख के बारे में शिवानी को एन्क्वायरी भेजने में मदद कर सकती हूँ।',
      book: 'आप "Book Your Beauty Appointment" फॉर्म से अपॉइंटमेंट का अनुरोध कर सकती हैं। यह भेजने से पहले आपको WhatsApp संदेश की समीक्षा का विकल्प मिलेगा। शिवानी की पुष्टि के बाद ही बुकिंग मानी जाएगी।',
      contact: 'आप शिवानी से WhatsApp पर +91 9579199431 या ईमेल shivanisharma89004@gmail.com पर संपर्क कर सकती हैं।',
      human: 'बिल्कुल। आप सीधे WhatsApp या ईमेल पर शिवानी से बात कर सकती हैं।',
      fallback: 'मैं एक बेसिक डेमो असिस्टेंट हूँ, इसलिए शायद मैं यह समझ न पाऊँ। आप सर्विसेज़, कीमत, समय, लोकेशन या बुकिंग के बारे में पूछ सकती हैं।',
      continueWa: 'WhatsApp पर जारी रखें'
    },
    hinglish: {
      greet: "Namaste, Shivani Sharma's Parlour mein aapka swagat hai! \uD83D\uDC96 Main aapki beauty assistant hoon. Aaj aapko kya chahiye, aur main aapki kaise madad kar sakti hoon?",
      services: 'Hum hair styling, hair spa, bridal makeup aur bridal hairstyles, mehndi, modelling aur glamour makeup, party makeup, wedding glow aur special occasion beauty services dete hain. Aap kiske baare mein jaanna chahengi?',
      price: 'Website par abhi verified prices available nahi hain, isliye main andaza nahi lagaungi. Aap Price List section dekhein, ya WhatsApp par Shivani se current price confirm karein.',
      timing: 'Tuesday se Sunday subah 10:00 AM se raat 8:00 PM tak parlour open rehta hai.',
      location: "Hum Opposite Datta Vihar Society, Khadi Machine, Yewlewadi Kondhwa, Pune, Maharashtra mein hain. Visit section mein 'Get Directions' dabayein.",
      bridalQ: 'Bahut badhiya! Kya aap traditional bridal look chahti hain ya modern?',
      bridalDate: 'Zaroor! Aapki shaadi ki date kya hai, taaki aap Shivani se availability puch sakein?',
      bridalDone: 'Dhanyavaad! Main aapki bridal look aur preferred date ke baare mein Shivani ko enquiry bhejne mein madad kar sakti hoon.',
      book: 'Aap "Book Your Beauty Appointment" form se appointment request kar sakti hain. Ye WhatsApp message aapko review karne ke liye milega. Shivani ki confirmation ke baad hi booking maani jayegi.',
      contact: 'Aap Shivani ko WhatsApp par +91 9579199431 ya email shivanisharma89004@gmail.com par contact kar sakti hain.',
      human: 'Bilkul. Aap seedha WhatsApp ya email par Shivani se baat kar sakti hain.',
      fallback: "Main ek basic demo assistant hoon, isliye shayad main ye samajh na paun. Aap services, price, timing, location ya booking ke baare mein pooch sakti hain.",
      continueWa: 'WhatsApp par continue karein'
    }
  };

  var chat = { lang: 'en', step: 0, date: '', style: '', busy: false };

  function detectLang(t) {
    if (/[\u0900-\u097F]/.test(t)) return 'hi';
    if (/\b(kya|hai|hain|chahiye|kitna|kab|mujhe|aap|kahan|kaise|mein|madad|hum|nahi|bata|batao|chahti|chahta)\b/i.test(t)) return 'hinglish';
    return 'en';
  }

  function addMsg(text, who, actions) {
    var log = $('#chatLog');
    var m = document.createElement('div');
    m.className = 'msg ' + who;
    m.textContent = text;
    log.appendChild(m);
    if (actions && actions.length) {
      var wrap = document.createElement('div'); wrap.className = 'msg-actions';
      actions.forEach(function (a) {
        var link = document.createElement('a');
        link.href = a.href; link.target = '_blank'; link.rel = 'noopener'; link.textContent = a.label;
        wrap.appendChild(link);
      });
      log.appendChild(wrap);
    }
    log.scrollTop = log.scrollHeight;
  }

  function waLink(text) { return WA + '?text=' + encodeURIComponent(text); }

  function botReply(text, actions, delay) {
    chat.busy = true;
    var typing = $('#typing');
    typing.hidden = false;
    var wait = reduceMotion ? 150 : (delay || 700);
    setTimeout(function () {
      typing.hidden = true;
      addMsg(text, 'bot', actions);
      chat.busy = false;
    }, wait);
  }

  function respond(raw) {
    var t = raw.trim();
    var l = t.toLowerCase();
    var L = CHAT[chat.lang];

    // Bridal flow (multi-step, mirrors the example conversation)
    if (chat.step === 1) {
      if (/modern|traditional|pārampar|parampar|traditional/i.test(l) || /मॉडर्न|पारंपरिक/.test(t)) {
        chat.style = /modern|मॉडर्न/i.test(l + t) ? 'Modern' : 'Traditional';
        chat.step = 2;
        return botReply(L.bridalDate);
      }
      chat.step = 0;
    } else if (chat.step === 2) {
      chat.date = t.slice(0, 40);
      chat.step = 3;
      var msg = 'Hello Shivani, I would like to enquire about ' + chat.style.toLowerCase() + ' bridal makeup. My preferred date is ' + chat.date + '. Please share the available appointment options and pricing.';
      return botReply(L.bridalDone, [{ label: L.continueWa, href: waLink(msg) }]);
    }

    if (/^(hi|hello|hey|hii+|namaste|नमस्ते)\b/i.test(t) || /^(hi|hello|hey|namaste)$/i.test(l)) return botReply(L.greet);
    if (/bridal|bride|wedding|dulhan|दुल्हन|शादी|ब्राइडल/i.test(l + t)) {
      chat.step = 1;
      return botReply(L.bridalQ);
    }
    if (/mehndi|mehendi|henna|मेहंदी|मेहन्दी/i.test(l + t)) return botReply(L.services + ' For mehndi, you can enquire through the Mehndi section.', [{ label: 'WhatsApp about Mehndi', href: waLink('Hello Shivani, I would like to enquire about mehndi designs. Please share the available options and pricing.') }]);
    if (/price|cost|rate|charge|kitna|kitne|kitni|कीमत|कितना|दाम|rs|₹/i.test(l + t)) return botReply(L.price, [{ label: 'Price List', href: '#prices' }]);
    if (/time|timing|open|hours|samay|समय|खुल/i.test(l + t)) return botReply(L.timing, [{ label: 'WhatsApp for Timings', href: waLink('Hello Shivani, could you please share your current opening hours?') }]);
    if (/where|address|location|direction|kahan|kidhar|कहाँ|पता|रास्ता/i.test(l + t)) return botReply(L.location, [{ label: 'Get Directions', href: 'https://www.google.com/maps/dir/?api=1&destination=Opposite+Datta+Vihar+Society%2C+Khadi+Machine%2C+Yewlewadi+Kondhwa%2C+Pune%2C+Maharashtra' }]);
    if (/book|appointment|booking|बुक|अपॉइंटमेंट/i.test(l + t)) return botReply(L.book, [{ label: 'Book Appointment', href: '#book' }]);
    if (/service|offer|what do you|kya kya|services|सर्विस|सेवा/i.test(l + t)) return botReply(L.services);
    if (/human|person|talk to|call|real|insaan|इंसान/i.test(l + t)) return botReply(L.human, [{ label: 'WhatsApp', href: WA }]);
    if (/contact|phone|number|email|mail|संपर्क/i.test(l + t)) return botReply(L.contact, [{ label: 'WhatsApp', href: WA }]);
    return botReply(L.fallback, [{ label: 'WhatsApp', href: WA }]);
  }

  function initChat() {
    var toggle = $('#chatToggle'), panel = $('#chatPanel'), close = $('#chatClose'), form = $('#chatForm'), input = $('#chatText');
    var greeted = false;
    function open(o) {
      panel.hidden = !o;
      toggle.setAttribute('aria-expanded', String(o));
      if (o) {
        if (!greeted) {
          greeted = true;
          botReply(CHAT.en.greet, [], 400);
        }
        setTimeout(function () { input.focus(); }, 60);
      } else { toggle.focus(); }
    }
    toggle.addEventListener('click', function () { open(panel.hidden); });
    close.addEventListener('click', function () { open(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) open(false); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = input.value.trim();
      if (!v || chat.busy) return;
      chat.lang = detectLang(v);
      addMsg(v, 'user');
      input.value = '';
      respond(v);
    });
  }

  /* ---------- Divine Blessing Switcher ---------- */
  function initDivineBlessing() {
    var btnK = $('#btnKrishna');
    var btnM = $('#btnMandir');
    var heroImg = $('#heroOverlayImg');
    var mainImg = $('#blessingMainImg');
    if (!btnK || !btnM) return;

    function switchImg(url, isKrishna) {
      if (heroImg) {
        heroImg.style.opacity = '0';
        setTimeout(function() {
          heroImg.src = url;
          heroImg.style.opacity = '0.28';
        }, 220);
      }
      if (mainImg) {
        mainImg.style.opacity = '0';
        setTimeout(function() {
          mainImg.src = url;
          mainImg.style.opacity = '1';
        }, 220);
      }
      btnK.classList.toggle('is-active', isKrishna);
      btnM.classList.toggle('is-active', !isKrishna);
    }

    btnK.addEventListener('click', function () { switchImg('assets/images/krishna-divine.jpg', true); });
    btnM.addEventListener('click', function () { switchImg('assets/images/krishna-overlay.jpg', false); });
  }

  /* ---------- Animated Stats Counter ---------- */
  function initCounters() {
    var nums = $$('.stat-num[data-target]');
    if (!nums.length) return;
    if (!('IntersectionObserver' in window) || reduceMotion) return;

    var counted = false;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && !counted) {
          counted = true;
          nums.forEach(function (el) {
            var target = parseInt(el.getAttribute('data-target'), 10);
            var suffix = target === 100 ? '%' : '+';
            var curr = 0;
            var step = Math.max(1, Math.floor(target / 40));
            var timer = setInterval(function () {
              curr += step;
              if (curr >= target) {
                curr = target;
                clearInterval(timer);
              }
              el.textContent = curr + suffix;
            }, 30);
          });
          io.disconnect();
        }
      });
    }, { threshold: 0.3 });

    var stats = $('.hero-stats');
    if (stats) io.observe(stats);
  }

  /* ---------- Init ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    initChrome();
    initReveal();
    initSparkles();
    initTilt();
    initReviews();
    initGallery();
    initChat();
    initDivineBlessing();
    initCounters();
    loadData().then(function (data) {
      DATA = data;
      serviceLabelMap(data);
      fillServiceSelects(data);
      renderPrices(data);
      initServiceButtons();
      initBooking();
      initEnquiry();
    });
  });
})();
