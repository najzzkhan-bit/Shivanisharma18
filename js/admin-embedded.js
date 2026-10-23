// ==============================================================================
// Shivani Sharma's Parlour - Embedded Staff / Admin Dashboard
// ==============================================================================

(function () {
  'use strict';

  var bookingsData = [];
  var enquiriesData = [];
  var currentTab = 'bookings';

  // Fallback demo data if offline
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
      notes: 'Deep conditioning treatment for frizzy hair.',
      status: 'confirmed'
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
    }
  ];

  function initEmbeddedAdmin() {
    var fabBtn = document.getElementById('adminFabBtn');
    var footerLink = document.getElementById('footerAdminLink');
    var modal = document.getElementById('adminPanelModal');
    var closeBtn = document.getElementById('adminModalClose');

    var loginScreen = document.getElementById('adminLoginScreen');
    var dashboardScreen = document.getElementById('adminDashboardScreen');
    var authForm = document.getElementById('embeddedAuthForm');
    var passcodeInput = document.getElementById('embeddedPasscode');
    var authErr = document.getElementById('embeddedAuthErr');

    var tabBookings = document.getElementById('embTabBookings');
    var tabEnquiries = document.getElementById('embTabEnquiries');
    var bookingsTable = document.getElementById('embBookingsTable');
    var enquiriesTable = document.getElementById('embEnquiriesTable');

    var refreshBtn = document.getElementById('embRefreshBtn');
    var exportCsvBtn = document.getElementById('embExportCsvBtn');
    var logoutBtn = document.getElementById('embLogoutBtn');

    var searchInput = document.getElementById('embSearchInput');
    var statusFilter = document.getElementById('embStatusFilter');
    var dateFilter = document.getElementById('embDateFilter');

    var statTotal = document.getElementById('embStatTotal');
    var statPending = document.getElementById('embStatPending');
    var statConfirmed = document.getElementById('embStatConfirmed');
    var statEnq = document.getElementById('embStatEnq');
    var countBookings = document.getElementById('embCountBookings');
    var countEnquiries = document.getElementById('embCountEnquiries');

    var bookingsBody = document.getElementById('embBookingsBody');
    var enquiriesBody = document.getElementById('embEnquiriesBody');

    if (!modal) return;

    function openModal() {
      modal.hidden = false;
      document.body.style.overflow = 'hidden';
      var isAuth = sessionStorage.getItem('shivani_admin_authenticated') === 'true';
      if (isAuth) {
        loginScreen.hidden = true;
        dashboardScreen.hidden = false;
        loadData();
      } else {
        loginScreen.hidden = false;
        dashboardScreen.hidden = true;
        if (passcodeInput) {
          passcodeInput.value = '';
          authErr.textContent = '';
          passcodeInput.focus();
        }
      }
    }

    function closeModal() {
      modal.hidden = true;
      document.body.style.overflow = '';
    }

    if (fabBtn) fabBtn.addEventListener('click', openModal);
    if (footerLink) {
      footerLink.addEventListener('click', function (e) {
        e.preventDefault();
        openModal();
      });
    }
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hidden) closeModal();
    });

    // Handle Passcode Unlock
    if (authForm) {
      authForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var val = (passcodeInput.value || '').trim();
        var expected = (window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.adminPasscode) || 'shivani2026';
        if (val === expected) {
          sessionStorage.setItem('shivani_admin_authenticated', 'true');
          loginScreen.hidden = true;
          dashboardScreen.hidden = false;
          loadData();
        } else {
          authErr.textContent = 'Incorrect passcode. Try again.';
          passcodeInput.value = '';
          passcodeInput.focus();
        }
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', function () {
        sessionStorage.removeItem('shivani_admin_authenticated');
        loginScreen.hidden = false;
        dashboardScreen.hidden = true;
        if (passcodeInput) {
          passcodeInput.value = '';
          authErr.textContent = '';
          passcodeInput.focus();
        }
      });
    }

    // Tabs
    if (tabBookings && tabEnquiries) {
      tabBookings.addEventListener('click', function () {
        currentTab = 'bookings';
        tabBookings.classList.add('active');
        tabEnquiries.classList.remove('active');
        bookingsTable.hidden = false;
        enquiriesTable.hidden = true;
      });

      tabEnquiries.addEventListener('click', function () {
        currentTab = 'enquiries';
        tabEnquiries.classList.add('active');
        tabBookings.classList.remove('active');
        bookingsTable.hidden = true;
        enquiriesTable.hidden = false;
      });
    }

    // Fetch Data from Supabase
    function loadData() {
      var supabase = window.getSupabaseClient ? window.getSupabaseClient() : null;
      if (!supabase) {
        bookingsData = DEMO_BOOKINGS;
        enquiriesData = DEMO_ENQUIRIES;
        updateStats();
        renderBookings();
        renderEnquiries();
        return;
      }

      // Fetch Bookings
      supabase
        .from('bookings')
        .select('*')
        .order('booking_date', { ascending: false })
        .then(function (res) {
          if (!res.error && res.data) {
            bookingsData = res.data;
          } else {
            bookingsData = DEMO_BOOKINGS;
          }
          updateStats();
          renderBookings();
        })
        .catch(function () {
          bookingsData = DEMO_BOOKINGS;
          updateStats();
          renderBookings();
        });

      // Fetch Enquiries
      supabase
        .from('enquiries')
        .select('*')
        .order('created_at', { ascending: false })
        .then(function (res) {
          if (!res.error && res.data) {
            enquiriesData = res.data;
          } else {
            enquiriesData = DEMO_ENQUIRIES;
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

    function updateStats() {
      var total = bookingsData.length;
      var pending = bookingsData.filter(function (b) { return b.status === 'pending'; }).length;
      var confirmed = bookingsData.filter(function (b) { return b.status === 'confirmed'; }).length;
      var enqCount = enquiriesData.length;

      if (statTotal) statTotal.textContent = total;
      if (statPending) statPending.textContent = pending;
      if (statConfirmed) statConfirmed.textContent = confirmed;
      if (statEnq) statEnq.textContent = enqCount;

      if (countBookings) countBookings.textContent = total;
      if (countEnquiries) countEnquiries.textContent = enqCount;
    }

    function renderBookings() {
      if (!bookingsBody) return;
      var q = (searchInput ? searchInput.value : '').trim().toLowerCase();
      var sf = statusFilter ? statusFilter.value : 'all';
      var df = dateFilter ? dateFilter.value : 'all';
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
        bookingsBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2rem; color: var(--grey);">No bookings found.</td></tr>';
        return;
      }

      var html = '';
      filtered.forEach(function (b) {
        var dateDisplay = b.booking_date || 'TBD';
        var isToday = b.booking_date === todayStr;
        var cleanPhone = (b.phone || '').replace(/[\s\-]/g, '');

        var waMsg = encodeURIComponent(
          'Hello ' + b.name + ',\n\nThis is Shivani Sharma from Shivani Sharma\'s Parlour, Pune.\n' +
          'Regarding your appointment request for ' + b.service + ' on ' + dateDisplay + ' (' + (b.booking_time || 'scheduled slot') + '):\n' +
          'We are pleased to confirm your booking! Please feel free to ask if you have any questions.\n\nThank you!'
        );

        var waLink = 'https://wa.me/91' + cleanPhone + '?text=' + waMsg;
        var callLink = 'tel:+91' + cleanPhone;

        html += 
          '<tr data-id="' + b.id + '">' +
            '<td>' +
              '<div style="font-weight:600; color:var(--gold-light);">' + escapeHtml(dateDisplay) + '</div>' +
              '<div style="font-size:0.75rem; color:var(--grey);">' + escapeHtml(b.booking_time || 'Anytime') + '</div>' +
              (isToday ? '<span class="admin-badge confirmed" style="font-size:0.62rem; margin-top:2px;">TODAY</span>' : '') +
            '</td>' +
            '<td>' +
              '<div style="font-weight:600;">' + escapeHtml(b.name) + '</div>' +
              '<div style="font-size:0.75rem; color:var(--gold);">' + escapeHtml(b.phone) + '</div>' +
              (b.email ? '<div style="font-size:0.72rem; color:var(--grey);">' + escapeHtml(b.email) + '</div>' : '') +
            '</td>' +
            '<td><span style="color:var(--ivory); font-weight:500;">' + escapeHtml(b.service) + '</span></td>' +
            '<td><div style="max-width:220px; font-size:0.75rem; color:var(--grey); line-height:1.35;">' + escapeHtml(b.notes || '—') + '</div></td>' +
            '<td>' +
              '<select class="admin-status-dropdown" data-id="' + b.id + '">' +
                '<option value="pending"' + (b.status === 'pending' ? ' selected' : '') + '>⏳ Pending</option>' +
                '<option value="confirmed"' + (b.status === 'confirmed' ? ' selected' : '') + '>✅ Confirmed</option>' +
                '<option value="completed"' + (b.status === 'completed' ? ' selected' : '') + '>💅 Completed</option>' +
                '<option value="cancelled"' + (b.status === 'cancelled' ? ' selected' : '') + '>❌ Cancelled</option>' +
              '</select>' +
            '</td>' +
            '<td>' +
              '<div class="admin-action-btns">' +
                '<a href="' + waLink + '" target="_blank" rel="noopener" class="btn-xs-wa" title="WhatsApp Customer">💬 WhatsApp</a>' +
                '<a href="' + callLink + '" class="btn-xs-call" title="Call Customer">📞 Call</a>' +
              '</div>' +
            '</td>' +
          '</tr>';
      });

      bookingsBody.innerHTML = html;

      // Status change listeners
      bookingsBody.querySelectorAll('.admin-status-dropdown').forEach(function (sel) {
        sel.addEventListener('change', function () {
          var id = sel.dataset.id;
          var newStatus = sel.value;
          updateStatus(id, newStatus);
        });
      });
    }

    function updateStatus(id, newStatus) {
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
            if (res.error) console.warn('Supabase status update error:', res.error);
          });
      }
    }

    function renderEnquiries() {
      if (!enquiriesBody) return;
      if (enquiriesData.length === 0) {
        enquiriesBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 2rem; color: var(--grey);">No customer enquiries found.</td></tr>';
        return;
      }

      var html = '';
      enquiriesData.forEach(function (e) {
        var dateStr = e.created_at ? new Date(e.created_at).toLocaleDateString() : 'Recent';
        var cleanContact = (e.contact || '').replace(/[\s\-]/g, '');
        var isPhone = /^(\+91)?[6-9]\d{9}$/.test(cleanContact);

        var waLink = isPhone
          ? 'https://wa.me/91' + cleanContact.replace(/^\+91/, '') + '?text=' + encodeURIComponent('Hello ' + e.name + ', regarding your enquiry for ' + e.service + ' at Shivani Sharma\'s Parlour:')
          : 'https://wa.me/919579199431';

        var mailLink = 'mailto:' + encodeURIComponent(e.contact) + '?subject=' + encodeURIComponent('Shivani Sharma Parlour - ' + e.service);

        html +=
          '<tr>' +
            '<td><span style="font-size:0.75rem; color:var(--grey);">' + dateStr + '</span></td>' +
            '<td><strong>' + escapeHtml(e.name) + '</strong></td>' +
            '<td><span style="color:var(--gold);">' + escapeHtml(e.contact) + '</span></td>' +
            '<td><span>' + escapeHtml(e.service) + '</span></td>' +
            '<td><div style="max-width:280px; font-size:0.78rem; line-height:1.35;">' + escapeHtml(e.message) + '</div></td>' +
            '<td>' +
              '<div class="admin-action-btns">' +
                (isPhone ? '<a href="' + waLink + '" target="_blank" rel="noopener" class="btn-xs-wa">💬 WhatsApp</a>' : '') +
                '<a href="' + mailLink + '" class="btn-xs-call">✉ Email</a>' +
              '</div>' +
            '</td>' +
          '</tr>';
      });

      enquiriesBody.innerHTML = html;
    }

    // CSV Export
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', function () {
        if (!bookingsData || bookingsData.length === 0) {
          alert('No bookings to export.');
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
        link.setAttribute('download', 'Shivani_Bookings_' + new Date().toISOString().split('T')[0] + '.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    }

    if (refreshBtn) refreshBtn.addEventListener('click', loadData);
    if (searchInput) searchInput.addEventListener('input', renderBookings);
    if (statusFilter) statusFilter.addEventListener('change', renderBookings);
    if (dateFilter) dateFilter.addEventListener('change', renderBookings);

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEmbeddedAdmin);
  } else {
    initEmbeddedAdmin();
  }
})();
