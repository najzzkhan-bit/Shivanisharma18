// ==============================================================================
// Shivani Sharma's Parlour - Supabase Backend Configuration
// ==============================================================================

window.SUPABASE_CONFIG = {
  // 1. Your Supabase Project URL
  url: 'https://dfdcydpryengwxffkaqz.supabase.co',

  // 2. Your Supabase Project 'anon' public publishable API key
  anonKey: 'sb_publishable_nBydZXsOlC8aDMbVDz_cug_lq7vHjCh',

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
  if (!cfg || !cfg.url || !cfg.anonKey || cfg.anonKey.indexOf('YOUR_SUPABASE_ANON_KEY') !== -1) {
    // Waiting for anon key from user
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
