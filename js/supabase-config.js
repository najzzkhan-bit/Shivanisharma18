// ==============================================================================
// Shivani Sharma's Parlour - Supabase Backend Configuration
// ==============================================================================

window.SUPABASE_CONFIG = {
  // 1. Replace with your Supabase Project URL (e.g. 'https://abcdefghijklm.supabase.co')
  url: 'https://YOUR_SUPABASE_PROJECT_URL.supabase.co',

  // 2. Replace with your Supabase Project 'anon' public API key
  anonKey: 'YOUR_SUPABASE_ANON_KEY',

  // 3. Admin Dashboard Passcode (Change this to whatever PIN you prefer)
  adminPasscode: 'shivani2026'
};

/**
 * Returns an initialized Supabase Client if credentials are provided,
 * otherwise returns null and logs an informational warning.
 */
window.getSupabaseClient = function () {
  if (window._supabaseClientInstance) {
    return window._supabaseClientInstance;
  }

  var cfg = window.SUPABASE_CONFIG;
  if (!cfg || !cfg.url || !cfg.anonKey || cfg.url.indexOf('YOUR_SUPABASE_PROJECT_URL') !== -1) {
    // Config not yet updated with real credentials
    return null;
  }

  if (window.supabase && typeof window.supabase.createClient === 'function') {
    try {
      window._supabaseClientInstance = window.supabase.createClient(cfg.url, cfg.anonKey);
      return window._supabaseClientInstance;
    } catch (e) {
      console.warn('Could not initialize Supabase client:', e);
      return null;
    }
  }

  return null;
};
