const connectDB = async () => {
  try {
    console.log('ℹ️ Using Supabase for application data. MongoDB connection is no longer required for startup.');
    return true;
  } catch (error) {
    console.error(`❌ Supabase initialization error: ${error.message}`);
    return false;
  }
};

module.exports = connectDB;
