const { createClient } = require('@supabase/supabase-js');

// Debug environment variables
console.log('🔍 Auth Middleware Environment Check:', {
  hasSupabaseUrl: !!process.env.SUPABASE_URL,
  hasSupabaseKey: !!process.env.SUPABASE_KEY,
  supabaseUrl: process.env.SUPABASE_URL ? 'Set' : 'Missing',
  supabaseKey: process.env.SUPABASE_KEY ? 'Set' : 'Missing'
});

// Create Supabase client for auth verification
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const authenticateUser = async (req, res, next) => {
  try {
    console.log('🔍 Auth Middleware Debug:', {
      url: req.url,
      method: req.method,
      hasAuthHeader: !!req.headers.authorization,
      authHeaderPreview: req.headers.authorization ? `${req.headers.authorization.substring(0, 30)}...` : 'No header'
    });

    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid auth header found');
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log('🔑 Token extracted, length:', token.length);
    
    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error('❌ Token verification failed:', error);
      return res.status(401).json({ error: 'Invalid token' });
    }

    console.log('✅ User authenticated:', user.id);
    
    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

module.exports = { authenticateUser }; 