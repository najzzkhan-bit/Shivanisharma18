// ==============================================================================
// Shivani Sharma's Parlour - Admin Dashboard Controller
// ==============================================================================

(function () {
  'use strict';

  var bookingsData = [];
  var enquiriesData = [];
  var currentTab = 'bookings';

  // Demo Fallback Data for offline / preview before Supabase keys are entered
  var DEMO_BOOKINGS = [
    {
      id: 'demo-1',
      created_at: new Date().toISOString(),
      name: 'Riddhi Kulkarni',
      phone: '9822012345',
      email: 'riddhi.k@gmail.com',
      service: 'Royal Maharashtrian Bridal Makeover',
      booking_date: new Date().toISOString().split('T')[0],
      booking_time: '10:00 AM',
      notes: 'Nauvari drape and traditional jewelry setting required for morning lagna.',
      status: 'pending'
    },
    {
      id: 'demo-2',
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      name: 'Priyanka Patil',
      phone: '9923456789',
      email: null,
      service: 'Keratin Hair Smoothening & Spa',
      booking_date: new Date(Date.now() + 3600000 * 24).toISOString().split('T')[0],
      booking_time: '02:00 PM',
      notes: 'Deep conditioning treatment for fizzy hair.',
      status: 'confirmed'
    },
    {
      id: 'demo-3',
      created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
      name: 'Neha Shinde',
      phone: '9579123456',
      email: 'neha.shinde@yahoo.com',
      service: 'Wedding Glow Gold Facial & Clean-Up',
      booking_date: new Date(Date.now() + 3600000 * 72).toISOString().split('T')[0],
      booking_time: '04:00 PM',
      notes: 'Engagement party facial and eyebrow shaping.',
      status: 'pending'
    }
  ];

  var DEMO_ENQUIRIES = [
    {
      id: 'demo-enq-1',
      created_at: new Date().toISOString(),
      name: 'Tanvi Joshi',
      contact: '9881122334',
      service: 'Bridal Peacock Mehndi',
      message: 'Hello, what is the package price for full bridal hands up to elbows and feet mehndi in December?',
      status: 'new'
    },
    {
      id: 'demo-enq-2',
      created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
      name: 'Smita Gokhale',
      contact: 'smita.g@gmail.com',
      service: 'Wedding Glow Rituals',
      message: 'Do you have weekend slots available for pre-bridal skin polishing?',
      status: 'new'
    }
  ];

  // DOM Elements
  var authModal = document.getElementById('authModal');
  var authForm = document.getElementById('authForm');
  var passcodeInput = document.getElementById('passcodeInput');
  var authError = document.getElementById('authError');
  var logoutBtn = document.getElementById('logoutBtn');
  var refreshBtn = document.getElementById('refreshBtn');
  var setupBanner = document.getElementById('setupBanner');

  var tabBookings = document.getElementById('tabBookings');
  var tabEnquiries = document.getElementById('tabEnquiries');
  var bookingsView = document.getElementById('bookingsView');
  var enquiriesView = document.getElementById('enquiriesView');

  var bookingsTableBody = document.getElementById('bookingsTableBody');
  var enquiriesTableBody = document.getElementById('enquiriesTableBody');

  var searchInput = document.getElementById('searchInput');
  var statusFilter = document.getElementById('statusFilter');
  var dateFilter = document.getElementById('dateFilter');
  var exportCsvBtn = document.getElementById('exportCsvBtn');

  // Stats Elements
  var statTotal = document.getElementById('statTotal');
  var statPending = document.getElementById('statPending');
  var statConfirmed = document.getElementById('statConfirmed');
  var statEnquiries = document.getElementById('statEnquiries');
  var countBookingsTab = document.getElementById('countBookingsTab');
  var countEnquiriesTab = document.getElementById('countEnquiriesTab');

  // ---------- Authentication Check ----------
  function checkAuth() {
    var storedAuth = sessionStorage.getItem('shivani_admin_authenticated');
    if (storedAuth === 'true') {
      authModal.style.display = 'none';
      initDashboard();
    } else {
      authModal.style.display = 'flex';
      passcodeInput.focus();
    }
  }

  authForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var entered = passcodeInput.value.trim();
    var expected = (window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.adminPasscode) || 'shivani2026';

    if (entered === expected) {
      sessionStorage.setItem('shivani_admin_authenticated', 'true');
      authModal.style.display = 'none';
      initDashboard();
    } else {
      authError.textContent = 'Incorrect passcode. Please try again.';
      passcodeInput.value = '';
      passcodeInput.focus();
    }
  });

  logoutBtn.addEventListener('click', function () {
    sessionStorage.removeItem('shivani_admin_authenticated');
    window.location.reload();
  });

  // ---------- Tab Switching ----------
  tabBookings.addEventListener('click', function () {
    currentTab = 'bookings';
    tabBookings.classList.add('active');
    tabEnquiries.classList.remove('active');
    bookingsView.style.display = 'block';
    enquiriesView.style.display = 'none';
  });

  tabEnquiries.addEventListener('click', function () {
    currentTab = 'enquiries';
    tabEnquiries.classList.add('active');
    tabBookings.classList.remove('active');
    enquiriesView.style.display = 'block';
    bookingsView.style.display = 'none';
  });

  // ---------- Data Fetching (Supabase with Local Fallback) ----------
  function loadData() {
    var supabase = window.getSupabaseClient ? window.getSupabaseClient() : null;

    if (!supabase) {
      if (setupBanner) setupBanner.style.display = 'flex';
      bookingsData = DEMO_BOOKINGS;
      enquiriesData = DEMO_ENQUIRIES;
      updateStats();
      renderBookings();
      renderEnquiries();
      return;
    }

    if (setupBanner) setupBanner.style.display = 'none';

    // 1. Fetch Bookings
    supabase
      .from('bookings')
      .select('*')
      .order('booking_date', { ascending: false })
      .then(function (res) {
        if (res.error) {
          console.warn('Supabase fetch bookings error:', res.error);
          bookingsData = DEMO_BOOKINGS;
        } else {
          bookingsData = res.data && res.data.length ? res.data : DEMO_BOOKINGS;
        }
        updateStats();
        renderBookings();
      })
      .catch(function () {
        bookingsData = DEMO_BOOKINGS;
        updateStats();
        renderBookings();
      });

    // 2. Fetch Enquiries
    supabase
      .from('enquiries')
      .select('*')
      .order('created_at', { ascending: false })
      .then(function (res) {
        if (res.error) {
          console.warn('Supabase fetch enquiries error:', res.error);
          enquiriesData = DEMO_ENQUIRIES;
        } else {
          enquiriesData = res.data && res.data.length ? res.data : DEMO_ENQUIRIES;
        }
        updateStats();
        renderEnquiries();
      })
      .catch(function () {
        enquiriesData = DEMO_ENQUIRIES;
        updateStats();
        renderEnquiries();
      });
  }

  // ---------- Update Statistics ----------
  function updateStats() {
    var total = bookingsData.length;
    var pending = bookingsData.filter(function (b) { return b.status === 'pending'; }).length;
    var confirmed = bookingsData.filter(function (b) { return b.status === 'confirmed'; }).length;
    var enqCount = enquiriesData.length;

    statTotal.textContent = total;
    statPending.textContent = pending;
    statConfirmed.textContent = confirmed;
    statEnquiries.textContent = enqCount;

    countBookingsTab.textContent = total;
    countEnquiriesTab.textContent = enqCount;
  }

  // ---------- Render Bookings Table ----------
  function renderBookings() {
    var q = searchInput.value.trim().toLowerCase();
    var sf = statusFilter.value;
    var df = dateFilter.value;
    var todayStr = new Date().toISOString().split('T')[0];

    var filtered = bookingsData.filter(function (b) {
      if (q) {
        var match = (b.name && b.name.toLowerCase().indexOf(q) !== -1) ||
          (b.phone && b.phone.indexOf(q) !== -1) ||
          (b.service && b.service.toLowerCase().indexOf(q) !== -1);
        if (!match) return false;
      }
      if (sf !== 'all' && b.status !== sf) return false;
      if (df === 'today' && b.booking_date !== todayStr) return false;
      if (df === 'upcoming' && b.booking_date < todayStr) return false;
      return true;
    });

    if (filtered.length === 0) {
      bookingsTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2.5rem; color: var(--grey);">No bookings found matching criteria.</td></tr>';
      return;
    }

    var html = '';
    filtered.forEach(function (b) {
      var dateDisplay = b.booking_date || 'TBD';
      var isToday = b.booking_date === todayStr;
      var cleanPhone = (b.phone || '').replace(/[\s\-]/g, '');

      var waMessage = encodeURIComponent(
        'Hello ' + b.name + ',\n\nThis is Shivani Sharma from Shivani Sharma\'s Parlour in Pune.\n' +
        'Regarding your requested appointment for ' + b.service + ' on ' + dateDisplay + ' at ' + (b.booking_time || 'scheduled time') + ':\n' +
        'We are pleased to confirm your slot! Please let us know if you need to make any adjustments.\n\nThank you!'
      );

      var waLink = 'https://wa.me/91' + cleanPhone + '?text=' + waMessage;
      var callLink = 'tel:+91' + cleanPhone;

      html +=
        '<tr data-id="' + b.id + '">' +
        '<td>' +
        '<div style="font-weight:600; color:var(--gold-light);">' + escapeHtml(dateDisplay) + '</div>' +
        '<div style="font-size:0.75rem; color:var(--grey);">' + escapeHtml(b.booking_time || 'Anytime') + '</div>' +
        (isToday ? '<span class="badge confirmed" style="font-size:0.65rem; margin-top:3px;">TODAY</span>' : '') +
        '</td>' +
        '<td>' +
        '<div style="font-weight:600;">' + escapeHtml(b.name) + '</div>' +
        '<div style="font-size:0.75rem; color:var(--gold);">' + escapeHtml(b.phone) + '</div>' +
        (b.email ? '<div style="font-size:0.72rem; color:var(--grey);">' + escapeHtml(b.email) + '</div>' : '') +
        '</td>' +
        '<td><span style="color:var(--ivory); font-weight:500;">' + escapeHtml(b.service) + '</span></td>' +
        '<td><div style="max-width:240px; font-size:0.78rem; color:var(--grey); line-height:1.4;">' + escapeHtml(b.notes || '—') + '</div></td>' +
        '<td>' +
        '<select class="status-select" data-id="' + b.id + '">' +
        '<option value="pending"' + (b.status === 'pending' ? ' selected' : '') + '>⏳ Pending</option>' +
        '<option value="confirmed"' + (b.status === 'confirmed' ? ' selected' : '') + '>✅ Confirmed</option>' +
        '<option value="completed"' + (b.status === 'completed' ? ' selected' : '') + '>💅 Completed</option>' +
        '<option value="cancelled"' + (b.status === 'cancelled' ? ' selected' : '') + '>❌ Cancelled</option>' +
        '</select>' +
        '</td>' +
        '<td>' +
        '<div class="action-group">' +
        '<a href="' + waLink + '" target="_blank" rel="noopener" class="btn-xs btn-wa" title="Send WhatsApp Confirmation">💬 WhatsApp</a>' +
        '<a href="' + callLink + '" class="btn-xs btn-call" title="Call Client">📞 Call</a>' +
        '</div>' +
        '</td>' +
        '</tr>';
    });

    bookingsTableBody.innerHTML = html;

    // Attach status change events
    var selects = bookingsTableBody.querySelectorAll('.status-select');
    selects.forEach(function (sel) {
      sel.addEventListener('change', function () {
        var id = sel.dataset.id;
        var newStatus = sel.value;
        updateBookingStatus(id, newStatus);
      });
    });
  }

  // ---------- Update Status in Supabase ----------
  function updateBookingStatus(id, newStatus) {
    // Update local memory
    bookingsData.forEach(function (b) {
      if (b.id === id) b.status = newStatus;
    });
    updateStats();

    var supabase = window.getSupabaseClient ? window.getSupabaseClient() : null;
    if (supabase && id.indexOf('demo-') === -1) {
      supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', id)
        .then(function (res) {
          if (res.error) console.warn('Status update error:', res.error);
        });
    }
  }

  // ---------- Render Enquiries Table ----------
  function renderEnquiries() {
    if (enquiriesData.length === 0) {
      enquiriesTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2.5rem; color: var(--grey);">No customer enquiries recorded yet.</td></tr>';
      return;
    }

    var html = '';
    enquiriesData.forEach(function (e) {
      var dateStr = e.created_at ? new Date(e.created_at).toLocaleDateString() : 'Recent';
      var cleanContact = (e.contact || '').replace(/[\s\-]/g, '');
      var isPhone = /^(\+91)?[6-9]\d{9}$/.test(cleanContact);

      var waLink = isPhone
        ? 'https://wa.me/91' + cleanContact.replace(/^\+91/, '') + '?text=' + encodeURIComponent('Hello ' + e.name + ', thank you for contacting Shivani Sharma\'s Parlour regarding: ' + e.service)
        : 'https://wa.me/919579199431';

      var mailLink = 'mailto:' + encodeURIComponent(e.contact) + '?subject=' + encodeURIComponent('Shivani Sharma Parlour - ' + e.service);

      html +=
        '<tr>' +
        '<td><span style="font-size:0.75rem; color:var(--grey);">' + dateStr + '</span></td>' +
        '<td><strong>' + escapeHtml(e.name) + '</strong></td>' +
        '<td><span style="color:var(--gold);">' + escapeHtml(e.contact) + '</span></td>' +
        '<td><span>' + escapeHtml(e.service) + '</span></td>' +
        '<td><div style="max-width:320px; font-size:0.8rem; line-height:1.4;">' + escapeHtml(e.message) + '</div></td>' +
        '<td>' +
        '<div class="action-group">' +
        (isPhone ? '<a href="' + waLink + '" target="_blank" rel="noopener" class="btn-xs btn-wa">💬 WhatsApp</a>' : '') +
        '<a href="' + mailLink + '" class="btn-xs btn-call">✉ Email</a>' +
        '</div>' +
        '</td>' +
        '</tr>';
    });

    enquiriesTableBody.innerHTML = html;
  }

  // ---------- Export CSV ----------
  exportCsvBtn.addEventListener('click', function () {
    if (!bookingsData || bookingsData.length === 0) {
      alert('No booking records to export.');
      return;
    }

    var headers = ['Booking ID', 'Created At', 'Name', 'Phone', 'Email', 'Service', 'Date', 'Time', 'Status', 'Notes'];
    var rows = bookingsData.map(function (b) {
      return [
        b.id,
        b.created_at || '',
        '"' + (b.name || '').replace(/"/g, '""') + '"',
        b.phone || '',
        b.email || '',
        '"' + (b.service || '').replace(/"/g, '""') + '"',
        b.booking_date || '',
        b.booking_time || '',
        b.status || '',
        '"' + (b.notes || '').replace(/"/g, '""') + '"'
      ].join(',');
    });

    var csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(',')].concat(rows).join('\n');
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Shivani_Parlour_Bookings_' + new Date().toISOString().split('T')[0] + '.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // ---------- Search & Filters ----------
  searchInput.addEventListener('input', renderBookings);
  statusFilter.addEventListener('change', renderBookings);
  dateFilter.addEventListener('change', renderBookings);
  refreshBtn.addEventListener('click', loadData);

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function initDashboard() {
    loadData();
  }

  // Run on page load
  checkAuth();
})();
